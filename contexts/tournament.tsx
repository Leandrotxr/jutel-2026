"use client";

import { MATCHES } from "@/constants/matches";
import { resolveMatches } from "@/lib/bracket";
import {
  loadLocalResults,
  loadRemoteResults,
  saveLocalResults,
  upsertRemoteResult,
} from "@/lib/storage";
import type { MatchResult, ResolvedMatch } from "@/lib/types";
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
  saveResult: (matchId: string, result: MatchResult) => Promise<void>;
  clearResult: (matchId: string) => Promise<void>;
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

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<Record<string, MatchResult>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const local = loadLocalResults();
      const remote = await loadRemoteResults();
      if (cancelled) return;
      setResults(remote && Object.keys(remote).length > 0 ? remote : local);
      setReady(true);
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: Record<string, MatchResult>, changedIds: string[]) => {
    setResults(next);
    saveLocalResults(next);
    await Promise.all(
      changedIds.map((id) => upsertRemoteResult(id, next[id] ?? null)),
    );
  }, []);

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

  const matches = useMemo(() => resolveMatches(MATCHES, results), [results]);

  const value = useMemo(
    () => ({ results, matches, saveResult, clearResult, ready }),
    [results, matches, saveResult, clearResult, ready],
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
