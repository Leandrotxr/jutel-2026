"use client";

import { TEAM_BY_ID } from "@/constants/teams";
import { formatSwimTime, parseSwimTime } from "@/lib/swimming";
import type { SwimEvent, SwimResult, TeamId } from "@/lib/types";
import { useEffect, useState } from "react";

const fieldClass =
  "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-[#3ecfcf]";

export function SwimTimeModal({
  event,
  teamId,
  result,
  onClose,
  onSave,
  onClear,
}: {
  event: SwimEvent;
  teamId: TeamId;
  result?: SwimResult;
  onClose: () => void;
  onSave: (result: SwimResult) => Promise<void>;
  onClear: () => Promise<void>;
}) {
  const team = TEAM_BY_ID[teamId];
  const [time, setTime] = useState(typeof result?.timeCs === "number" ? formatSwimTime(result.timeCs) : "");
  const [dns, setDns] = useState(Boolean(result?.dns));
  const [walkover, setWalkover] = useState(Boolean(result?.walkover));
  const [tiebreak, setTiebreak] = useState(result?.tiebreak ? String(result.tiebreak) : "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
      let timeCs: number | undefined;
      if (!dns && !walkover) {
        const parsed = parseSwimTime(time);
        if (parsed === null || parsed <= 0) {
          throw new Error("Informe o tempo no formato 32.18 ou 1:05.40.");
        }
        timeCs = parsed;
      }
      await onSave({
        ...(timeCs ? { timeCs } : {}),
        dns,
        walkover,
        ...(tiebreak.trim() ? { tiebreak: Number(tiebreak) } : {}),
      });
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível salvar o tempo.");
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
      setError(caught instanceof Error ? caught.message : "Não foi possível limpar o resultado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0a0514]/80 p-4" onClick={onClose}>
      <div className="wonder-card w-full max-w-md p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#e8c36a]">{event.name}</p>
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-white">{team.shortName}</h2>
        <p className="mt-1 text-sm text-white/60">
          {event.kind === "coletiva" ? "Revezamento · pontuação coletiva" : "Prova individual"}
        </p>

        <div className="mt-5 space-y-3">
          <label className="block text-sm text-white/80">
            Tempo
            <input
              value={time}
              onChange={(event) => setTime(event.target.value)}
              placeholder="32.18 ou 1:05.40"
              disabled={dns || walkover}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm text-white/80">
            Desempate da C.O. (opcional)
            <input
              inputMode="numeric"
              value={tiebreak}
              onChange={(event) => setTiebreak(event.target.value.replace(/[^\d]/g, ""))}
              placeholder="1 = melhor no empate"
              className={fieldClass}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={dns}
              onChange={(event) => {
                setDns(event.target.checked);
                if (event.target.checked) setWalkover(false);
              }}
            />
            Não largou / não completou
          </label>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={walkover}
              onChange={(event) => {
                setWalkover(event.target.checked);
                if (event.target.checked) setDns(false);
              }}
            />
            W.O. da atlética
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
          {result ? (
            <button
              type="button"
              onClick={() => void handleClear()}
              disabled={saving}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80"
            >
              Limpar
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
