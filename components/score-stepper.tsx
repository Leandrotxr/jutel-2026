"use client";

export function ScoreStepper({
  value,
  onChange,
  accent = "cyan",
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  accent?: "cyan" | "gold";
  ariaLabel: string;
}) {
  const parsed = value.trim() === "" ? null : Number(value);
  const current = parsed !== null && Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
  const ring = accent === "gold" ? "hover:border-[#e8c36a] hover:text-[#e8c36a]" : "hover:border-[#3ecfcf] hover:text-[#3ecfcf]";
  const focus = accent === "gold" ? "focus-within:border-[#e8c36a]" : "focus-within:border-[#3ecfcf]";

  function setNumber(next: number) {
    onChange(String(Math.max(0, next)));
  }

  return (
    <div className={`flex items-center overflow-hidden rounded-2xl border border-white/12 bg-black/30 ${focus}`}>
      <button
        type="button"
        aria-label={`Diminuir ${ariaLabel}`}
        onClick={() => setNumber(current - 1)}
        className={`grid h-12 w-12 shrink-0 place-items-center text-white/70 transition ${ring}`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
          <path d="M6 12h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>
      <input
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ""))}
        className="h-12 min-w-0 flex-1 bg-transparent text-center font-[family-name:var(--font-display)] text-3xl text-white outline-none"
      />
      <button
        type="button"
        aria-label={`Aumentar ${ariaLabel}`}
        onClick={() => setNumber(current + 1)}
        className={`grid h-12 w-12 shrink-0 place-items-center text-white/70 transition ${ring}`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
          <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
