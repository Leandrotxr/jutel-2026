"use client";

import { BackLink } from "@/components/back-link";
import { ROLE_LABELS } from "@/lib/auth/constants";
import { useAuth } from "@/contexts/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const showBack = pathname !== "/";
  const backLabel = pathname.startsWith("/modalidades") ? "Modalidades" : "Início";
  const { user, profile, ready, canManageUsers, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#140826]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-3">
          {showBack ? <BackLink href="/" label={backLabel} /> : null}
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
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {ready && user && profile ? (
            <>
              {canManageUsers ? (
                <Link
                  href="/usuarios"
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80 hover:border-[#e8c36a]/50"
                >
                  Permissões
                </Link>
              ) : null}
              <span className="hidden max-w-[180px] truncate text-xs text-white/60 md:inline">
                {profile.email}
              </span>
              <span className="rounded-full bg-white/8 px-2 py-1 text-[11px] text-[#e8c36a]">
                {ROLE_LABELS[profile.role]}
              </span>
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80 hover:border-white/40"
              >
                Sair
              </button>
            </>
          ) : ready ? (
            <>
              <Link href="/entrar" className="rounded-full px-3 py-1 text-xs text-white/80 hover:text-white">
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="rounded-full bg-[#e8c36a] px-3 py-1 text-xs font-semibold text-[#1a0b32]"
              >
                Cadastrar
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
