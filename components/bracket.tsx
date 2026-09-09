"use client";

import { GroupStage } from "@/components/group-stage";
import { MatchCard } from "@/components/match-card";
import { ScoreModal } from "@/components/score-modal";
import { TEAM_BY_ID } from "@/constants/teams";
import { championOf } from "@/lib/bracket";
import { computeStandings } from "@/lib/standings";
import type { Modality, ResolvedMatch } from "@/lib/types";
import { useState } from "react";

const COLUMNS: { key: ResolvedMatch["round"]; title: string }[] = [
  { key: "qf", title: "Quartas" },
  { key: "sf", title: "Semifinais" },
  { key: "final", title: "Final" },
];

export function Bracket({
  modality,
  matches,
  onSave,
  onClear,
}: {
  modality: Modality;
  matches: ResolvedMatch[];
  onSave: (matchId: string, result: { scoreA: number; scoreB: number; walkover?: boolean }) => Promise<void>;
  onClear: (matchId: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState<ResolvedMatch | null>(null);
  const champion = championOf(matches);
  const championTeam = champion ? TEAM_BY_ID[champion] : null;
  const standings = computeStandings(
    matches,
    undefined,
    modality.format === "round-robin"
      ? { chessRules: true, qualifyTop: 6 }
      : undefined,
  );
  const knockout = matches.filter((match) => match.round !== "group");
  const hasGroups = matches.some((match) => match.round === "group");

  return (
    <div className="space-y-10">
      {championTeam ? (
        <div className="wonder-card border-[#e8c36a]/40 px-4 py-3 text-sm text-[#e8c36a]">
          Campeão: <strong>{championTeam.shortName}</strong> · {championTeam.name}
        </div>
      ) : null}

      {hasGroups ? (
        <GroupStage
          modality={modality}
          matches={matches}
          standings={standings}
          onOpen={setSelected}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((column) => {
          const roundMatches = knockout.filter((match) => match.round === column.key);
          if (roundMatches.length === 0) return null;
          return (
            <section key={column.key} className="space-y-3">
              <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
                {column.title}
              </h2>
              {roundMatches.map((match) => (
                <MatchCard key={match.id} match={match} onOpen={setSelected} />
              ))}
            </section>
          );
        })}
      </div>

      {selected ? (
        <ScoreModal
          match={selected}
          modality={modality}
          onClose={() => setSelected(null)}
          onSave={(result) => onSave(selected.id, result)}
          onClear={() => onClear(selected.id)}
        />
      ) : null}
    </div>
  );
}
