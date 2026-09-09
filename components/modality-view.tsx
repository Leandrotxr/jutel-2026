"use client";

import { Bracket } from "@/components/bracket";
import { useModalityMatches } from "@/contexts/tournament";
import type { Modality } from "@/lib/types";

export function ModalityView({ modality }: { modality: Modality }) {
  const { matches, saveResult, clearResult } = useModalityMatches(modality.id);

  if (modality.format === "em-breve") {
    return (
      <div className="wonder-card p-8">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#e8c36a]">Em breve</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-white">
          {modality.name}
        </h1>
      </div>
    );
  }

  const formatLabel =
    modality.format === "grupos"
      ? "grupos + mata-mata"
      : modality.format === "round-robin"
        ? "todos contra todos"
        : "mata-mata";

  return (
    <div>
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#e8c36a]">
          {modality.group} · {modality.gender} · {formatLabel}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl text-white">
          {modality.name}
        </h1>
        {modality.excludedNote ? (
          <p className="mt-2 text-sm text-[#e8c36a]">{modality.excludedNote}</p>
        ) : null}
      </div>
      <Bracket
        modality={modality}
        matches={matches}
        onSave={saveResult}
        onClear={clearResult}
      />
    </div>
  );
}
