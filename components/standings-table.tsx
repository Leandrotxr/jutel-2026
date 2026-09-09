import { TeamAvatar } from "@/components/team-avatar";
import { TEAM_BY_ID } from "@/constants/teams";
import type { StandingRow } from "@/lib/types";

export function StandingsTable({
  rows,
  chess = false,
}: {
  rows: StandingRow[];
  chess?: boolean;
}) {
  return (
    <div className="wonder-card overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="text-[11px] uppercase tracking-[0.14em] text-[#d7c4ff]/70">
          <tr className="border-b border-white/10">
            <th className="px-3 py-3">Pos</th>
            <th className="px-3 py-3">Equipe</th>
            <th className="px-3 py-3">J</th>
            <th className="px-3 py-3">V</th>
            {chess ? <th className="px-3 py-3">E</th> : null}
            <th className="px-3 py-3">D</th>
            <th className="px-3 py-3">Pts</th>
            {chess ? null : (
              <>
                <th className="px-3 py-3">PF</th>
                <th className="px-3 py-3">PS</th>
                <th className="px-3 py-3">Saldo</th>
                <th className="px-3 py-3">Vaga</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const team = TEAM_BY_ID[row.teamId];
            return (
              <tr
                key={row.teamId}
                className={`border-b border-white/6 last:border-0 ${
                  !chess && row.qualified ? "bg-[#3ecfcf]/8" : ""
                }`}
              >
                <td className="px-3 py-3 font-semibold text-[#e8c36a]">{row.position}º</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <TeamAvatar teamId={row.teamId} size={32} />
                    <span className="font-medium text-white">{team.shortName}</span>
                  </div>
                </td>
                <td className="px-3 py-3 tabular-nums">{row.played}</td>
                <td className="px-3 py-3 tabular-nums">{row.wins}</td>
                {chess ? <td className="px-3 py-3 tabular-nums">{row.draws}</td> : null}
                <td className="px-3 py-3 tabular-nums">{row.losses}</td>
                <td className="px-3 py-3 font-semibold tabular-nums text-[#e8c36a]">
                  {row.points}
                </td>
                {chess ? null : (
                  <>
                    <td className="px-3 py-3 tabular-nums">{row.scored}</td>
                    <td className="px-3 py-3 tabular-nums">{row.conceded}</td>
                    <td className="px-3 py-3 tabular-nums">
                      {row.diff > 0 ? `+${row.diff}` : row.diff}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {row.qualified ? (
                        <span className="text-[#3ecfcf]">Semi</span>
                      ) : (
                        <span className="text-white/35">—</span>
                      )}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
