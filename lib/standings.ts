import { GROUP_TEAM_IDS } from "@/constants/teams";
import type { ResolvedMatch, StandingRow, TeamId } from "@/lib/types";

function headToHead(matches: ResolvedMatch[], a: TeamId, b: TeamId) {
  const match = matches.find(
    (item) =>
      item.round === "group" &&
      item.result &&
      ((item.resolvedA === a && item.resolvedB === b) ||
        (item.resolvedA === b && item.resolvedB === a)),
  );
  if (!match?.winnerId) return 0;
  if (match.winnerId === a) return -1;
  if (match.winnerId === b) return 1;
  return 0;
}

export function computeStandings(
  matches: ResolvedMatch[],
  teams: TeamId[] = GROUP_TEAM_IDS,
  options?: { chessRules?: boolean; qualifyTop?: number },
): StandingRow[] {
  const qualifyTop = options?.qualifyTop ?? 4;
  const table = Object.fromEntries(
    teams.map((id) => [
      id,
      {
        teamId: id,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        points: 0,
        scored: 0,
        conceded: 0,
        diff: 0,
      },
    ]),
  ) as Record<TeamId, Omit<StandingRow, "position" | "qualified">>;

  for (const match of matches) {
    if (match.round !== "group" || !match.result || !match.resolvedA || !match.resolvedB) {
      continue;
    }
    const a = table[match.resolvedA];
    const b = table[match.resolvedB];
    a.played += 1;
    b.played += 1;
    a.scored += match.result.scoreA;
    a.conceded += match.result.scoreB;
    b.scored += match.result.scoreB;
    b.conceded += match.result.scoreA;
    if (match.result.scoreA === match.result.scoreB) {
      a.draws += 1;
      b.draws += 1;
      a.points += 1;
      b.points += 1;
    } else if (match.winnerId === match.resolvedA) {
      a.wins += 1;
      a.points += 3;
      b.losses += 1;
    } else if (match.winnerId === match.resolvedB) {
      b.wins += 1;
      b.points += 3;
      a.losses += 1;
    }
  }

  const rows = Object.values(table).map((row) => ({
    ...row,
    diff: row.scored - row.conceded,
  }));

  rows.sort((left, right) => {
    if (right.points !== left.points) return right.points - left.points;
    if (options?.chessRules) {
      const h2h = headToHead(matches, left.teamId, right.teamId);
      if (h2h !== 0) return h2h;
      if (right.wins !== left.wins) return right.wins - left.wins;
      return left.teamId.localeCompare(right.teamId);
    }
    if (right.diff !== left.diff) return right.diff - left.diff;
    if (right.scored !== left.scored) return right.scored - left.scored;
    const h2h = headToHead(matches, left.teamId, right.teamId);
    if (h2h !== 0) return h2h;
    return left.teamId.localeCompare(right.teamId);
  });

  const result: StandingRow[] = [];
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const previous = result[index - 1];
    const tied =
      Boolean(options?.chessRules) &&
      previous &&
      previous.points === row.points &&
      previous.wins === row.wins &&
      headToHead(matches, previous.teamId, row.teamId) === 0;
    const position = tied ? previous.position : index + 1;
    result.push({
      ...row,
      position,
      qualified: position <= qualifyTop,
    });
  }
  return result;
}

export function groupStageComplete(matches: ResolvedMatch[]) {
  const group = matches.filter((match) => match.round === "group");
  return group.length > 0 && group.every((match) => match.status === "played");
}
