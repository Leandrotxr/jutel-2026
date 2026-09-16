"use client";

import { AuthCard, fieldClass } from "@/components/auth-card";
import { useAuth } from "@/contexts/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

export function LoginForm() {
  const router = useRouter();
  const { user, ready, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/");
  }, [ready, router, user]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await signIn(email, password);
      router.replace("/");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível entrar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthCard title="Entrar" subtitle="Acesse para lançar placares ou gerenciar permissões.">
      <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        <label className="block text-sm text-white/80">
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block text-sm text-white/80">
          Senha
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={fieldClass}
          />
        </label>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-[#e8c36a] px-4 py-2.5 text-sm font-semibold text-[#1a0b32] disabled:opacity-60"
        >
          {saving ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-white/55">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="text-[#3ecfcf] hover:underline">
          Cadastre-se
        </Link>
      </p>
    </AuthCard>
  );
}
