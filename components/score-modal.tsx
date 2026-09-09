"use client";

import { TeamAvatar } from "@/components/team-avatar";
import { TEAM_BY_ID } from "@/constants/teams";
import { ROUND_LABEL } from "@/lib/bracket";
import type { MatchResult, Modality, ResolvedMatch } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

export function ScoreModal({
  match,
  modality,
  onClose,
  onSave,
  onClear,
}: {
  match: ResolvedMatch;
  modality: Modality;
  onClose: () => void;
  onSave: (result: MatchResult) => Promise<void>;
  onClear: () => Promise<void>;
}) {
  const teamA = match.resolvedA ? TEAM_BY_ID[match.resolvedA] : null;
  const teamB = match.resolvedB ? TEAM_BY_ID[match.resolvedB] : null;
  const [scoreA, setScoreA] = useState(match.result?.scoreA.toString() ?? "");
  const [scoreB, setScoreB] = useState(match.result?.scoreB.toString() ?? "");
  const [penaltyA, setPenaltyA] = useState(match.result?.penaltyA?.toString() ?? "");
  const [penaltyB, setPenaltyB] = useState(match.result?.penaltyB?.toString() ?? "");
  const [walkover, setWalkover] = useState(Boolean(match.result?.walkover));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const tied = useMemo(() => {
    const a = Number(scoreA);
    const b = Number(scoreB);
    return Number.isInteger(a) && Number.isInteger(b) && a === b && a >= 0;
  }, [scoreA, scoreB]);

  const needsPenalties = tied && !modality.allowDraw && !walkover;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSave() {
    const a = Number(scoreA);
    const b = Number(scoreB);
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) {
      setError("Informe placares inteiros e positivos.");
      return;
    }

    let pA: number | undefined;
    let pB: number | undefined;
    if (needsPenalties) {
      pA = Number(penaltyA);
      pB = Number(penaltyB);
      if (!Number.isInteger(pA) || !Number.isInteger(pB) || pA < 0 || pB < 0) {
        setError("Informe o placar dos pênaltis.");
        return;
      }
      if (pA === pB) {
        setError("Os pênaltis precisam ter um vencedor.");
        return;
      }
    }

    setSaving(true);
    setError("");
    await onSave({
      scoreA: a,
      scoreB: b,
      walkover,
      ...(needsPenalties ? { penaltyA: pA, penaltyB: pB } : {}),
    });
    setSaving(false);
    onClose();
  }

  async function handleClear() {
    setSaving(true);
    await onClear();
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0a0514]/80 p-4" onClick={onClose}>
      <div
        className="wonder-card w-full max-w-md p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#e8c36a]">
          {ROUND_LABEL[match.round]}
          {match.gameNumber ? ` · JG ${match.gameNumber}` : ""}
        </p>
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-white">
          Lançar placar
        </h2>
        <p className="mt-1 text-sm text-white/60">{modality.scoringLabel}</p>

        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1 flex items-center gap-2 text-sm text-white/80">
              <TeamAvatar teamId={match.resolvedA} size={28} />
              {teamA?.shortName}
            </span>
            <input
              type="number"
              min={0}
              value={scoreA}
              onChange={(event) => setScoreA(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-[#3ecfcf]"
            />
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-2 text-sm text-white/80">
              <TeamAvatar teamId={match.resolvedB} size={28} />
              {teamB?.shortName}
            </span>
            <input
              type="number"
              min={0}
              value={scoreB}
              onChange={(event) => setScoreB(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-[#3ecfcf]"
            />
          </label>

          {needsPenalties ? (
            <div className="rounded-2xl border border-[#e8c36a]/30 bg-[#e8c36a]/8 p-3">
              <p className="mb-3 text-sm font-medium text-[#e8c36a]">Pênaltis</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs text-white/70">{teamA?.shortName}</span>
                  <input
                    type="number"
                    min={0}
                    value={penaltyA}
                    onChange={(event) => setPenaltyA(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-[#e8c36a]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-white/70">{teamB?.shortName}</span>
                  <input
                    type="number"
                    min={0}
                    value={penaltyB}
                    onChange={(event) => setPenaltyB(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-[#e8c36a]"
                  />
                </label>
              </div>
            </div>
          ) : null}

          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={walkover}
              onChange={(event) => setWalkover(event.target.checked)}
            />
            Vitória por W.O.
          </label>
        </div>

        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-xl bg-[#e8c36a] px-4 py-2 text-sm font-semibold text-[#1a0b32] disabled:opacity-60"
          >
            Salvar
          </button>
          {match.result ? (
            <button
              type="button"
              onClick={() => void handleClear()}
              disabled={saving}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80"
            >
              Limpar placar
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-white/60"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
