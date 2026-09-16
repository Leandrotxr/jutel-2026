import { UsersAdmin } from "@/components/users-admin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Permissões · JUTEL 2026",
};

export default function UsersPage() {
  return <UsersAdmin />;
}
