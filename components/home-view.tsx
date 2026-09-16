"use client";

import { GeneralRanking } from "@/components/general-ranking";
import { ModalityCard } from "@/components/modality-card";
import { TeamAvatar } from "@/components/team-avatar";
import { MODALITIES, MODALITY_GROUPS } from "@/constants/modalities";
import { TEAMS } from "@/constants/teams";
import { useAuth } from "@/contexts/auth";
import { useTournament } from "@/contexts/tournament";
import { useMemo, useState } from "react";

const FILTERS = ["todas", "masculino", "feminino", "misto"] as const;

export function HomeView() {
  const { matches, swimResults } = useTournament();
  const { ready, canViewGeneralRanking } = useAuth();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("todas");

  const visible = useMemo(
    () =>
      MODALITIES.filter((modality) => filter === "todas" || modality.gender === filter),
    [filter],
  );

  return (
    <div className="space-y-10">
      <section>
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#e8c36a]">
          Jogos Universitários do Inatel
        </p>
        <h1 className="mt-2 max-w-3xl font-[family-name:var(--font-display)] text-5xl leading-tight text-white sm:text-6xl">
          JUTEL 2026
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-[#d7c4ff]">
          Down the rabbit hole · chaveamento, grupos e placar das atléticas.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {TEAMS.map((team) => (
            <span
              key={team.id}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 pr-3 text-xs text-white/80"
            >
              <TeamAvatar teamId={team.id} size={28} />
              {team.shortName}
            </span>
          ))}
        </div>
      </section>

      {ready && canViewGeneralRanking ? <GeneralRanking matches={matches} swimResults={swimResults} /> : null}

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-white">
            Modalidades
          </h2>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full px-3 py-1 text-xs capitalize ${
                  filter === item
                    ? "bg-[#e8c36a] text-[#1a0b32]"
                    : "bg-white/8 text-white/70"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {MODALITY_GROUPS.map((group) => {
            const items = visible.filter((modality) => modality.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <h3 className="mb-3 text-sm uppercase tracking-[0.18em] text-[#d7c4ff]/60">
                  {group}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((modality) => (
                    <ModalityCard
                      key={modality.id}
                      modality={modality}
                      matches={matches.filter((match) => match.modalityId === modality.id)}
                      swimResults={swimResults}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
