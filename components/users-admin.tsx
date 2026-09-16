"use client";

import { fieldClass } from "@/components/auth-card";
import { useAuth } from "@/contexts/auth";
import { ROLE_LABELS, USER_ROLES, type UserRole } from "@/lib/auth/constants";
import { mapAuthError, formatCpfDisplay, formatPhoneDisplay } from "@/lib/auth/validation";
import { getSupabase } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

function mapRow(row: {
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

export function UsersAdmin() {
  const { ready, canManageUsers, user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [usersLoaded, setUsersLoaded] = useState(false);

  const loadUsers = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data, error: queryError } = await supabase
      .from("profiles")
      .select("id, email, phone, cpf, role, created_at")
      .order("created_at", { ascending: true });
    if (queryError) {
      setError(mapAuthError(queryError.message));
      setUsersLoaded(true);
      return;
    }
    setUsers((data ?? []).map(mapRow));
    setError("");
    setUsersLoaded(true);
  }, []);

  useEffect(() => {
    if (!ready || !canManageUsers) return;
    const timer = window.setTimeout(() => {
      void loadUsers();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [canManageUsers, loadUsers, ready]);

  async function changeRole(id: string, role: UserRole) {
    const supabase = getSupabase();
    if (!supabase) return;
    setSavingId(id);
    setError("");
    const { error: updateError } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (updateError) {
      setError(mapAuthError(updateError.message));
      setSavingId(null);
      return;
    }
    setUsers((current) => current.map((item) => (item.id === id ? { ...item, role } : item)));
    setSavingId(null);
  }

  if (!ready) {
    return <p className="text-sm text-white/60">Carregando...</p>;
  }

  if (!user) {
    return (
      <div className="wonder-card p-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">Permissões</h1>
        <p className="mt-2 text-sm text-white/60">Entre com uma conta de diretor para gerenciar papéis.</p>
        <Link href="/entrar" className="mt-4 inline-block text-sm text-[#3ecfcf] hover:underline">
          Ir para o login
        </Link>
      </div>
    );
  }

  if (!canManageUsers) {
    return (
      <div className="wonder-card p-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">Acesso restrito</h1>
        <p className="mt-2 text-sm text-white/60">Somente diretores podem alterar permissões.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#e8c36a]">Organização</p>
      <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl text-white">Permissões</h1>
      <p className="mt-2 max-w-2xl text-sm text-white/60">
        Público só visualiza. Assessores lançam placares. Diretores controlam tudo, inclusive estes papéis.
      </p>

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

      <div className="mt-6 space-y-3">
        {canManageUsers && !usersLoaded ? <p className="text-sm text-white/60">Carregando usuários...</p> : null}
        {usersLoaded && users.length === 0 ? (
          <p className="text-sm text-white/60">Nenhum usuário cadastrado ainda.</p>
        ) : null}
        {users.map((item) => (
          <article key={item.id} className="wonder-card p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{item.email}</p>
                <p className="mt-1 text-xs text-white/55">
                  {formatPhoneDisplay(item.phone)} · {formatCpfDisplay(item.cpf)}
                </p>
              </div>
              <label className="block text-xs text-white/60 sm:w-48">
                Papel
                <select
                  className={`${fieldClass} bg-[#140826]`}
                  value={item.role}
                  disabled={savingId === item.id}
                  onChange={(event) => void changeRole(item.id, event.target.value as UserRole)}
                >
                  {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
