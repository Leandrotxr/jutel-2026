"use client";

import { BackLink } from "@/components/back-link";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const showBack = pathname !== "/";

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#140826]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-3">
          {showBack ? <BackLink /> : null}
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-[#e8c36a]/50 bg-[radial-gradient(circle_at_30%_25%,#6b3fa0,#140826_70%)] font-[family-name:var(--font-display)] text-lg text-[#e8c36a] shadow-[0_0_18px_rgba(232,195,106,0.25)]">
              J
            </span>
            <span className={showBack ? "hidden sm:block" : ""}>
              <span className="block font-[family-name:var(--font-display)] text-lg tracking-[0.18em] text-white">
                JUTEL
              </span>
              <span className="block text-xs text-[#d7c4ff]/70">9ª edição · País das Maravilhas</span>
            </span>
          </Link>
        </div>
        <p className="hidden text-xs text-white/60 md:block">
          Santa Rita do Sapucaí · 18 a 20 de setembro
        </p>
      </div>
    </header>
  );
}
