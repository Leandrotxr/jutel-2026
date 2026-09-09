import { TEAM_BY_ID } from "@/constants/teams";
import type { TeamId } from "@/lib/types";

export function TeamAvatar({
  teamId,
  size = 48,
}: {
  teamId: TeamId | null;
  size?: number;
}) {
  const team = teamId ? TEAM_BY_ID[teamId] : null;

  return (
    <span
      className="grid shrink-0 place-items-center rounded-full border-2 font-semibold tracking-wide text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.28,
        borderColor: team ? `${team.color}` : "rgba(255,255,255,0.18)",
        background: team
          ? `radial-gradient(circle at 30% 25%, ${team.color}aa, #12081f 72%)`
          : "radial-gradient(circle at 30% 25%, #3a2a55, #12081f 72%)",
        boxShadow: team ? `0 0 16px ${team.color}55` : "none",
      }}
    >
      {team?.initials ?? "?"}
    </span>
  );
}
