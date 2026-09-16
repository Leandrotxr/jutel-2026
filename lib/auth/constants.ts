export const FIRST_DIRECTOR_EMAIL = "leandro7teixeita@gmail.com";

export const USER_ROLES = ["publico", "assessor", "diretor"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  publico: "Público",
  assessor: "Assessor",
  diretor: "Diretor",
};
