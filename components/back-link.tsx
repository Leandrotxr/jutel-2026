"use client";

import Link from "next/link";

export function BackLink({
  href = "/",
  label = "Modalidades",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-[#e8c36a]/35 bg-white/5 py-1 pr-4 pl-1 text-sm text-white transition hover:border-[#e8c36a] hover:bg-[#e8c36a]/10"
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e8c36a] text-[#1a0b32]">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
          <path
            d="M15 6 9 12l6 6"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {label}
    </Link>
  );
}
