"use client";

import { ScoreStepper } from "@/components/score-stepper";
import { TeamAvatar } from "@/components/team-avatar";
import { TEAM_BY_ID } from "@/constants/teams";
import { ROUND_LABEL } from "@/lib/bracket";
import type { MatchResult, MatchSchedule, Modality, ResolvedMatch } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

const fieldClass =
  "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-[#e8c36a]";

function hasScore(value: string) {
  if (value.trim() === "") return false;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0;
}

export function ScoreModal({
  match,
  modality,
  canEditScores,
  canManageSchedule,
  onClose,
  onSave,
  onClear,
  onSaveSchedule,
}: {
  match: ResolvedMatch;
  modality: Modality;
  canEditScores: boolean;
  canManageSchedule: boolean;
  onClose: () => void;
  onSave: (result: MatchResult) => Promise<void>;
  onClear: () => Promise<void>;
  onSaveSchedule: (schedule: MatchSchedule) => Promise<void>;
}) {
  const teamA = match.resolvedA ? TEAM_BY_ID[match.resolvedA] : null;
  const teamB = match.resolvedB ? TEAM_BY_ID[match.resolvedB] : null;
  const [scoreA, setScoreA] = useState(match.result?.scoreA.toString() ?? "");
  const [scoreB, setScoreB] = useState(match.result?.scoreB.toString() ?? "");
  const [penaltyA, setPenaltyA] = useState(match.result?.penaltyA?.toString() ?? "");
  const [penaltyB, setPenaltyB] = useState(match.result?.penaltyB?.toString() ?? "");
  const [walkover, setWalkover] = useState(Boolean(match.result?.walkover));
  const [date, setDate] = useState(match.date ?? "");
  const [time, setTime] = useState(match.time ?? "");
  const [venue, setVenue] = useState(match.venue ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const showScores = canEditScores && match.status !== "pending";

  const tied = useMemo(
    () => hasScore(scoreA) && hasScore(scoreB) && Number(scoreA) === Number(scoreB),
    [scoreA, scoreB],
  );
  const needsPenalties = tied && !modality.allowDraw && !walkover;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      if (showScores) {
        const a = Number(scoreA);
        const b = Number(scoreB);
        if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) {
          throw new Error("Informe placares inteiros e positivos.");
        }
        if (needsPenalties) {
          const pA = Number(penaltyA);
          const pB = Number(penaltyB);
          if (!Number.isInteger(pA) || !Number.isInteger(pB) || pA < 0 || pB < 0) {
            throw new Error("Informe o placar dos pênaltis.");
          }
          if (pA === pB) {
            throw new Error("Os pênaltis precisam ter um vencedor.");
          }
        }
      }

      if (canManageSchedule) {
        await onSaveSchedule({
          date: date.trim() || undefined,
          time: time.trim() || undefined,
          venue: venue.trim() || undefined,
        });
      }

      if (showScores) {
        await onSave({
          scoreA: Number(scoreA),
          scoreB: Number(scoreB),
          walkover,
          ...(needsPenalties
            ? { penaltyA: Number(penaltyA), penaltyB: Number(penaltyB) }
            : {}),
        });
      }

      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setSaving(true);
    setError("");
    try {
      await onClear();
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível limpar o placar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0a0514]/80 p-4" onClick={onClose}>
      <div
        className="wonder-card max-h-[90vh] w-full max-w-md overflow-y-auto p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#e8c36a]">
          {ROUND_LABEL[match.round]}
          {match.gameNumber ? ` · JG ${match.gameNumber}` : ""}
        </p>
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-white">
          {showScores ? "Lançar placar" : "Horário e local"}
        </h2>
        <p className="mt-1 text-sm text-white/60">{modality.scoringLabel}</p>

        <div className="mt-5 space-y-4">
          {showScores ? (
            <>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm text-white/80">
                  <TeamAvatar teamId={match.resolvedA} size={28} />
                  {teamA?.shortName}
                </span>
                <ScoreStepper
                  value={scoreA}
                  onChange={setScoreA}
                  ariaLabel={`Placar ${teamA?.shortName ?? "equipe A"}`}
                />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm text-white/80">
                  <TeamAvatar teamId={match.resolvedB} size={28} />
                  {teamB?.shortName}
                </span>
                <ScoreStepper
                  value={scoreB}
                  onChange={setScoreB}
                  ariaLabel={`Placar ${teamB?.shortName ?? "equipe B"}`}
                />
              </label>

              {needsPenalties ? (
                <div className="rounded-2xl border border-[#e8c36a]/30 bg-[#e8c36a]/8 p-3">
                  <p className="mb-3 text-sm font-medium text-[#e8c36a]">Pênaltis</p>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-2 block text-xs text-white/70">{teamA?.shortName}</span>
                      <ScoreStepper
                        value={penaltyA}
                        onChange={setPenaltyA}
                        accent="gold"
                        ariaLabel={`Pênaltis ${teamA?.shortName ?? "equipe A"}`}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs text-white/70">{teamB?.shortName}</span>
                      <ScoreStepper
                        value={penaltyB}
                        onChange={setPenaltyB}
                        accent="gold"
                        ariaLabel={`Pênaltis ${teamB?.shortName ?? "equipe B"}`}
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
            </>
          ) : null}

          {canManageSchedule ? (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/4 p-3">
              <p className="text-sm font-medium text-[#e8c36a]">Horário e local</p>
              <label className="block text-xs text-white/70">
                Data
                <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={fieldClass} />
              </label>
              <label className="block text-xs text-white/70">
                Horário
                <input type="time" value={time} onChange={(event) => setTime(event.target.value)} className={fieldClass} />
              </label>
              <label className="block text-xs text-white/70">
                Local
                <input
                  type="text"
                  value={venue}
                  onChange={(event) => setVenue(event.target.value)}
                  placeholder="Ginásio, quadra, campo..."
                  className={fieldClass}
                />
              </label>
            </div>
          ) : null}
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
          {showScores && match.result ? (
            <button
              type="button"
              onClick={() => void handleClear()}
              disabled={saving}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80"
            >
              Limpar placar
            </button>
          ) : null}
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-white/60">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
