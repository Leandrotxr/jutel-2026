import { getSupabase } from "@/lib/supabase/client";
import type { MatchResult } from "@/lib/types";

const STORAGE_KEY = "jutel-2026-results";

function mapRows(
  data: { match_id: string; score_a: number; score_b: number; walkover: boolean; penalty_a?: number | null; penalty_b?: number | null }[],
): Record<string, MatchResult> {
  return Object.fromEntries(
    data.map((row) => [
      row.match_id,
      {
        scoreA: row.score_a,
        scoreB: row.score_b,
        walkover: Boolean(row.walkover),
        ...(typeof row.penalty_a === "number" && typeof row.penalty_b === "number"
          ? { penaltyA: row.penalty_a, penaltyB: row.penalty_b }
          : {}),
      },
    ]),
  );
}

export function loadLocalResults(): Record<string, MatchResult> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, MatchResult>) : {};
  } catch {
    return {};
  }
}

export function saveLocalResults(results: Record<string, MatchResult>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

export async function loadRemoteResults(): Promise<Record<string, MatchResult> | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const withPenalties = await supabase
    .from("match_results")
    .select("match_id, score_a, score_b, walkover, penalty_a, penalty_b");

  if (!withPenalties.error && withPenalties.data) {
    return mapRows(withPenalties.data);
  }

  const fallback = await supabase
    .from("match_results")
    .select("match_id, score_a, score_b, walkover");

  if (fallback.error || !fallback.data) return null;
  return mapRows(fallback.data);
}

export async function upsertRemoteResult(matchId: string, result: MatchResult | null) {
  const supabase = getSupabase();
  if (!supabase) return;

  if (!result) {
    await supabase.from("match_results").delete().eq("match_id", matchId);
    return;
  }

  const payload = {
    match_id: matchId,
    score_a: result.scoreA,
    score_b: result.scoreB,
    walkover: Boolean(result.walkover),
    penalty_a: result.penaltyA ?? null,
    penalty_b: result.penaltyB ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("match_results").upsert(payload);
  if (!error) return;

  await supabase.from("match_results").upsert({
    match_id: matchId,
    score_a: result.scoreA,
    score_b: result.scoreB,
    walkover: Boolean(result.walkover),
    updated_at: new Date().toISOString(),
  });
}
