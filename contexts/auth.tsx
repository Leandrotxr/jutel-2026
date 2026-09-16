"use client";

import type { UserRole } from "@/lib/auth/constants";
import { canEditScores, canManageSchedule, canManageUsers, canViewGeneralRanking } from "@/lib/auth/permissions";
import {
  isValidCpf,
  isValidEmail,
  isValidPhone,
  mapAuthError,
  onlyDigits,
} from "@/lib/auth/validation";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types";
import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SignUpInput = {
  email: string;
  password: string;
  phone: string;
  cpf: string;
};

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  ready: boolean;
  configured: boolean;
  canEditScores: boolean;
  canManageUsers: boolean;
  canManageSchedule: boolean;
  canViewGeneralRanking: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<"session" | "confirm-email">;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapProfile(row: {
  id: string;
  email: string;
  phone: string;
  cpf: string;
  role: UserRole;
  created_at: string;
}): UserProfile {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    cpf: row.cpf,
    role: row.role,
    createdAt: row.created_at,
  };
}

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, phone, cpf, role, created_at")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) return mapProfile(data);
    await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(!configured);

  const loadProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      setReady(true);
      return;
    }
    const next = await fetchProfile(userId);
    setProfile(next);
    setReady(true);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const client = supabase;

    let cancelled = false;

    async function boot() {
      const { data } = await client.auth.getSession();
      if (cancelled) return;
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      await loadProfile(sessionUser?.id);
    }

    void boot();

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      void loadProfile(sessionUser?.id);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase não está configurado.");
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw new Error(mapAuthError(error.message));
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase não está configurado.");

    const email = input.email.trim().toLowerCase();
    const phone = onlyDigits(input.phone);
    const cpf = onlyDigits(input.cpf);

    if (!isValidEmail(email)) throw new Error("Informe um email válido.");
    if (input.password.length < 6) throw new Error("A senha deve ter pelo menos 6 caracteres.");
    if (!isValidPhone(phone)) throw new Error("Informe um telefone válido com DDD.");
    if (!isValidCpf(cpf)) throw new Error("Informe um CPF válido.");

    const { data: available, error: cpfError } = await supabase.rpc("cpf_available", {
      digits: cpf,
    });
    if (cpfError) throw new Error(mapAuthError(cpfError.message));
    if (available === false) throw new Error("Este CPF já está cadastrado.");

    const { data, error } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        data: { phone, cpf },
      },
    });
    if (error) throw new Error(mapAuthError(error.message));
    if (data.user && !data.session) return "confirm-email";
    return "session";
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile(user?.id);
  }, [loadProfile, user?.id]);

  const role: UserRole = profile?.role ?? "publico";

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      role,
      ready,
      configured,
      canEditScores: canEditScores(role),
      canManageUsers: canManageUsers(role),
      canManageSchedule: canManageSchedule(role),
      canViewGeneralRanking: canViewGeneralRanking(role),
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [configured, profile, ready, refreshProfile, role, signIn, signOut, signUp, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
