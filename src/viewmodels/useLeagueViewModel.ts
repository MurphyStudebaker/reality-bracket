// ViewModel for LeagueScreen - handles all business logic and state management

import { useState } from "react";
import { leagues, standings, weeklyActivity, leagueUsers } from "../models/mockData";

export const useLeagueViewModel = (initialLeagueId: number = 1) => {
  const [selectedLeague, setSelectedLeague] = useState(
    initialLeagueId.toString()
  );
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  // Computed values
  const currentLeague = leagues.find(
    (l) => l.id === parseInt(selectedLeague)
  );

  const topThreeStandings = standings.slice(0, 3);
  
  const leagueStats = {
    highestScore: standings[0]?.points || 0,
    averageScore: Math.round(
      standings.reduce((sum, u) => sum + u.points, 0) / standings.length
    ),
  };

  // Actions
  const handleLeagueChange = (leagueId: string) => {
    setSelectedLeague(leagueId);
    // In a real app, this would fetch new data for the selected league
  };

  return {
    // State
    selectedLeague,
    isActivityOpen,

    // Data
    currentLeague,
    leagues,
    standings,
    topThreeStandings,
    weeklyActivity,
    leagueUsers,
    leagueStats,

    // Actions
    handleLeagueChange,
    setIsActivityOpen,
  };
};
