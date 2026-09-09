export type TeamId = "inatel" | "fepi" | "if" | "univas" | "lau" | "fdsm";

export type Gender = "masculino" | "feminino" | "misto";

export type ModalityCategory = "coletiva" | "dupla" | "individual";

export type ModalityFormat = "mata-mata" | "grupos" | "round-robin" | "em-breve";

export type RoundId = "group" | "qf" | "sf" | "final";

export type Team = {
  id: TeamId;
  slug: TeamId;
  shortName: string;
  initials: string;
  name: string;
  color: string;
};

export type Modality = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  gender: Gender;
  category: ModalityCategory;
  format: ModalityFormat;
  scoringLabel: string;
  group: string;
  comingSoonNote?: string;
  excludedTeams?: TeamId[];
  excludedNote?: string;
  allowDraw?: boolean;
};

export type MatchSeed = {
  id: string;
  modalityId: string;
  round: RoundId;
  slot: number;
  gameNumber?: number;
  teamA?: TeamId;
  teamB?: TeamId;
  sourceA?: string;
  sourceB?: string;
  seedA?: number;
  seedB?: number;
  venue?: string;
  date?: string;
};

export type MatchResult = {
  scoreA: number;
  scoreB: number;
  walkover?: boolean;
  penaltyA?: number;
  penaltyB?: number;
};

export type ResolvedMatch = MatchSeed & {
  resolvedA: TeamId | null;
  resolvedB: TeamId | null;
  result?: MatchResult;
  winnerId: TeamId | null;
  status: "pending" | "ready" | "played";
};

export type StandingRow = {
  teamId: TeamId;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  scored: number;
  conceded: number;
  diff: number;
  position: number;
  qualified: boolean;
};
