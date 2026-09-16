import { MODALITIES } from "@/constants/modalities";
import { SWIMMING_EVENTS } from "@/constants/swimming";
import { GROUP_TEAM_IDS } from "@/constants/teams";
import { groupStageComplete, computeStandings } from "@/lib/standings";
import { rankSwimEvent, swimmingOverall } from "@/lib/swimming";
import type { Modality, ResolvedMatch, SwimResult, TeamId } from "@/lib/types";

export const POINTS_COLETIVA = [25, 18, 15, 12, 8, 5] as const;
export const POINTS_INDIVIDUAL = [13, 10, 7, 6, 4, 3] as const;

const ROUND_RANK: Record<"final" | "sf" | "qf", number> = {
  final: 0,
  sf: 1,
  qf: 2,
};

export function pointsTable(category: Modality["category"]) {
  return category === "coletiva" ? POINTS_COLETIVA : POINTS_INDIVIDUAL;
}

export function pointsForPlace(category: Modality["category"], place: number) {
  return pointsTable(category)[place - 1] ?? 0;
}

function participatingTeams(modality: Modality): TeamId[] {
  return GROUP_TEAM_IDS.filter((id) => !modality.excludedTeams?.includes(id));
}

function loserOf(match: ResolvedMatch, winnerId: TeamId): TeamId | null {
  if (match.resolvedA === winnerId) return match.resolvedB;
  if (match.resolvedB === winnerId) return match.resolvedA;
  return null;
}

function knockoutLoss(matches: ResolvedMatch[], teamId: TeamId) {
  return matches.find(
    (match) =>
      match.round !== "group" &&
      match.status === "played" &&
      match.winnerId &&
      match.winnerId !== teamId &&
      (match.resolvedA === teamId || match.resolvedB === teamId),
  );
}

function knockoutPlacements(matches: ResolvedMatch[], teams: TeamId[]): Map<TeamId, number> {
  const places = new Map<TeamId, number>();
  const final = matches.find((match) => match.round === "final");
  if (!final?.winnerId || !final.resolvedA || !final.resolvedB) return places;

  const first = final.winnerId;
  const second = loserOf(final, first);
  if (!second) return places;
  places.set(first, 1);
  places.set(second, 2);

  const remaining = teams.filter((team) => !places.has(team));
  while (remaining.length > 0) {
    const ready = remaining.filter((team) => {
      const loss = knockoutLoss(matches, team);
      return Boolean(loss?.winnerId && places.has(loss.winnerId));
    });
    if (ready.length === 0) break;

    const bestRound = Math.min(
      ...ready.map((team) => ROUND_RANK[knockoutLoss(matches, team)!.round as "sf" | "qf"]),
    );
    const batch = ready
      .filter(
        (team) =>
          ROUND_RANK[knockoutLoss(matches, team)!.round as "sf" | "qf"] === bestRound,
      )
      .sort((a, b) => {
        const oppA = places.get(knockoutLoss(matches, a)!.winnerId!) ?? 99;
        const oppB = places.get(knockoutLoss(matches, b)!.winnerId!) ?? 99;
        return oppA - oppB;
      });

    let next = Math.max(...places.values()) + 1;
    for (const team of batch) {
      places.set(team, next);
      next += 1;
      remaining.splice(remaining.indexOf(team), 1);
    }
  }

  return places;
}

export type ModalityPlacement = {
  teamId: TeamId;
  place: number | null;
  points: number;
  walkovers: number;
  penalty: number;
  net: number;
};

export function placementsForModality(
  modality: Modality,
  matches: ResolvedMatch[],
  swimResults: Record<string, SwimResult> = {},
): ModalityPlacement[] {
  const teams = participatingTeams(modality);
  const firstPlacePoints = pointsForPlace(modality.category, 1);
  const places = new Map<TeamId, number>();

  if (modality.format === "em-breve") {
    return GROUP_TEAM_IDS.map((teamId) => ({
      teamId,
      place: null,
      points: 0,
      walkovers: 0,
      penalty: 0,
      net: 0,
    }));
  }

  if (modality.format === "natacao") {
    const overall = swimmingOverall(modality.id, swimResults, teams);
    return GROUP_TEAM_IDS.map((teamId) => {
      if (modality.excludedTeams?.includes(teamId)) {
        return { teamId, place: null, points: 0, walkovers: 0, penalty: 0, net: 0 };
      }
      const row = overall.find((item) => item.teamId === teamId)!;
      return {
        teamId,
        place: row.place,
        points: row.points,
        walkovers: 0,
        penalty: row.penalty,
        net: row.net,
      };
    });
  }

  if (modality.format === "round-robin") {
    if (groupStageComplete(matches)) {
      for (const row of computeStandings(matches, teams, { chessRules: true, qualifyTop: 6 })) {
        places.set(row.teamId, row.position);
      }
    }
  } else if (modality.format === "grupos") {
    if (groupStageComplete(matches)) {
      for (const row of computeStandings(matches, teams)) {
        if (row.position >= 5) places.set(row.teamId, row.position);
      }
    }
    const knockout = knockoutPlacements(matches, teams);
    for (const [team, place] of knockout) {
      if (place <= 4) places.set(team, place);
    }
  } else {
    const knockout = knockoutPlacements(matches, teams);
    for (const [team, place] of knockout) places.set(team, place);
  }

  return GROUP_TEAM_IDS.map((teamId) => {
    if (modality.excludedTeams?.includes(teamId)) {
      return { teamId, place: null, points: 0, walkovers: 0, penalty: 0, net: 0 };
    }
    const walkovers = matches.filter(
      (match) =>
        match.result?.walkover &&
        match.winnerId &&
        match.winnerId !== teamId &&
        (match.resolvedA === teamId || match.resolvedB === teamId),
    ).length;
    const place = places.get(teamId) ?? null;
    const points = place ? pointsForPlace(modality.category, place) : 0;
    const penalty = walkovers * firstPlacePoints;
    return { teamId, place, points, walkovers, penalty, net: points - penalty };
  });
}

export type RankingEntry = {
  teamId: TeamId;
  total: number;
  firstCollective: number;
  firstIndividual: number;
  placeCounts: number[];
  breakdown: { modality: Modality; place: number | null; net: number; penalty: number }[];
};

export function computeGeneralRanking(
  allMatches: ResolvedMatch[],
  swimResults: Record<string, SwimResult> = {},
): RankingEntry[] {
  const byModality = new Map<string, ResolvedMatch[]>();
  for (const match of allMatches) {
    const list = byModality.get(match.modalityId) ?? [];
    list.push(match);
    byModality.set(match.modalityId, list);
  }

  const entries = GROUP_TEAM_IDS.map((teamId) => {
    const placeCounts = [0, 0, 0, 0, 0, 0];
    let total = 0;
    let firstCollective = 0;
    let firstIndividual = 0;
    const breakdown: RankingEntry["breakdown"] = [];

    for (const modality of MODALITIES) {
      const placement = placementsForModality(
        modality,
        byModality.get(modality.id) ?? [],
        swimResults,
      ).find((item) => item.teamId === teamId)!;
      total += placement.net;
      if (modality.format === "natacao") {
        for (const event of SWIMMING_EVENTS) {
          const standing = rankSwimEvent(modality.id, event, swimResults).find(
            (item) => item.teamId === teamId,
          );
          if (standing?.place) {
            placeCounts[standing.place - 1] += 1;
            if (standing.place === 1) {
              if (event.kind === "coletiva") firstCollective += 1;
              else firstIndividual += 1;
            }
          }
        }
      } else if (placement.place) {
        placeCounts[placement.place - 1] += 1;
        if (placement.place === 1) {
          if (modality.category === "coletiva") firstCollective += 1;
          else firstIndividual += 1;
        }
      }
      breakdown.push({
        modality,
        place: placement.place,
        net: placement.net,
        penalty: placement.penalty,
      });
    }

    return { teamId, total, firstCollective, firstIndividual, placeCounts, breakdown };
  });

  entries.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    if (b.firstCollective !== a.firstCollective) return b.firstCollective - a.firstCollective;
    if (b.firstIndividual !== a.firstIndividual) return b.firstIndividual - a.firstIndividual;
    for (let place = 1; place < 6; place++) {
      if (b.placeCounts[place] !== a.placeCounts[place]) {
        return b.placeCounts[place] - a.placeCounts[place];
      }
    }
    return a.teamId.localeCompare(b.teamId);
  });

  return entries;
}
