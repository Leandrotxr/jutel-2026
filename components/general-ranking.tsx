"use client";

import { TeamAvatar } from "@/components/team-avatar";
import { TEAM_BY_ID } from "@/constants/teams";
import { computeGeneralRanking, POINTS_COLETIVA, POINTS_INDIVIDUAL } from "@/lib/ranking";
import type { ResolvedMatch } from "@/lib/types";
import { useMemo, useState } from "react";

export function GeneralRanking({ matches }: { matches: ResolvedMatch[] }) {
  const ranking = useMemo(() => computeGeneralRanking(matches), [matches]);
  const [open, setOpen] = useState<string | null>(ranking[0]?.teamId ?? null);

  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#e8c36a]">Classificação geral</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-white">
          Tabela do JUTEL
        </h2>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-white/60">
        <span className="rounded-full border border-white/10 px-3 py-1">
          Coletiva {POINTS_COLETIVA.join(" · ")}
        </span>
        <span className="rounded-full border border-white/10 px-3 py-1">
          Individual/dupla {POINTS_INDIVIDUAL.join(" · ")}
        </span>
      </div>

      <div className="space-y-2">
        {ranking.map((entry, index) => {
          const team = TEAM_BY_ID[entry.teamId];
          const expanded = open === entry.teamId;
          return (
            <div key={entry.teamId} className="wonder-card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : entry.teamId)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span className="w-8 font-[family-name:var(--font-display)] text-xl text-[#e8c36a]">
                  {index + 1}º
                </span>
                <TeamAvatar teamId={entry.teamId} size={40} />
                <span className="flex-1 font-semibold text-white">{team.shortName}</span>
                <span className="text-xs text-white/50">
                  {entry.firstCollective} ouro coletiva · {entry.firstIndividual} ouro ind.
                </span>
                <span className="font-[family-name:var(--font-display)] text-2xl text-[#e8c36a]">
                  {entry.total}
                </span>
              </button>
              {expanded ? (
                <div className="border-t border-white/10 px-4 py-3">
                  <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                    {entry.breakdown.map((item) => (
                      <div
                        key={item.modality.id}
                        className="flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-sm"
                      >
                        <span className="truncate text-white/70">{item.modality.shortName}</span>
                        <span className="shrink-0 tabular-nums text-white">
                          {item.place ? `${item.place}º` : "—"}{" "}
                          <span className={item.net < 0 ? "text-rose-300" : "text-[#e8c36a]"}>
                            {item.net}
                          </span>
                          {item.penalty ? (
                            <span className="ml-1 text-[11px] text-rose-300">WO -{item.penalty}</span>
                          ) : null}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
