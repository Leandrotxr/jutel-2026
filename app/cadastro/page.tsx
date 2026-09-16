import { RegisterForm } from "@/components/register-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastro · JUTEL 2026",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
