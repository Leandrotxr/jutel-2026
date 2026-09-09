import type { Team, TeamId } from "@/lib/types";

export const TEAMS: Team[] = [
  {
    id: "inatel",
    slug: "inatel",
    shortName: "INATEL",
    initials: "IN",
    name: "Associação Atlética Acadêmica do Inatel",
    color: "#E8C36A",
  },
  {
    id: "fepi",
    slug: "fepi",
    shortName: "FEPI",
    initials: "FE",
    name: "Associação Atlética Acadêmica da FEPI",
    color: "#5B8CFF",
  },
  {
    id: "if",
    slug: "if",
    shortName: "IF",
    initials: "IF",
    name: "Atléticas Unificadas do IF Sul de Minas",
    color: "#3EE0B2",
  },
  {
    id: "univas",
    slug: "univas",
    shortName: "UNIVÁS",
    initials: "UN",
    name: "Atlética Unificada da Univás",
    color: "#B57BFF",
  },
  {
    id: "lau",
    slug: "lau",
    shortName: "LAU",
    initials: "LA",
    name: "Liga das Atléticas da Unifal",
    color: "#4FD8E8",
  },
  {
    id: "fdsm",
    slug: "fdsm",
    shortName: "FDSM",
    initials: "FD",
    name: "Associação Atlética Acadêmica da FDSM",
    color: "#F2F5FF",
  },
];

export const TEAM_BY_ID: Record<TeamId, Team> = Object.fromEntries(
  TEAMS.map((team) => [team.id, team]),
) as Record<TeamId, Team>;

export const GROUP_TEAM_IDS = TEAMS.map((team) => team.id);
