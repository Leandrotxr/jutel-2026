import { TEAM_BY_ID } from "@/constants/teams";
import { championOf } from "@/lib/bracket";
import { swimmingEventsPlayed, swimmingLeader } from "@/lib/swimming";
import type { Modality, ResolvedMatch, SwimResult } from "@/lib/types";
import Link from "next/link";

export function ModalityCard({
  modality,
  matches,
  swimResults = {},
}: {
  modality: Modality;
  matches: ResolvedMatch[];
  swimResults?: Record<string, SwimResult>;
}) {
  const played = matches.filter((match) => match.status === "played").length;
  const champion =
    modality.format === "natacao" ? swimmingLeader(modality.id, swimResults) : championOf(matches);
  const championTeam = champion ? TEAM_BY_ID[champion] : null;
  const swimPlayed = modality.format === "natacao" ? swimmingEventsPlayed(modality.id, swimResults) : 0;

  return (
    <Link
      href={`/modalidades/${modality.slug}`}
      className="wonder-card group p-4 transition hover:-translate-y-0.5 hover:border-[#3ecfcf]/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#e8c36a]">
            {modality.group} · {modality.gender}
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl text-white">
            {modality.name}
          </h3>
        </div>
        {modality.format === "em-breve" ? (
          <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/70">
            Em breve
          </span>
        ) : modality.format === "natacao" ? (
          <span className="rounded-full bg-[#3ecfcf]/15 px-2 py-1 text-[11px] text-[#9ff6f6]">
            {swimPlayed}/6 provas
          </span>
        ) : (
          <span className="rounded-full bg-[#3ecfcf]/15 px-2 py-1 text-[11px] text-[#9ff6f6]">
            {played}/{matches.length} jogos
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-white/60">
        {championTeam
          ? `${modality.format === "natacao" && swimPlayed < 6 ? "Líder" : "Campeão"}: ${championTeam.shortName}`
          : modality.format === "em-breve"
            ? "Em breve"
            : modality.format === "natacao"
              ? `${swimPlayed} prova${swimPlayed === 1 ? "" : "s"} lançada${swimPlayed === 1 ? "" : "s"}`
              : `${played} jogo${played === 1 ? "" : "s"} lançado${played === 1 ? "" : "s"}`}
      </p>
    </Link>
  );
}
