import { GROUP_TEAM_IDS } from "@/constants/teams";
import type { MatchSeed, TeamId } from "@/lib/types";

type SixTeamInput = {
  modalityId: string;
  qf: [[TeamId, TeamId], [TeamId, TeamId]];
  byes: [TeamId, TeamId];
  games: [number, number, number, number, number];
  venues: [string, string, string, string, string];
  dates: [string, string, string, string, string];
};

function knockout6({
  modalityId,
  qf,
  byes,
  games,
  venues,
  dates,
}: SixTeamInput): MatchSeed[] {
  const qf1 = `${modalityId}-qf-1`;
  const qf2 = `${modalityId}-qf-2`;
  const sf1 = `${modalityId}-sf-1`;
  const sf2 = `${modalityId}-sf-2`;
  const finale = `${modalityId}-final`;

  return [
    { id: qf1, modalityId, round: "qf", slot: 1, gameNumber: games[0], teamA: qf[0][0], teamB: qf[0][1], venue: venues[0], date: dates[0] },
    { id: qf2, modalityId, round: "qf", slot: 2, gameNumber: games[1], teamA: qf[1][0], teamB: qf[1][1], venue: venues[1], date: dates[1] },
    { id: sf1, modalityId, round: "sf", slot: 1, gameNumber: games[2], teamA: byes[0], sourceB: qf1, venue: venues[2], date: dates[2] },
    { id: sf2, modalityId, round: "sf", slot: 2, gameNumber: games[3], teamA: byes[1], sourceB: qf2, venue: venues[3], date: dates[3] },
    { id: finale, modalityId, round: "final", slot: 1, gameNumber: games[4], sourceA: sf1, sourceB: sf2, venue: venues[4], date: dates[4] },
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

const D18 = "2026-09-18";
const D19 = "2026-09-19";
const D20 = "2026-09-20";

const GINASIO_INATEL = "Ginásio Inatel";
const GINASIO_ALCIDAO = "Ginásio Alcidão";
const JOSE_RIBEIRO = "Escola José Ribeiro";
const AREIA = "Quadra de Areia Inatel";
const EXTERNA = "Quadra Externa Inatel";
const BEACH_PLAY = "Beach Play";
const SALAO = "Salão de Eventos Inatel";
const CAMPO = "Campo Inatel";
const CDG = "CDG Inatel";
const BRAZZA = "Brazza Pub";
const NOVA_CIDADE = "Ginásio N. Cidade";

export const MATCHES: MatchSeed[] = [
  ...knockout6({
    modalityId: "futsal-m",
    qf: [["if", "inatel"], ["univas", "fepi"]],
    byes: ["lau", "fdsm"],
    games: [3, 4, 49, 50, 96],
    venues: [GINASIO_INATEL, GINASIO_INATEL, GINASIO_INATEL, GINASIO_INATEL, GINASIO_INATEL],
    dates: [D18, D18, D19, D19, D20],
  }),
  ...knockout6({
    modalityId: "futsal-f",
    qf: [["lau", "inatel"], ["fepi", "if"]],
    byes: ["univas", "fdsm"],
    games: [5, 6, 51, 52, 97],
    venues: [GINASIO_INATEL, GINASIO_INATEL, GINASIO_INATEL, GINASIO_INATEL, GINASIO_INATEL],
    dates: [D18, D18, D19, D19, D20],
  }),
  ...knockout6({
    modalityId: "handebol-m",
    qf: [["fdsm", "lau"], ["univas", "inatel"]],
    byes: ["fepi", "if"],
    games: [7, 8, 53, 54, 98],
    venues: [GINASIO_ALCIDAO, GINASIO_ALCIDAO, GINASIO_INATEL, GINASIO_INATEL, GINASIO_INATEL],
    dates: [D18, D18, D19, D19, D20],
  }),
  ...knockout6({
    modalityId: "handebol-f",
    qf: [["inatel", "fdsm"], ["univas", "fepi"]],
    byes: ["if", "lau"],
    games: [9, 10, 55, 56, 99],
    venues: [GINASIO_ALCIDAO, GINASIO_ALCIDAO, GINASIO_INATEL, GINASIO_INATEL, GINASIO_INATEL],
    dates: [D18, D18, D19, D19, D20],
  }),
  ...knockout6({
    modalityId: "volei-m",
    qf: [["fdsm", "univas"], ["lau", "inatel"]],
    byes: ["fepi", "if"],
    games: [11, 12, 57, 58, 100],
    venues: [JOSE_RIBEIRO, JOSE_RIBEIRO, JOSE_RIBEIRO, JOSE_RIBEIRO, GINASIO_INATEL],
    dates: [D18, D18, D19, D19, D20],
  }),
  ...knockout6({
    modalityId: "volei-f",
    qf: [["if", "fdsm"], ["fepi", "inatel"]],
    byes: ["lau", "univas"],
    games: [13, 14, 59, 60, 101],
    venues: [JOSE_RIBEIRO, JOSE_RIBEIRO, JOSE_RIBEIRO, JOSE_RIBEIRO, GINASIO_INATEL],
    dates: [D18, D18, D19, D19, D20],
  }),
  ...knockout6({
    modalityId: "society-m",
    qf: [["lau", "inatel"], ["fdsm", "if"]],
    byes: ["fepi", "univas"],
    games: [15, 16, 61, 62, 102],
    venues: [CAMPO, CAMPO, CAMPO, CAMPO, CAMPO],
    dates: [D18, D18, D19, D19, D20],
  }),
  ...knockout6({
    modalityId: "basquete-m",
    qf: [["fdsm", "lau"], ["inatel", "univas"]],
    byes: ["if", "fepi"],
    games: [1, 2, 44, 45, 94],
    venues: [NOVA_CIDADE, NOVA_CIDADE, GINASIO_ALCIDAO, GINASIO_ALCIDAO, GINASIO_INATEL],
    dates: [D18, D18, D19, D19, D20],
  }),
  {
    id: "basquete-3x3-f-qf-1",
    modalityId: "basquete-3x3-f",
    round: "qf",
    slot: 1,
    gameNumber: 46,
    teamA: "fdsm",
    teamB: "if",
    venue: GINASIO_ALCIDAO,
    date: D18,
  },
  {
    id: "basquete-3x3-f-sf-1",
    modalityId: "basquete-3x3-f",
    round: "sf",
    slot: 1,
    gameNumber: 47,
    teamA: "univas",
    sourceB: "basquete-3x3-f-qf-1",
    venue: GINASIO_ALCIDAO,
    date: D19,
  },
  {
    id: "basquete-3x3-f-sf-2",
    modalityId: "basquete-3x3-f",
    round: "sf",
    slot: 2,
    gameNumber: 48,
    teamA: "lau",
    teamB: "inatel",
    venue: GINASIO_ALCIDAO,
    date: D19,
  },
  {
    id: "basquete-3x3-f-final",
    modalityId: "basquete-3x3-f",
    round: "final",
    slot: 1,
    gameNumber: 95,
    sourceA: "basquete-3x3-f-sf-1",
    sourceB: "basquete-3x3-f-sf-2",
    venue: GINASIO_ALCIDAO,
    date: D20,
  },
  ...knockout6({
    modalityId: "beach-tenis-m",
    qf: [["inatel", "univas"], ["fepi", "fdsm"]],
    byes: ["if", "lau"],
    games: [88, 119, 89, 120, 116],
    venues: [BEACH_PLAY, BEACH_PLAY, BEACH_PLAY, BEACH_PLAY, BEACH_PLAY],
    dates: [D19, D19, D19, D19, D19],
  }),
  ...knockout6({
    modalityId: "beach-tenis-f",
    qf: [["univas", "lau"], ["if", "fdsm"]],
    byes: ["fepi", "inatel"],
    games: [38, 39, 90, 91, 117],
    venues: [BEACH_PLAY, BEACH_PLAY, BEACH_PLAY, BEACH_PLAY, BEACH_PLAY],
    dates: [D19, D19, D19, D19, D19],
  }),
  ...knockout6({
    modalityId: "volei-areia-m",
    qf: [["inatel", "fepi"], ["univas", "lau"]],
    byes: ["fdsm", "if"],
    games: [17, 18, 63, 64, 103],
    venues: [AREIA, AREIA, AREIA, AREIA, AREIA],
    dates: [D18, D18, D19, D19, D20],
  }),
  ...knockout6({
    modalityId: "volei-areia-f",
    qf: [["fepi", "fdsm"], ["inatel", "univas"]],
    byes: ["if", "lau"],
    games: [19, 20, 65, 66, 104],
    venues: [AREIA, AREIA, AREIA, AREIA, AREIA],
    dates: [D18, D18, D19, D19, D20],
  }),
  ...knockout6({
    modalityId: "peteca-m",
    qf: [["univas", "fepi"], ["lau", "inatel"]],
    byes: ["fdsm", "if"],
    games: [23, 24, 69, 70, 106],
    venues: [EXTERNA, EXTERNA, EXTERNA, EXTERNA, EXTERNA],
    dates: [D18, D18, D19, D19, D20],
  }),
  ...knockout6({
    modalityId: "peteca-f",
    qf: [["lau", "inatel"], ["univas", "fepi"]],
    byes: ["fdsm", "if"],
    games: [25, 26, 71, 72, 107],
    venues: [EXTERNA, EXTERNA, EXTERNA, EXTERNA, EXTERNA],
    dates: [D18, D18, D19, D19, D20],
  }),
  ...knockout6({
    modalityId: "futevolei",
    qf: [["univas", "fepi"], ["inatel", "lau"]],
    byes: ["if", "fdsm"],
    games: [21, 22, 67, 68, 105],
    venues: [AREIA, AREIA, AREIA, AREIA, AREIA],
    dates: [D18, D18, D19, D19, D20],
  }),
  ...knockout6({
    modalityId: "tenis-mesa-m",
    qf: [["fepi", "fdsm"], ["univas", "if"]],
    byes: ["inatel", "lau"],
    games: [31, 32, 77, 78, 110],
    venues: [SALAO, SALAO, SALAO, SALAO, SALAO],
    dates: [D19, D19, D19, D19, D19],
  }),
  ...knockout6({
    modalityId: "tenis-mesa-f",
    qf: [["fdsm", "inatel"], ["univas", "fepi"]],
    byes: ["lau", "if"],
    games: [33, 34, 79, 80, 111],
    venues: [SALAO, SALAO, SALAO, SALAO, SALAO],
    dates: [D19, D19, D19, D19, D19],
  }),
  ...knockout6({
    modalityId: "truco",
    qf: [["inatel", "if"], ["fdsm", "lau"]],
    byes: ["fepi", "univas"],
    games: [40, 41, 86, 87, 115],
    venues: [BRAZZA, BRAZZA, BRAZZA, BRAZZA, BRAZZA],
    dates: [D19, D19, D19, D19, D19],
  }),
  ...knockout6({
    modalityId: "fifa",
    qf: [["if", "inatel"], ["lau", "fepi"]],
    byes: ["univas", "fdsm"],
    games: [42, 43, 92, 93, 118],
    venues: [CDG, CDG, CDG, CDG, CDG],
    dates: [D19, D19, D19, D19, D19],
  }),
  {
    id: "clash-royale-qf-1",
    modalityId: "clash-royale",
    round: "qf",
    slot: 1,
    gameNumber: 43,
    teamA: "univas",
    teamB: "if",
    venue: CDG,
    date: D19,
  },
  {
    id: "clash-royale-sf-1",
    modalityId: "clash-royale",
    round: "sf",
    slot: 1,
    gameNumber: 92,
    teamA: "inatel",
    teamB: "lau",
    venue: CDG,
    date: D19,
  },
  {
    id: "clash-royale-sf-2",
    modalityId: "clash-royale",
    round: "sf",
    slot: 2,
    gameNumber: 93,
    teamA: "fdsm",
    sourceB: "clash-royale-qf-1",
    venue: CDG,
    date: D19,
  },
  {
    id: "clash-royale-final",
    modalityId: "clash-royale",
    round: "final",
    slot: 1,
    gameNumber: 118,
    sourceA: "clash-royale-sf-1",
    sourceB: "clash-royale-sf-2",
    venue: CDG,
    date: D19,
  },
  ...roundRobin("lol"),
  ...roundRobin("cs2"),
  ...roundRobin("valorant"),
  ...roundRobin("xadrez", false),
];

export const MATCHES_BY_MODALITY = MATCHES.reduce<Record<string, MatchSeed[]>>(
  (acc, match) => {
    acc[match.modalityId] ??= [];
    acc[match.modalityId].push(match);
    return acc;
  },
  {},
);
