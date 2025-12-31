// ViewModel for LatestActivityDrawer - handles activity categorization logic

import { Contestant, LeagueUser } from "../models/types";

export const useLatestActivityViewModel = (
  weeklyActivity: Contestant[],
  leagueUsers: LeagueUser[]
) => {
  // Check if there are any eliminated players
  const hasEliminatedPlayers = weeklyActivity.some((c) => c.isEliminated);

  return {
    weeklyActivity,
    leagueUsers,
    hasEliminatedPlayers,
  };
};