// ViewModel for DraftScreen - handles all business logic and state management

import { useState, useMemo } from "react";
import { SpotType, Contestant } from "../models/types";
import { allContestants, leagueUsers } from "../models/mockData";

interface UseDraftViewModelProps {
  spotType: SpotType;
  spotIndex?: number;
  takenContestants: { [key: number]: number[] };
  userRosterIds: number[];
}

export const useDraftViewModel = ({
  spotType,
  spotIndex,
  takenContestants,
  userRosterIds,
}: UseDraftViewModelProps) => {
  const [selectedContestant, setSelectedContestant] = useState<number | null>(
    null
  );

  // Computed values
  const spotTitle = useMemo(() => {
    return spotType === "final3"
      ? `Final 3 - Position ${(spotIndex || 0) + 1}`
      : "Next Boot Pick";
  }, [spotType, spotIndex]);

  const availableContestants = useMemo(() => {
    return allContestants.filter((c) => !c.isEliminated);
  }, []);

  const sortedContestants = useMemo(() => {
    return [...availableContestants].sort((a, b) => {
      const aIsOnRoster = userRosterIds.includes(a.id);
      const bIsOnRoster = userRosterIds.includes(b.id);

      if (aIsOnRoster && !bIsOnRoster) return 1; // a goes after b
      if (!aIsOnRoster && bIsOnRoster) return -1; // a goes before b
      return 0; // maintain original order
    });
  }, [availableContestants, userRosterIds]);

  const selectedContestantName = useMemo(() => {
    if (!selectedContestant) return null;
    return availableContestants.find((c) => c.id === selectedContestant)?.name;
  }, [selectedContestant, availableContestants]);

  // Helper functions
  const getContestantAvailability = (contestantId: number) => {
    const pickedByUsers = takenContestants[contestantId] || [];
    const isAvailable = pickedByUsers.length === 0;
    const isOnRoster = userRosterIds.includes(contestantId);

    return {
      pickedByUsers,
      isAvailable,
      isOnRoster,
    };
  };

  const getPickedByUserDetails = (userIds: number[]) => {
    return userIds
      .map((userId) => leagueUsers.find((u) => u.id === userId))
      .filter((u) => u !== undefined);
  };

  // Actions
  const handleSelectContestant = (contestantId: number, isOnRoster: boolean) => {
    if (!isOnRoster) {
      setSelectedContestant(contestantId);
    }
  };

  return {
    // State
    selectedContestant,

    // Data
    spotTitle,
    availableContestants,
    sortedContestants,
    selectedContestantName,
    leagueUsers,

    // Helper functions
    getContestantAvailability,
    getPickedByUserDetails,

    // Actions
    handleSelectContestant,
  };
};
