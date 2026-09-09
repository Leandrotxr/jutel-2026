"use client";

import { MatchCard } from "@/components/match-card";
import { StandingsTable } from "@/components/standings-table";
import type { Modality, ResolvedMatch, StandingRow } from "@/lib/types";
import { useState } from "react";

export function GroupStage({
  modality,
  matches,
  standings,
  onOpen,
}: {
  modality: Modality;
  matches: ResolvedMatch[];
  standings: StandingRow[];
  onOpen: (match: ResolvedMatch) => void;
}) {
  const groupMatches = matches
    .filter((match) => match.round === "group")
    .sort((a, b) => a.slot - b.slot);
  const played = groupMatches.filter((match) => match.status === "played").length;
  const [onlyOpen, setOnlyOpen] = useState(false);
  const visible = onlyOpen
    ? groupMatches.filter((match) => match.status !== "played")
    : groupMatches;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-white">
            Fase de grupos
          </h2>
          <p className="mt-1 text-sm text-white/55">
            {played}/{groupMatches.length} jogos
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOnlyOpen((value) => !value)}
          className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70"
        >
          {onlyOpen ? "Ver todos" : "Só pendentes"}
        </button>
      </div>

      <StandingsTable
        rows={standings}
        chess={modality.format === "round-robin"}
      />

      <div className="grid gap-3 md:grid-cols-2">
        {visible.map((match) => (
          <MatchCard key={match.id} match={match} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}
