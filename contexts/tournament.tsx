"use client";

import { MATCHES } from "@/constants/matches";
import { useAuth } from "@/contexts/auth";
import { resolveMatches } from "@/lib/bracket";
import {
  loadLocalResults,
  loadLocalSchedule,
  loadLocalSwimResults,
  loadRemoteResults,
  loadRemoteSchedule,
  loadRemoteSwimResults,
  saveLocalResults,
  saveLocalSchedule,
  saveLocalSwimResults,
  upsertRemoteResult,
  upsertRemoteSchedule,
  upsertRemoteSwimResult,
} from "@/lib/storage";
import { swimResultKey } from "@/lib/swimming";
import type { MatchResult, MatchSchedule, MatchSeed, ResolvedMatch, SwimResult, TeamId } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type TournamentContextValue = {
  results: Record<string, MatchResult>;
  matches: ResolvedMatch[];
  swimResults: Record<string, SwimResult>;
  saveResult: (matchId: string, result: MatchResult) => Promise<void>;
  clearResult: (matchId: string) => Promise<void>;
  saveSchedule: (matchId: string, schedule: MatchSchedule) => Promise<void>;
  saveSwimResult: (modalityId: string, eventId: string, teamId: TeamId, result: SwimResult) => Promise<void>;
  clearSwimResult: (modalityId: string, eventId: string, teamId: TeamId) => Promise<void>;
  ready: boolean;
};

const TournamentContext = createContext<TournamentContextValue | null>(null);

function descendantIds(matchId: string) {
  const origin = MATCHES.find((match) => match.id === matchId);
  const ids: string[] = [];
  const visit = (id: string) => {
    for (const match of MATCHES) {
      if (match.sourceA === id || match.sourceB === id) {
        ids.push(match.id);
        visit(match.id);
      }
    }
  };
  visit(matchId);
  if (origin?.round === "group") {
    for (const match of MATCHES) {
      if (
        match.modalityId === origin.modalityId &&
        (match.round === "sf" || match.round === "final")
      ) {
        ids.push(match.id);
      }
    }
  }
  return [...new Set(ids)];
}

function applySchedule(seeds: MatchSeed[], schedule: Record<string, MatchSchedule>): MatchSeed[] {
  return seeds.map((seed) => {
    const override = schedule[seed.id];
    if (!override) return seed;
    return {
      ...seed,
      date: override.date,
      time: override.time,
      venue: override.venue,
    };
  });
}

export function TournamentProvider({ children }: { children: ReactNode }) {
  const { canEditScores, canManageSchedule } = useAuth();
  const [results, setResults] = useState<Record<string, MatchResult>>({});
  const [schedule, setSchedule] = useState<Record<string, MatchSchedule>>({});
  const [swimResults, setSwimResults] = useState<Record<string, SwimResult>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const local = loadLocalResults();
      const localSchedule = loadLocalSchedule();
      const localSwim = loadLocalSwimResults();
      const [remote, remoteSchedule, remoteSwim] = await Promise.all([
        loadRemoteResults(),
        loadRemoteSchedule(),
        loadRemoteSwimResults(),
      ]);
      if (cancelled) return;
      setResults(remote && Object.keys(remote).length > 0 ? remote : local);
      setSchedule(remoteSchedule ?? localSchedule);
      setSwimResults(remoteSwim ?? localSwim);
      setReady(true);
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(
    async (next: Record<string, MatchResult>, changedIds: string[]) => {
      if (!canEditScores) {
        throw new Error("Sem permissão para alterar placares.");
      }
      const previous = results;
      setResults(next);
      saveLocalResults(next);
      try {
        await Promise.all(changedIds.map((id) => upsertRemoteResult(id, next[id] ?? null)));
      } catch (error) {
        setResults(previous);
        saveLocalResults(previous);
        throw error;
      }
    },
    [canEditScores, results],
  );

  const saveSchedule = useCallback(
    async (matchId: string, nextSchedule: MatchSchedule) => {
      if (!canManageSchedule) {
        throw new Error("Somente diretores podem alterar horário e local.");
      }
      const previous = schedule;
      const next = { ...schedule, [matchId]: nextSchedule };
      setSchedule(next);
      saveLocalSchedule(next);
      try {
        await upsertRemoteSchedule(matchId, nextSchedule);
      } catch (error) {
        setSchedule(previous);
        saveLocalSchedule(previous);
        throw error;
      }
    },
    [canManageSchedule, schedule],
  );

  const persistSwim = useCallback(
    async (key: string, eventId: string, teamId: TeamId, result: SwimResult | null) => {
      if (!canEditScores) {
        throw new Error("Sem permissão para alterar resultados.");
      }
      const previous = swimResults;
      const next = { ...swimResults };
      if (result) next[key] = result;
      else delete next[key];
      setSwimResults(next);
      saveLocalSwimResults(next);
      try {
        await upsertRemoteSwimResult(eventId, teamId, result);
      } catch (error) {
        setSwimResults(previous);
        saveLocalSwimResults(previous);
        throw error;
      }
    },
    [canEditScores, swimResults],
  );

  const saveSwimResult = useCallback(
    async (modalityId: string, eventId: string, teamId: TeamId, result: SwimResult) => {
      await persistSwim(swimResultKey(modalityId, eventId, teamId), `${modalityId}:${eventId}`, teamId, result);
    },
    [persistSwim],
  );

  const clearSwimResult = useCallback(
    async (modalityId: string, eventId: string, teamId: TeamId) => {
      await persistSwim(swimResultKey(modalityId, eventId, teamId), `${modalityId}:${eventId}`, teamId, null);
    },
    [persistSwim],
  );

  const saveResult = useCallback(
    async (matchId: string, result: MatchResult) => {
      const next = { ...results, [matchId]: result };
      const changed = [matchId];
      for (const id of descendantIds(matchId)) {
        if (next[id]) {
          delete next[id];
          changed.push(id);
        }
      }
      await persist(next, changed);
    },
    [persist, results],
  );

  const clearResult = useCallback(
    async (matchId: string) => {
      const next = { ...results };
      const changed = [matchId];
      delete next[matchId];
      for (const id of descendantIds(matchId)) {
        if (next[id]) {
          delete next[id];
          changed.push(id);
        }
      }
      await persist(next, changed);
    },
    [persist, results],
  );

  const matches = useMemo(
    () => resolveMatches(applySchedule(MATCHES, schedule), results),
    [results, schedule],
  );

  const value = useMemo(
    () => ({
      results,
      matches,
      swimResults,
      saveResult,
      clearResult,
      saveSchedule,
      saveSwimResult,
      clearSwimResult,
      ready,
    }),
    [results, matches, swimResults, saveResult, clearResult, saveSchedule, saveSwimResult, clearSwimResult, ready],
  );

  return (
    <TournamentContext.Provider value={value}>{children}</TournamentContext.Provider>
  );
}

export function useTournament() {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error("useTournament deve ser usado dentro de TournamentProvider");
  }
  return context;
}

export function useModalityMatches(modalityId: string) {
  const { matches, ...rest } = useTournament();
  return {
    ...rest,
    matches: matches.filter((match) => match.modalityId === modalityId),
  };
}
