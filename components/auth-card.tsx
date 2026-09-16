import type { ReactNode } from "react";

export const fieldClass =
  "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-[#3ecfcf]";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="wonder-card p-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#e8c36a]">Conta</p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-white">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-white/60">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
