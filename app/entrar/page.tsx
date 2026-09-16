import { LoginForm } from "@/components/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar · JUTEL 2026",
};

export default function LoginPage() {
  return <LoginForm />;
}
