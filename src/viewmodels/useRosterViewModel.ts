// ViewModel for RosterScreen - handles all business logic and state management

import { useState } from "react";
import { SpotType, Contestant } from "../models/types";
import {
  leagues,
  weeklyActivity,
  bottom1Pick,
  takenContestants,
  final3Picks,
} from "../models/mockData";

export const useRosterViewModel = () => {
  const [selectedLeague, setSelectedLeague] = useState("1");
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftSpotType, setDraftSpotType] = useState<SpotType>("final3");
  const [draftSpotIndex, setDraftSpotIndex] = useState<number>(0);

  // Computed values
  const currentLeague = leagues.find(
    (l) => l.id === parseInt(selectedLeague)
  );

  const totalPoints =
    final3Picks.reduce((sum, pick) => sum + (pick.points || 0), 0) +
    (bottom1Pick?.points || 0);

  const eliminatedInFinal3Index = weeklyActivity.findIndex(
    (pick) => pick.isEliminated
  );
  const hasEliminatedInFinal3 = eliminatedInFinal3Index !== -1;

  // Get current user's roster contestant IDs (excluding the one being replaced)
  const getUserRosterIds = () => {
    const rosterIds: number[] = [];
    final3Picks.forEach((pick, index) => {
      if (!pick.isEliminated || index !== draftSpotIndex) {
        rosterIds.push(pick.id);
      }
    });
    if (bottom1Pick && !bottom1Pick.isEliminated) {
      rosterIds.push(bottom1Pick.id);
    }
    return rosterIds;
  };

  // Actions
  const handleLeagueChange = (leagueId: string) => {
    setSelectedLeague(leagueId);
    // In a real app, this would fetch new data for the selected league
  };

  const handleStartDraft = (spotType: SpotType, spotIndex?: number) => {
    setDraftSpotType(spotType);
    setDraftSpotIndex(spotIndex || 0);
    setIsDrafting(true);
  };

  const handleDraftComplete = (contestantId: number) => {
    // In a real app, this would update the roster via API
    console.log(
      `Drafted contestant ${contestantId} for ${draftSpotType} spot ${draftSpotIndex}`
    );
    setIsDrafting(false);
    // TODO: Update roster data
  };

  const handleCloseDraft = () => {
    setIsDrafting(false);
  };

  return {
    // State
    selectedLeague,
    isActivityOpen,
    isDrafting,
    draftSpotType,
    draftSpotIndex,

    // Data
    currentLeague,
    leagues,
    weeklyActivity,
    bottom1Pick,
    takenContestants,
    totalPoints,
    final3Picks,

    // Actions
    handleLeagueChange,
    setIsActivityOpen,
    handleStartDraft,
    handleDraftComplete,
    handleCloseDraft,
    getUserRosterIds,
  };
};