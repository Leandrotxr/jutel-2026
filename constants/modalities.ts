import type { Modality } from "@/lib/types";

export const MODALITIES: Modality[] = [
  { id: "futsal-m", slug: "futsal-masculino", name: "Futsal Masculino", shortName: "Futsal M", gender: "masculino", category: "coletiva", format: "mata-mata", scoringLabel: "Gols", group: "Quadra" },
  { id: "futsal-f", slug: "futsal-feminino", name: "Futsal Feminino", shortName: "Futsal F", gender: "feminino", category: "coletiva", format: "mata-mata", scoringLabel: "Gols", group: "Quadra" },
  { id: "handebol-m", slug: "handebol-masculino", name: "Handebol Masculino", shortName: "Handebol M", gender: "masculino", category: "coletiva", format: "mata-mata", scoringLabel: "Gols", group: "Quadra" },
  { id: "handebol-f", slug: "handebol-feminino", name: "Handebol Feminino", shortName: "Handebol F", gender: "feminino", category: "coletiva", format: "mata-mata", scoringLabel: "Gols", group: "Quadra" },
  { id: "basquete-m", slug: "basquete-masculino", name: "Basquete Masculino", shortName: "Basquete M", gender: "masculino", category: "coletiva", format: "mata-mata", scoringLabel: "Pontos", group: "Quadra" },
  { id: "basquete-3x3-f", slug: "basquete-3x3-feminino", name: "Basquete 3x3 Feminino", shortName: "Basquete 3x3 F", gender: "feminino", category: "coletiva", format: "mata-mata", scoringLabel: "Pontos", group: "Quadra", excludedTeams: ["fepi"], excludedNote: "FEPI não participa · 0 pontos na classificação geral" },
  { id: "volei-m", slug: "volei-masculino", name: "Vôlei Masculino", shortName: "Vôlei M", gender: "masculino", category: "coletiva", format: "mata-mata", scoringLabel: "Sets", group: "Quadra" },
  { id: "volei-f", slug: "volei-feminino", name: "Vôlei Feminino", shortName: "Vôlei F", gender: "feminino", category: "coletiva", format: "mata-mata", scoringLabel: "Sets", group: "Quadra" },
  { id: "society-m", slug: "futebol-society-masculino", name: "Futebol Society Masculino", shortName: "Society M", gender: "masculino", category: "coletiva", format: "mata-mata", scoringLabel: "Gols", group: "Campo" },
  { id: "natacao-m", slug: "natacao-masculina", name: "Natação Masculina", shortName: "Natação M", gender: "masculino", category: "individual", format: "natacao", scoringLabel: "Tempo", group: "Aquático" },
  { id: "natacao-f", slug: "natacao-feminina", name: "Natação Feminina", shortName: "Natação F", gender: "feminino", category: "individual", format: "natacao", scoringLabel: "Tempo", group: "Aquático" },
  { id: "beach-tenis-m", slug: "beach-tenis-masculino", name: "Beach Tênis Masculino", shortName: "Beach Tênis M", gender: "masculino", category: "dupla", format: "mata-mata", scoringLabel: "Games", group: "Areia" },
  { id: "beach-tenis-f", slug: "beach-tenis-feminino", name: "Beach Tênis Feminino", shortName: "Beach Tênis F", gender: "feminino", category: "dupla", format: "mata-mata", scoringLabel: "Games", group: "Areia" },
  { id: "tenis-mesa-m", slug: "tenis-de-mesa-masculino", name: "Tênis de Mesa Masculino", shortName: "Tênis de Mesa M", gender: "masculino", category: "individual", format: "mata-mata", scoringLabel: "Sets", group: "Mesa" },
  { id: "tenis-mesa-f", slug: "tenis-de-mesa-feminino", name: "Tênis de Mesa Feminino", shortName: "Tênis de Mesa F", gender: "feminino", category: "individual", format: "mata-mata", scoringLabel: "Sets", group: "Mesa" },
  { id: "peteca-m", slug: "peteca-masculino", name: "Peteca Masculino", shortName: "Peteca M", gender: "masculino", category: "dupla", format: "mata-mata", scoringLabel: "Sets", group: "Quadra" },
  { id: "peteca-f", slug: "peteca-feminino", name: "Peteca Feminino", shortName: "Peteca F", gender: "feminino", category: "dupla", format: "mata-mata", scoringLabel: "Sets", group: "Quadra" },
  { id: "volei-areia-m", slug: "volei-de-areia-masculino", name: "Vôlei de Areia Masculino", shortName: "Vôlei Areia M", gender: "masculino", category: "dupla", format: "mata-mata", scoringLabel: "Sets", group: "Areia" },
  { id: "volei-areia-f", slug: "volei-de-areia-feminino", name: "Vôlei de Areia Feminino", shortName: "Vôlei Areia F", gender: "feminino", category: "dupla", format: "mata-mata", scoringLabel: "Sets", group: "Areia" },
  { id: "futevolei", slug: "futevolei-misto", name: "Futevôlei Misto", shortName: "Futevôlei", gender: "misto", category: "dupla", format: "mata-mata", scoringLabel: "Sets", group: "Areia" },
  { id: "truco", slug: "truco-misto", name: "Truco Misto", shortName: "Truco", gender: "misto", category: "dupla", format: "mata-mata", scoringLabel: "Rodadas", group: "Mesa" },
  { id: "fifa", slug: "fifa-misto", name: "FIFA Misto", shortName: "FIFA", gender: "misto", category: "individual", format: "mata-mata", scoringLabel: "Gols", group: "E-sports" },
  { id: "xadrez", slug: "xadrez-misto", name: "Xadrez Misto", shortName: "Xadrez", gender: "misto", category: "individual", format: "round-robin", scoringLabel: "Pontos", group: "Mesa", allowDraw: true },
  { id: "lol", slug: "league-of-legends", name: "League of Legends Misto", shortName: "LoL", gender: "misto", category: "coletiva", format: "grupos", scoringLabel: "Mapas", group: "E-sports" },
  { id: "cs2", slug: "counter-strike-2", name: "Counter-Strike 2 Misto", shortName: "CS2", gender: "misto", category: "coletiva", format: "grupos", scoringLabel: "Rounds", group: "E-sports" },
  { id: "valorant", slug: "valorant", name: "Valorant Misto", shortName: "Valorant", gender: "misto", category: "coletiva", format: "grupos", scoringLabel: "Rounds", group: "E-sports" },
  { id: "clash-royale", slug: "clash-royale", name: "Clash Royale Misto", shortName: "Clash Royale", gender: "misto", category: "individual", format: "mata-mata", scoringLabel: "Partidas", group: "E-sports", excludedTeams: ["fepi"], excludedNote: "FEPI não participa · 0 pontos na classificação geral" },
];

export const MODALITY_BY_SLUG = Object.fromEntries(
  MODALITIES.map((modality) => [modality.slug, modality]),
) as Record<string, Modality>;

export const MODALITY_GROUPS = ["Quadra", "Campo", "Areia", "Mesa", "Aquático", "E-sports"] as const;
