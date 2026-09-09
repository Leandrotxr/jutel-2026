import type { MatchResult, MatchSeed, ResolvedMatch, TeamId } from "@/lib/types";
import { computeStandings, groupStageComplete } from "@/lib/standings";

export function winnerOf(result: MatchResult, teamA: TeamId, teamB: TeamId): TeamId | null {
  if (result.scoreA !== result.scoreB) {
    return result.scoreA > result.scoreB ? teamA : teamB;
  }
  if (
    typeof result.penaltyA === "number" &&
    typeof result.penaltyB === "number" &&
    result.penaltyA !== result.penaltyB
  ) {
    return result.penaltyA > result.penaltyB ? teamA : teamB;
  }
  return null;
}

function resolveSimple(
  seed: MatchSeed,
  results: Record<string, MatchResult>,
  lookupWinner: (id: string) => TeamId | null,
  seedTeam: (position?: number) => TeamId | null,
): ResolvedMatch {
  const resolvedA =
    seed.teamA ?? (seed.sourceA ? lookupWinner(seed.sourceA) : seedTeam(seed.seedA));
  const resolvedB =
    seed.teamB ?? (seed.sourceB ? lookupWinner(seed.sourceB) : seedTeam(seed.seedB));
  const result = results[seed.id];
  const canPlay = Boolean(resolvedA && resolvedB);
  const winnerId =
    result && resolvedA && resolvedB ? winnerOf(result, resolvedA, resolvedB) : null;

  return {
    ...seed,
    resolvedA: resolvedA ?? null,
    resolvedB: resolvedB ?? null,
    result,
    winnerId,
    status: result && canPlay ? "played" : canPlay ? "ready" : "pending",
  };
}

export function resolveMatches(
  seeds: MatchSeed[],
  results: Record<string, MatchResult>,
): ResolvedMatch[] {
  const byModality = new Map<string, MatchSeed[]>();
  for (const seed of seeds) {
    const list = byModality.get(seed.modalityId) ?? [];
    list.push(seed);
    byModality.set(seed.modalityId, list);
  }

  const resolved: ResolvedMatch[] = [];
  for (const modalitySeeds of byModality.values()) {
    const cache = new Map<string, ResolvedMatch>();
    const byId = new Map(modalitySeeds.map((seed) => [seed.id, seed]));

    const groupSeeds = modalitySeeds.filter((seed) => seed.round === "group");
    const resolvedGroup = groupSeeds.map((seed) =>
      resolveSimple(seed, results, () => null, () => null),
    );
    const complete = groupStageComplete(resolvedGroup);
    const standings = computeStandings(resolvedGroup);

    function seedTeam(position?: number): TeamId | null {
      if (!position || !complete) return null;
      return standings[position - 1]?.teamId ?? null;
    }

    function resolve(id: string): ResolvedMatch {
      const cached = cache.get(id);
      if (cached) return cached;
      const seed = byId.get(id);
      if (!seed) throw new Error(`Jogo não encontrado: ${id}`);
      const item = resolveSimple(
        seed,
        results,
        (sourceId) => resolve(sourceId).winnerId,
        seedTeam,
      );
      cache.set(id, item);
      return item;
    }

    for (const seed of modalitySeeds) {
      resolved.push(resolve(seed.id));
    }
  }

  return resolved;
}

export function championOf(matches: ResolvedMatch[]): TeamId | null {
  const finalWinner = matches.find((match) => match.round === "final")?.winnerId;
  if (finalWinner) return finalWinner;
  const onlyGroup = matches.length > 0 && matches.every((match) => match.round === "group");
  if (onlyGroup && groupStageComplete(matches)) {
    return computeStandings(matches, undefined, { chessRules: true, qualifyTop: 6 })[0]?.teamId ?? null;
  }
  return null;
}

export const ROUND_LABEL: Record<ResolvedMatch["round"], string> = {
  group: "Grupos",
  qf: "Quartas",
  sf: "Semifinal",
  final: "Final",
};

export function formatDate(value?: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}
