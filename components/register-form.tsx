"use client";

import { AuthCard, fieldClass } from "@/components/auth-card";
import { useAuth } from "@/contexts/auth";
import { formatCpfInput, formatPhoneInput } from "@/lib/auth/validation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

export function RegisterForm() {
  const router = useRouter();
  const { user, ready, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/");
  }, [ready, router, user]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setSaving(true);
    setError("");
    setInfo("");
    try {
      const result = await signUp({ email, password, phone, cpf });
      if (result === "confirm-email") {
        setInfo("Conta criada. Confirme o email enviado para entrar.");
        return;
      }
      router.replace("/");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível cadastrar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthCard
      title="Cadastro"
      subtitle="Novas contas entram como público. Um diretor pode promover assessores e diretores."
    >
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
          Telefone
          <input
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            required
            value={phone}
            onChange={(event) => setPhone(formatPhoneInput(event.target.value))}
            placeholder="(35) 99999-0000"
            className={fieldClass}
          />
        </label>
        <label className="block text-sm text-white/80">
          CPF
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            required
            value={cpf}
            onChange={(event) => setCpf(formatCpfInput(event.target.value))}
            placeholder="000.000.000-00"
            className={fieldClass}
          />
        </label>
        <label className="block text-sm text-white/80">
          Senha
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block text-sm text-white/80">
          Confirmar senha
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className={fieldClass}
          />
        </label>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        {info ? <p className="text-sm text-[#3ecfcf]">{info}</p> : null}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-[#e8c36a] px-4 py-2.5 text-sm font-semibold text-[#1a0b32] disabled:opacity-60"
        >
          {saving ? "Cadastrando..." : "Criar conta"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-white/55">
        Já tem conta?{" "}
        <Link href="/entrar" className="text-[#3ecfcf] hover:underline">
          Entrar
        </Link>
      </p>
    </AuthCard>
  );
}
