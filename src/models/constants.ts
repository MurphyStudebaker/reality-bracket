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
