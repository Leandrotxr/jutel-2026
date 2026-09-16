"use client";

import { AuthProvider } from "@/contexts/auth";
import { TournamentProvider } from "@/contexts/tournament";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TournamentProvider>{children}</TournamentProvider>
    </AuthProvider>
  );
}
