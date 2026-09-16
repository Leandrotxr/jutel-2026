import { GROUP_TEAM_IDS } from "@/constants/teams";
import type { MatchSeed, TeamId } from "@/lib/types";

type SixTeamInput = {
  modalityId: string;
  qf: [[TeamId, TeamId], [TeamId, TeamId]];
  byes: [TeamId, TeamId];
  games: [number, number, number, number, number];
  venues?: [string, string, string, string, string];
  dates?: [string, string, string, string, string];
  times?: [string, string, string, string, string];
};

function knockout6({
  modalityId,
  qf,
  byes,
  games,
  venues,
  dates,
  times,
}: SixTeamInput): MatchSeed[] {
  const qf1 = `${modalityId}-qf-1`;
  const qf2 = `${modalityId}-qf-2`;
  const sf1 = `${modalityId}-sf-1`;
  const sf2 = `${modalityId}-sf-2`;
  const finale = `${modalityId}-final`;

  function extra(index: number): Pick<MatchSeed, "venue" | "date" | "time"> {
    return {
      ...(venues?.[index] ? { venue: venues[index] } : {}),
      ...(dates?.[index] ? { date: dates[index] } : {}),
      ...(times?.[index] ? { time: times[index] } : {}),
    };
  }

  return [
    { id: qf1, modalityId, round: "qf", slot: 1, gameNumber: games[0], teamA: qf[0][0], teamB: qf[0][1], ...extra(0) },
    { id: qf2, modalityId, round: "qf", slot: 2, gameNumber: games[1], teamA: qf[1][0], teamB: qf[1][1], ...extra(1) },
    { id: sf1, modalityId, round: "sf", slot: 1, gameNumber: games[2], teamA: byes[0], sourceB: qf1, ...extra(2) },
    { id: sf2, modalityId, round: "sf", slot: 2, gameNumber: games[3], teamA: byes[1], sourceB: qf2, ...extra(3) },
    { id: finale, modalityId, round: "final", slot: 1, gameNumber: games[4], sourceA: sf1, sourceB: sf2, ...extra(4) },
  ];
}

function roundRobin(modalityId: string, withKnockout = true): MatchSeed[] {
  const matches: MatchSeed[] = [];
  let slot = 1;
  for (let i = 0; i < GROUP_TEAM_IDS.length; i++) {
    for (let j = i + 1; j < GROUP_TEAM_IDS.length; j++) {
      matches.push({
        id: `${modalityId}-group-${slot}`,
        modalityId,
        round: "group",
        slot,
        teamA: GROUP_TEAM_IDS[i],
        teamB: GROUP_TEAM_IDS[j],
      });
      slot += 1;
    }
  }
  if (!withKnockout) return matches;
  matches.push(
    {
      id: `${modalityId}-sf-1`,
      modalityId,
      round: "sf",
      slot: 1,
      seedA: 1,
      seedB: 4,
    },
    {
      id: `${modalityId}-sf-2`,
      modalityId,
      round: "sf",
      slot: 2,
      seedA: 2,
      seedB: 3,
    },
    {
      id: `${modalityId}-final`,
      modalityId,
      round: "final",
      slot: 1,
      sourceA: `${modalityId}-sf-1`,
      sourceB: `${modalityId}-sf-2`,
    },
  );
  return matches;
}

function stamp(matches: MatchSeed[], extra: Pick<MatchSeed, "date" | "time" | "venue">) {
  return matches.map((match) => ({ ...match, ...extra }));
}

const D18 = "2026-09-18";
const D19 = "2026-09-19";
const D20 = "2026-09-20";

const GINASIO_INATEL = "Ginásio Inatel";
const GINASIO_ALCIDAO = "Ginásio Alcidão";
const JOSE_RIBEIRO = "Escola José Ribeiro";
const AREIA = "Quadra de Areia Inatel";
const PETECA = "Quadra de Peteca Inatel";
const PETECA_EXTERNA = "Quadra Externa de Peteca Inatel";
const SALAO = "Salão de Eventos Inatel";
const CAMPO = "Campo Society Inatel";
const JAQUES = "Ginásio Municipal Jaques Bressler";
const PALCO = "Palco Inatel";

export const MATCHES: MatchSeed[] = [
  ...knockout6({
    modalityId: "futsal-m",
    qf: [["if", "inatel"], ["univas", "fepi"]],
    byes: ["lau", "fdsm"],
    games: [3, 4, 75, 76, 98],
    venues: [GINASIO_INATEL, GINASIO_INATEL, GINASIO_INATEL, GINASIO_INATEL, GINASIO_INATEL],
    dates: [D18, D18, D19, D19, D20],
    times: ["21:30", "19:30", "18:00", "12:00", "15:00"],
  }),
  ...knockout6({
    modalityId: "futsal-f",
    qf: [["lau", "inatel"], ["fepi", "if"]],
    byes: ["univas", "fdsm"],
    games: [5, 6, 77, 78, 97],
    venues: [GINASIO_INATEL, GINASIO_INATEL, GINASIO_INATEL, GINASIO_INATEL, GINASIO_INATEL],
    dates: [D18, D19, D19, D19, D20],
    times: ["20:30", "09:00", "17:00", "16:00", "14:00"],
  }),
  ...knockout6({
    modalityId: "handebol-m",
    qf: [["fdsm", "lau"], ["univas", "inatel"]],
    byes: ["fepi", "if"],
    games: [7, 8, 79, 80, 96],
    venues: [GINASIO_ALCIDAO, GINASIO_ALCIDAO, GINASIO_INATEL, GINASIO_INATEL, GINASIO_INATEL],
    dates: [D18, D18, D19, D19, D20],
    times: ["19:30", "18:30", "08:00", "13:00", "13:00"],
  }),
  ...knockout6({
    modalityId: "handebol-f",
    qf: [["inatel", "fdsm"], ["univas", "fepi"]],
    byes: ["if", "lau"],
    games: [9, 10, 81, 82, 95],
    venues: [GINASIO_ALCIDAO, GINASIO_ALCIDAO, GINASIO_INATEL, GINASIO_INATEL, GINASIO_INATEL],
    dates: [D18, D18, D19, D19, D20],
    times: ["21:30", "20:30", "15:00", "14:00", "12:00"],
  }),
  ...knockout6({
    modalityId: "volei-m",
    qf: [["fdsm", "univas"], ["lau", "inatel"]],
    byes: ["fepi", "if"],
    games: [11, 12, 83, 84, 94],
    venues: [JOSE_RIBEIRO, JOSE_RIBEIRO, JOSE_RIBEIRO, JOSE_RIBEIRO, GINASIO_INATEL],
    dates: [D19, D18, D19, D19, D20],
    times: ["07:30", "21:30", "15:00", "09:30", "10:30"],
  }),
  ...knockout6({
    modalityId: "volei-f",
    qf: [["if", "fdsm"], ["fepi", "inatel"]],
    byes: ["lau", "univas"],
    games: [13, 14, 85, 86, 93],
    venues: [JOSE_RIBEIRO, JOSE_RIBEIRO, JOSE_RIBEIRO, JOSE_RIBEIRO, GINASIO_INATEL],
    dates: [D18, D18, D19, D19, D20],
    times: ["20:00", "19:00", "11:00", "12:30", "09:00"],
  }),
  ...knockout6({
    modalityId: "society-m",
    qf: [["lau", "inatel"], ["fdsm", "if"]],
    byes: ["fepi", "univas"],
    games: [15, 16, 69, 70, 99],
    venues: [CAMPO, CAMPO, CAMPO, CAMPO, CAMPO],
    dates: [D18, D18, D19, D19, D20],
    times: ["20:30", "18:30", "15:00", "10:00", "12:00"],
  }),
  ...knockout6({
    modalityId: "basquete-m",
    qf: [["fdsm", "lau"], ["inatel", "univas"]],
    byes: ["if", "fepi"],
    games: [1, 2, 71, 72, 92],
    venues: [JAQUES, JAQUES, GINASIO_ALCIDAO, GINASIO_ALCIDAO, GINASIO_ALCIDAO],
    dates: [D18, D18, D19, D19, D20],
    times: ["21:30", "20:00", "14:30", "10:30", "09:00"],
  }),
  {
    id: "basquete-3x3-f-qf-1",
    modalityId: "basquete-3x3-f",
    round: "qf",
    slot: 1,
    gameNumber: 40,
    teamA: "fdsm",
    teamB: "if",
    venue: GINASIO_ALCIDAO,
    date: D19,
    time: "08:00",
  },
  {
    id: "basquete-3x3-f-sf-1",
    modalityId: "basquete-3x3-f",
    round: "sf",
    slot: 1,
    gameNumber: 73,
    teamA: "univas",
    sourceB: "basquete-3x3-f-qf-1",
    venue: GINASIO_ALCIDAO,
    date: D19,
    time: "12:00",
  },
  {
    id: "basquete-3x3-f-sf-2",
    modalityId: "basquete-3x3-f",
    round: "sf",
    slot: 2,
    gameNumber: 74,
    teamA: "lau",
    teamB: "inatel",
    venue: GINASIO_ALCIDAO,
    date: D19,
    time: "08:30",
  },
  {
    id: "basquete-3x3-f-final",
    modalityId: "basquete-3x3-f",
    round: "final",
    slot: 1,
    gameNumber: 91,
    sourceA: "basquete-3x3-f-sf-1",
    sourceB: "basquete-3x3-f-sf-2",
    venue: GINASIO_ALCIDAO,
    date: D20,
    time: "10:30",
  },
  ...knockout6({
    modalityId: "beach-tenis-m",
    qf: [["inatel", "univas"], ["fepi", "fdsm"]],
    byes: ["if", "lau"],
    games: [88, 89, 119, 120, 105],
    venues: [AREIA, AREIA, AREIA, AREIA, AREIA],
    dates: [D18, D18, D18, D19, D20],
    times: ["16:00", "19:00", "18:30", "10:00", "09:00"],
  }),
  ...knockout6({
    modalityId: "beach-tenis-f",
    qf: [["univas", "lau"], ["if", "fdsm"]],
    byes: ["fepi", "inatel"],
    games: [33, 39, 90, 91, 106],
    venues: [AREIA, AREIA, AREIA, AREIA, AREIA],
    dates: [D19, D19, D19, D19, D20],
    times: ["08:00", "11:00", "18:00", "13:00", "10:30"],
  }),
  ...knockout6({
    modalityId: "volei-areia-m",
    qf: [["inatel", "fepi"], ["univas", "lau"]],
    byes: ["fdsm", "if"],
    games: [17, 18, 63, 64, 101],
    venues: [AREIA, AREIA, AREIA, AREIA, AREIA],
    dates: [D18, D19, D19, D19, D20],
    times: ["19:30", "09:00", "12:00", "16:00", "15:00"],
  }),
  ...knockout6({
    modalityId: "volei-areia-f",
    qf: [["fepi", "fdsm"], ["inatel", "univas"]],
    byes: ["if", "lau"],
    games: [19, 20, 65, 66, 100],
    venues: [AREIA, AREIA, AREIA, AREIA, AREIA],
    dates: [D19, D18, D19, D19, D20],
    times: ["14:00", "17:30", "17:00", "15:00", "13:00"],
  }),
  ...knockout6({
    modalityId: "peteca-m",
    qf: [["univas", "fepi"], ["lau", "inatel"]],
    byes: ["fdsm", "if"],
    games: [23, 24, 69, 70, 104],
    venues: [PETECA, PETECA_EXTERNA, PETECA_EXTERNA, PETECA_EXTERNA, PETECA_EXTERNA],
    dates: [D18, D19, D19, D20, D20],
    times: ["21:30", "08:00", "17:00", "12:00", "14:00"],
  }),
  ...knockout6({
    modalityId: "peteca-f",
    qf: [["lau", "inatel"], ["univas", "fepi"]],
    byes: ["fdsm", "if"],
    games: [25, 26, 71, 72, 103],
    venues: [PETECA_EXTERNA, PETECA, PETECA_EXTERNA, PETECA_EXTERNA, PETECA_EXTERNA],
    dates: [D19, D18, D19, D19, D20],
    times: ["09:00", "20:30", "18:00", "16:00", "13:00"],
  }),
  ...knockout6({
    modalityId: "futevolei",
    qf: [["univas", "fepi"], ["inatel", "lau"]],
    byes: ["if", "fdsm"],
    games: [21, 22, 68, 67, 102],
    venues: [AREIA, AREIA, AREIA, AREIA, AREIA],
    dates: [D20, D18, D20, D20, D20],
    times: ["12:00", "17:00", "14:00", "08:00", "16:00"],
  }),
  ...knockout6({
    modalityId: "tenis-mesa-m",
    qf: [["fepi", "fdsm"], ["univas", "if"]],
    byes: ["inatel", "lau"],
    games: [31, 32, 77, 78, 110],
    venues: [SALAO, SALAO, SALAO, SALAO, SALAO],
    dates: [D19, D19, D19, D19, D19],
    times: ["13:00", "13:00", "13:00", "13:00", "13:00"],
  }),
  ...knockout6({
    modalityId: "tenis-mesa-f",
    qf: [["fdsm", "inatel"], ["univas", "fepi"]],
    byes: ["lau", "if"],
    games: [33, 34, 79, 80, 111],
    venues: [SALAO, SALAO, SALAO, SALAO, SALAO],
    dates: [D19, D19, D19, D19, D19],
    times: ["15:00", "15:00", "15:00", "15:00", "15:00"],
  }),
  ...stamp(
    knockout6({
      modalityId: "truco",
      qf: [["inatel", "if"], ["fdsm", "lau"]],
      byes: ["fepi", "univas"],
      games: [40, 41, 86, 87, 115],
    }),
    { date: D20, time: "10:00", venue: PALCO },
  ),
  ...knockout6({
    modalityId: "fifa",
    qf: [["if", "inatel"], ["lau", "fepi"]],
    byes: ["univas", "fdsm"],
    games: [42, 43, 92, 93, 118],
  }),
  {
    id: "clash-royale-qf-1",
    modalityId: "clash-royale",
    round: "qf",
    slot: 1,
    gameNumber: 43,
    teamA: "univas",
    teamB: "if",
  },
  {
    id: "clash-royale-sf-1",
    modalityId: "clash-royale",
    round: "sf",
    slot: 1,
    gameNumber: 92,
    teamA: "inatel",
    teamB: "lau",
  },
  {
    id: "clash-royale-sf-2",
    modalityId: "clash-royale",
    round: "sf",
    slot: 2,
    gameNumber: 93,
    teamA: "fdsm",
    sourceB: "clash-royale-qf-1",
  },
  {
    id: "clash-royale-final",
    modalityId: "clash-royale",
    round: "final",
    slot: 1,
    gameNumber: 118,
    sourceA: "clash-royale-sf-1",
    sourceB: "clash-royale-sf-2",
  },
  ...roundRobin("lol"),
  ...roundRobin("cs2"),
  ...roundRobin("valorant"),
  ...stamp(roundRobin("xadrez", false), {
    date: D20,
    time: "12:30",
    venue: "Inatel (a definir)",
  }),
];

export const MATCHES_BY_MODALITY = MATCHES.reduce<Record<string, MatchSeed[]>>(
  (acc, match) => {
    acc[match.modalityId] ??= [];
    acc[match.modalityId].push(match);
    return acc;
  },
  {},
);
