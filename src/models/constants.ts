// Constants used throughout the app

export const tribeColors: Record<string, string> = {
  Gata: "bg-yellow-500",
  Lavo: "bg-purple-500",
  Tuku: "bg-blue-500",
};

export const eventColors: Record<string, string> = {
  immunity: "text-blue-400",
  strategic: "text-purple-400",
  reward: "text-[#BFFF0B]",
  eliminated: "text-red-400",
};

export const THEME_COLORS = {
  primary: "#BFFF0B",
  primaryHover: "#a8e609",
  background: "#0a0a0a",
  cardBackground: "slate-800/60",
} as const;

// Funny Survivor-based league name suggestions
export const SURVIVOR_LEAGUE_NAME_PUNS = [
  "Outwit, Outplay, Outdrink",
  "Rice Negotiators",
  "Come on In Gals",
  "Fire Making Champions",
  "Hidden Immunity Idols Anonymous",
  "Survivor: Office Edition",
  "Torch Snuffer Extraordinaires",
  "Cancel Christmas! Club",
  "Mergatory",
  "Alliance Backstabbers United",
  "Survivor: Couch Edition",
  "Morality Alliance from Hell",
  "Ponderosa Dream Team",
  "Bottoms Up Alliance",
  "Cops R Us"
] as const;

/**
 * Gets a random Survivor-themed league name suggestion
 */
export function getRandomLeagueNamePun(): string {
  return SURVIVOR_LEAGUE_NAME_PUNS[
    Math.floor(Math.random() * SURVIVOR_LEAGUE_NAME_PUNS.length)
  ];
}

// Survivor words for username generation
const SURVIVOR_WORDS = [
  "Merge", "Feast", "Torch", "Fire", "Immunity", "Idol", "Tribe", "Alliance",
  "Boot", "Vote", "Ponderosa", "Challenge", "Reward", "Jury", "Final", "Tribal",
  "Council", "Snuffer", "Hidden", "Rice", "Negotiate", "Outwit", "Outplay",
  "Outlast", "Survivor", "Exile", "Redemption", "Island", "Beach", "Camp",
  "Swap", "Advantage", "Legacy"
] as const;

/**
 * Generates a random Survivor-themed username
 * Format: [RandomWord][RandomWord][RandomNumber]
 * Example: MergeFeast123
 */
export function generateSurvivorUsername(): string {
  const word1 = SURVIVOR_WORDS[Math.floor(Math.random() * SURVIVOR_WORDS.length)];
  const word2 = SURVIVOR_WORDS[Math.floor(Math.random() * SURVIVOR_WORDS.length)];
  const number = Math.floor(Math.random() * 10000); // 0-9999
  return `${word1}${word2}${number}`;
}
