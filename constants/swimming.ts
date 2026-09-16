import type { SwimEvent } from "@/lib/types";

export const SWIMMING_EVENTS: SwimEvent[] = [
  { id: "50-livre", name: "50m livre", kind: "individual" },
  { id: "50-costas", name: "50m costas", kind: "individual" },
  { id: "50-borboleta", name: "50m borboleta", kind: "individual" },
  { id: "50-peito", name: "50m peito", kind: "individual" },
  { id: "100-livre", name: "100m livre", kind: "individual" },
  { id: "4x50-revezamento", name: "4x50m revezamento", kind: "coletiva" },
];

export const SWIMMING_MEET = {
  date: "2026-09-19",
  venue: "Piscina Inatel",
  warmup: "10:00",
  start: "10:30",
} as const;
