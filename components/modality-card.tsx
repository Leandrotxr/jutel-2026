import { TEAM_BY_ID } from "@/constants/teams";
import { championOf } from "@/lib/bracket";
import type { Modality, ResolvedMatch } from "@/lib/types";
import Link from "next/link";

export function ModalityCard({
  modality,
  matches,
}: {
  modality: Modality;
  matches: ResolvedMatch[];
}) {
  const played = matches.filter((match) => match.status === "played").length;
  const champion = championOf(matches);
  const championTeam = champion ? TEAM_BY_ID[champion] : null;

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
        ) : (
          <span className="rounded-full bg-[#3ecfcf]/15 px-2 py-1 text-[11px] text-[#9ff6f6]">
            {played}/{matches.length} jogos
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-white/60">
        {championTeam
          ? `Campeão: ${championTeam.shortName}`
          : modality.excludedNote
            ? modality.excludedNote
            : modality.format === "em-breve"
              ? "Em breve"
              : `${played} jogo${played === 1 ? "" : "s"} lançado${played === 1 ? "" : "s"}`}
      </p>
    </Link>
  );
}
