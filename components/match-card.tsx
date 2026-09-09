"use client";

import { TeamAvatar } from "@/components/team-avatar";
import { TEAM_BY_ID } from "@/constants/teams";
import { formatDate, ROUND_LABEL } from "@/lib/bracket";
import type { ResolvedMatch } from "@/lib/types";

export function MatchCard({
  match,
  onOpen,
}: {
  match: ResolvedMatch;
  onOpen: (match: ResolvedMatch) => void;
}) {
  const clickable = match.status !== "pending";
  const teamA = match.resolvedA ? TEAM_BY_ID[match.resolvedA] : null;
  const teamB = match.resolvedB ? TEAM_BY_ID[match.resolvedB] : null;
  const seedLabel =
    match.seedA && match.seedB ? `${match.seedA}º x ${match.seedB}º` : null;

  return (
    <button
      type="button"
      onClick={() => clickable && onOpen(match)}
      disabled={!clickable}
      className="wonder-card w-full p-3 text-left transition enabled:hover:border-[#3ecfcf]/60 enabled:hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-[#d7c4ff]/70">
        <span>
          {ROUND_LABEL[match.round]}
          {seedLabel ? ` · ${seedLabel}` : ""}
          {match.gameNumber ? ` · JG ${match.gameNumber}` : ` · Jogo ${match.slot}`}
        </span>
        <span className={match.status === "played" ? "text-[#e8c36a]" : ""}>
        {match.status === "played"
          ? match.result &&
            typeof match.result.penaltyA === "number" &&
            typeof match.result.penaltyB === "number"
            ? "Pênaltis"
            : match.winnerId
              ? "Encerrado"
              : "Empate"
          : clickable
            ? "Lançar"
            : "Aguardando"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <TeamAvatar teamId={match.resolvedA} />
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-semibold text-white">
            {teamA?.shortName ?? "A definir"} <span className="text-[#3ecfcf]">x</span>{" "}
            {teamB?.shortName ?? "A definir"}
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-wide text-white">
            {typeof match.result?.scoreA === "number" ? match.result.scoreA : "—"}
            <span className="mx-2 text-sm text-white/35">:</span>
            {typeof match.result?.scoreB === "number" ? match.result.scoreB : "—"}
          </p>
          {typeof match.result?.penaltyA === "number" &&
          typeof match.result?.penaltyB === "number" ? (
            <p className="mt-1 text-xs tracking-wide text-[#e8c36a]">
              Pên. {match.result.penaltyA}–{match.result.penaltyB}
            </p>
          ) : null}
        </div>
        <TeamAvatar teamId={match.resolvedB} />
      </div>
      {(() => {
        const meta = [formatDate(match.date), match.venue].filter(Boolean).join(" · ");
        const wo = match.result?.walkover ? "W.O." : "";
        const line = [meta, wo].filter(Boolean).join(" · ");
        return line ? <p className="mt-3 text-center text-[11px] text-white/45">{line}</p> : null;
      })()}
    </button>
  );
}
