import { mapAuthError } from "@/lib/auth/validation";
import { getSupabase } from "@/lib/supabase/client";
import type { MatchResult, MatchSchedule, SwimResult, TeamId } from "@/lib/types";

const STORAGE_KEY = "jutel-2026-results";

function throwWriteError(message: string): never {
  throw new Error(mapAuthError(message));
}

function mapRows(
  data: {
    match_id: string;
    score_a: number;
    score_b: number;
    walkover: boolean;
    penalty_a?: number | null;
    penalty_b?: number | null;
  }[],
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

  const fallback = await supabase.from("match_results").select("match_id, score_a, score_b, walkover");

  if (fallback.error || !fallback.data) return null;
  return mapRows(fallback.data);
}

export async function upsertRemoteResult(matchId: string, result: MatchResult | null) {
  const supabase = getSupabase();
  if (!supabase) return;

  if (!result) {
    const { error } = await supabase.from("match_results").delete().eq("match_id", matchId);
    if (error) throwWriteError(error.message);
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

  const fallback = await supabase.from("match_results").upsert({
    match_id: matchId,
    score_a: result.scoreA,
    score_b: result.scoreB,
    walkover: Boolean(result.walkover),
    updated_at: new Date().toISOString(),
  });
  if (fallback.error) throwWriteError(error.message);
}

const SCHEDULE_KEY = "jutel-2026-schedule";

function mapScheduleRows(
  data: { match_id: string; date: string | null; time: string | null; venue: string | null }[],
): Record<string, MatchSchedule> {
  return Object.fromEntries(
    data.map((row) => [
      row.match_id,
      {
        date: row.date || undefined,
        time: row.time || undefined,
        venue: row.venue || undefined,
      },
    ]),
  );
}

export function loadLocalSchedule(): Record<string, MatchSchedule> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SCHEDULE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, MatchSchedule>) : {};
  } catch {
    return {};
  }
}

export function saveLocalSchedule(schedule: Record<string, MatchSchedule>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
}

export async function loadRemoteSchedule(): Promise<Record<string, MatchSchedule> | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from("match_schedule").select("match_id, date, time, venue");
  if (error || !data) return null;
  return mapScheduleRows(data);
}

export async function upsertRemoteSchedule(matchId: string, schedule: MatchSchedule) {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from("match_schedule").upsert({
    match_id: matchId,
    date: schedule.date ?? null,
    time: schedule.time ?? null,
    venue: schedule.venue ?? null,
    updated_at: new Date().toISOString(),
  });
  if (error) throwWriteError(error.message);
}

const SWIM_KEY = "jutel-2026-swimming";

export function loadLocalSwimResults(): Record<string, SwimResult> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SWIM_KEY);
    return raw ? (JSON.parse(raw) as Record<string, SwimResult>) : {};
  } catch {
    return {};
  }
}

export function saveLocalSwimResults(results: Record<string, SwimResult>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SWIM_KEY, JSON.stringify(results));
}

export async function loadRemoteSwimResults(): Promise<Record<string, SwimResult> | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("swimming_results")
    .select("event_id, team_id, time_cs, walkover, dns, tiebreak");
  if (error || !data) return null;
  return Object.fromEntries(
    data.map((row) => [
      `${row.event_id}:${row.team_id}`,
      {
        ...(typeof row.time_cs === "number" ? { timeCs: row.time_cs } : {}),
        walkover: Boolean(row.walkover),
        dns: Boolean(row.dns),
        ...(row.tiebreak ? { tiebreak: row.tiebreak } : {}),
      },
    ]),
  );
}

export async function upsertRemoteSwimResult(
  eventId: string,
  teamId: TeamId,
  result: SwimResult | null,
) {
  const supabase = getSupabase();
  if (!supabase) return;

  if (!result) {
    const { error } = await supabase
      .from("swimming_results")
      .delete()
      .eq("event_id", eventId)
      .eq("team_id", teamId);
    if (error) throwWriteError(error.message);
    return;
  }

  const { error } = await supabase.from("swimming_results").upsert({
    event_id: eventId,
    team_id: teamId,
    time_cs: result.timeCs ?? null,
    walkover: Boolean(result.walkover),
    dns: Boolean(result.dns),
    tiebreak: result.tiebreak ?? 0,
    updated_at: new Date().toISOString(),
  });
  if (error) throwWriteError(error.message);
}
