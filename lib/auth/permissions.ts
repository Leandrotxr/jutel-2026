import type { UserRole } from "@/lib/auth/constants";

export function canEditScores(role: UserRole | null | undefined) {
  return role === "assessor" || role === "diretor";
}

export function canManageUsers(role: UserRole | null | undefined) {
  return role === "diretor";
}

export function canManageSchedule(role: UserRole | null | undefined) {
  return role === "diretor";
}
