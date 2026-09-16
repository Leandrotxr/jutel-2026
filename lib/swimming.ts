import { SWIMMING_EVENTS } from "@/constants/swimming";
import { GROUP_TEAM_IDS } from "@/constants/teams";
import type { SwimEvent, SwimEventKind, SwimResult, TeamId } from "@/lib/types";

const INDIVIDUAL_POINTS = [13, 10, 7, 6, 4, 3];
const COLLECTIVE_POINTS = [25, 18, 15, 12, 8, 5];

function eventPoints(kind: SwimEventKind, place: number) {
  const table = kind === "coletiva" ? COLLECTIVE_POINTS : INDIVIDUAL_POINTS;
  return table[place - 1] ?? 0;
}

export function swimResultKey(modalityId: string, eventId: string, teamId: TeamId) {
  return `${modalityId}:${eventId}:${teamId}`;
}

export function parseSwimTime(input: string): number | null {
  const raw = input.trim().replace(",", ".");
  if (!raw) return null;

  const withMin = raw.match(/^(\d{1,2}):(\d{1,2})(?:\.(\d{1,2}))?$/);
  if (withMin) {
    const minutes = Number(withMin[1]);
    const seconds = Number(withMin[2]);
    const cents = Number((withMin[3] ?? "0").padEnd(2, "0"));
    if (seconds > 59 || cents > 99) return null;
    return minutes * 6000 + seconds * 100 + cents;
  }

  const onlySec = raw.match(/^(\d{1,3})(?:\.(\d{1,2}))?$/);
  if (!onlySec) return null;
  const seconds = Number(onlySec[1]);
  const cents = Number((onlySec[2] ?? "0").padEnd(2, "0"));
  if (cents > 99) return null;
  return seconds * 100 + cents;
}

export function formatSwimTime(timeCs: number) {
  const minutes = Math.floor(timeCs / 6000);
  const seconds = Math.floor((timeCs % 6000) / 100);
  const cents = timeCs % 100;
  const paddedSeconds = String(seconds).padStart(2, "0");
  const paddedCents = String(cents).padStart(2, "0");
  return minutes > 0 ? `${minutes}:${paddedSeconds}.${paddedCents}` : `${seconds}.${paddedCents}`;
}

export type SwimEventStanding = {
  teamId: TeamId;
  place: number | null;
  timeCs?: number;
  points: number;
  penalty: number;
  net: number;
  walkover: boolean;
  dns: boolean;
  tied: boolean;
};

export function rankSwimEvent(
  modalityId: string,
  event: SwimEvent,
  results: Record<string, SwimResult>,
  teams: TeamId[] = GROUP_TEAM_IDS,
): SwimEventStanding[] {
  const firstPlace = eventPoints(event.kind, 1);
  const rows = teams.map((teamId) => {
    const result = results[swimResultKey(modalityId, event.id, teamId)];
    return {
      teamId,
      timeCs: result?.timeCs,
      walkover: Boolean(result?.walkover),
      dns: Boolean(result?.dns),
      tiebreak: result?.tiebreak ?? 0,
    };
  });

  const classified = rows
    .filter((row) => typeof row.timeCs === "number" && !row.dns && !row.walkover)
    .sort((a, b) => {
      if (a.timeCs !== b.timeCs) return (a.timeCs ?? 0) - (b.timeCs ?? 0);
      if (a.tiebreak !== b.tiebreak) return a.tiebreak - b.tiebreak;
      return a.teamId.localeCompare(b.teamId);
    });

  const placeByTeam = new Map<TeamId, { place: number; tied: boolean }>();
  classified.forEach((row, index) => {
    const previous = classified[index - 1];
    const tied = Boolean(previous && previous.timeCs === row.timeCs);
    placeByTeam.set(row.teamId, { place: index + 1, tied });
    if (tied) {
      const prevTeam = placeByTeam.get(previous.teamId);
      if (prevTeam) prevTeam.tied = true;
    }
  });

  return rows.map((row) => {
    const ranked = placeByTeam.get(row.teamId);
    const points = ranked ? eventPoints(event.kind, ranked.place) : 0;
    const penalty = row.walkover ? firstPlace : 0;
    return {
      teamId: row.teamId,
      place: ranked?.place ?? null,
      timeCs: row.timeCs,
      points,
      penalty,
      net: points - penalty,
      walkover: row.walkover,
      dns: row.dns,
      tied: ranked?.tied ?? false,
    };
  });
}

export type SwimOverallStanding = {
  teamId: TeamId;
  place: number | null;
  points: number;
  penalty: number;
  net: number;
  golds: number;
  eventPlaces: number[];
};

export function swimmingOverall(
  modalityId: string,
  results: Record<string, SwimResult>,
  teams: TeamId[] = GROUP_TEAM_IDS,
): SwimOverallStanding[] {
  const eventStandings = SWIMMING_EVENTS.map((event) => rankSwimEvent(modalityId, event, results, teams));
  const hasAny = eventStandings.some((standings) => standings.some((row) => row.place || row.walkover || row.dns));

  const rows = teams.map((teamId) => {
    const eventPlaces: number[] = [];
    let points = 0;
    let penalty = 0;
    let golds = 0;
    for (const standings of eventStandings) {
      const row = standings.find((item) => item.teamId === teamId)!;
      points += row.points;
      penalty += row.penalty;
      if (row.place) {
        eventPlaces.push(row.place);
        if (row.place === 1) golds += 1;
      }
    }
    return { teamId, points, penalty, net: points - penalty, golds, eventPlaces, place: null as number | null };
  });

  if (hasAny) {
    rows.sort((a, b) => {
      if (b.net !== a.net) return b.net - a.net;
      if (b.golds !== a.golds) return b.golds - a.golds;
      for (let place = 1; place <= 6; place += 1) {
        const countA = a.eventPlaces.filter((item) => item === place).length;
        const countB = b.eventPlaces.filter((item) => item === place).length;
        if (countB !== countA) return countB - countA;
      }
      return a.teamId.localeCompare(b.teamId);
    });
    rows.forEach((row, index) => {
      row.place = index + 1;
    });
  }

  return teams.map((teamId) => rows.find((row) => row.teamId === teamId)!);
}

export function swimmingEventsPlayed(modalityId: string, results: Record<string, SwimResult>) {
  return SWIMMING_EVENTS.filter((event) =>
    GROUP_TEAM_IDS.some((teamId) => {
      const result = results[swimResultKey(modalityId, event.id, teamId)];
      return Boolean(result && (typeof result.timeCs === "number" || result.dns || result.walkover));
    }),
  ).length;
}

export function swimmingLeader(modalityId: string, results: Record<string, SwimResult>) {
  const overall = swimmingOverall(modalityId, results);
  const leader = [...overall].sort((a, b) => (a.place ?? 99) - (b.place ?? 99))[0];
  return leader?.place === 1 ? leader.teamId : null;
}
