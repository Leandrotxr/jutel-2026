"use client";

import { SwimTimeModal } from "@/components/swim-time-modal";
import { TeamAvatar } from "@/components/team-avatar";
import { SWIMMING_EVENTS, SWIMMING_MEET } from "@/constants/swimming";
import { TEAM_BY_ID } from "@/constants/teams";
import { useAuth } from "@/contexts/auth";
import { useTournament } from "@/contexts/tournament";
import { formatDate, formatTime } from "@/lib/bracket";
import { POINTS_COLETIVA, POINTS_INDIVIDUAL } from "@/lib/ranking";
import {
  formatSwimTime,
  rankSwimEvent,
  swimResultKey,
  swimmingEventsPlayed,
  swimmingLeader,
  swimmingOverall,
} from "@/lib/swimming";
import type { Modality, SwimEvent, TeamId } from "@/lib/types";
import { useMemo, useState } from "react";

export function SwimmingView({ modality }: { modality: Modality }) {
  const { swimResults, saveSwimResult, clearSwimResult } = useTournament();
  const { canEditScores } = useAuth();
  const [selected, setSelected] = useState<{ event: SwimEvent; teamId: TeamId } | null>(null);

  const overall = useMemo(
    () => swimmingOverall(modality.id, swimResults),
    [modality.id, swimResults],
  );
  const leaderId = swimmingLeader(modality.id, swimResults);
  const leader = leaderId ? TEAM_BY_ID[leaderId] : null;
  const eventsPlayed = swimmingEventsPlayed(modality.id, swimResults);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#e8c36a]">
          {modality.group} · {modality.gender} · provas de tempo
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl text-white">{modality.name}</h1>
        <p className="mt-2 text-sm text-white/60">
          {formatDate(SWIMMING_MEET.date)} · {SWIMMING_MEET.venue} · aquecimento {formatTime(SWIMMING_MEET.warmup)} ·
          provas {formatTime(SWIMMING_MEET.start)}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/60">
          <span className="rounded-full border border-white/10 px-3 py-1">
            Individuais {POINTS_INDIVIDUAL.join(" · ")}
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1">
            Revezamento {POINTS_COLETIVA.join(" · ")}
          </span>
        </div>
      </div>

      {leader ? (
        <div className="wonder-card border-[#e8c36a]/40 px-4 py-3 text-sm text-[#e8c36a]">
          {eventsPlayed === 6 ? "Campeã" : "Líder"}: <strong>{leader.shortName}</strong> · {leader.name}
        </div>
      ) : null}

      <section className="wonder-card overflow-hidden">
        <div className="border-b border-white/10 px-4 py-3">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-white">Classificação da natação</h2>
          <p className="mt-1 text-sm text-white/55">Soma das provas individuais e do revezamento.</p>
        </div>
        <div className="divide-y divide-white/8">
          {[...overall]
            .sort((a, b) => (a.place ?? 99) - (b.place ?? 99))
            .map((row) => {
              const team = TEAM_BY_ID[row.teamId];
              return (
                <div key={row.teamId} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-8 font-[family-name:var(--font-display)] text-xl text-[#e8c36a]">
                    {row.place ? `${row.place}º` : "—"}
                  </span>
                  <TeamAvatar teamId={row.teamId} size={36} />
                  <span className="flex-1 font-medium text-white">{team.shortName}</span>
                  <span className="text-xs text-white/50">{row.golds} ouro</span>
                  <span className="font-[family-name:var(--font-display)] text-2xl text-[#e8c36a]">{row.net}</span>
                </div>
              );
            })}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {SWIMMING_EVENTS.map((event) => {
          const standings = rankSwimEvent(modality.id, event, swimResults).sort(
            (a, b) => (a.place ?? 99) - (b.place ?? 99),
          );
          return (
            <section key={event.id} className="wonder-card overflow-hidden">
              <div className="flex items-start justify-between gap-3 px-4 py-3">
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-xl text-white">{event.name}</h3>
                  <p className="text-xs text-white/50">
                    {event.kind === "coletiva" ? "Pontuação coletiva" : "Pontuação individual"}
                  </p>
                </div>
              </div>
              <div className="divide-y divide-white/8">
                {standings.map((row) => {
                  const team = TEAM_BY_ID[row.teamId];
                  const clickable = canEditScores;
                  const body = (
                    <>
                      <span className="w-8 text-sm text-[#e8c36a]">{row.place ? `${row.place}º` : "—"}</span>
                      <TeamAvatar teamId={row.teamId} size={28} />
                      <span className="min-w-0 flex-1 truncate text-sm text-white">{team.shortName}</span>
                      <span className="text-sm tabular-nums text-white/80">
                        {row.walkover
                          ? "W.O."
                          : row.dns
                            ? "NL"
                            : typeof row.timeCs === "number"
                              ? formatSwimTime(row.timeCs)
                              : "—"}
                        {row.tied ? <span className="ml-1 text-[10px] text-[#e8c36a]">empate</span> : null}
                      </span>
                      <span className="w-8 text-right text-sm text-[#e8c36a]">{row.net || "—"}</span>
                    </>
                  );
                  if (!clickable) {
                    return (
                      <div key={row.teamId} className="flex items-center gap-2 px-4 py-2.5">
                        {body}
                      </div>
                    );
                  }
                  return (
                    <button
                      key={row.teamId}
                      type="button"
                      onClick={() => setSelected({ event, teamId: row.teamId })}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition hover:bg-white/5"
                    >
                      {body}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {selected ? (
        <SwimTimeModal
          event={selected.event}
          teamId={selected.teamId}
          result={swimResults[swimResultKey(modality.id, selected.event.id, selected.teamId)]}
          onClose={() => setSelected(null)}
          onSave={(result) => saveSwimResult(modality.id, selected.event.id, selected.teamId, result)}
          onClear={() => clearSwimResult(modality.id, selected.event.id, selected.teamId)}
        />
      ) : null}
    </div>
  );
}
