// ViewModel for SeasonDetailsScreen - handles all business logic and state management

import { useMemo } from "react";
import { Season } from "../models/types";
import { contestantsBySeason } from "../models/seasonContestants";

export const useSeasonDetailsViewModel = (season: Season) => {
  const contestants = useMemo(() => {
    return contestantsBySeason[season.id] || [];
  }, [season.id]);

  const activeContestants = useMemo(() => {
    return contestants.filter((c) => c.status === "active");
  }, [contestants]);

  const eliminatedContestants = useMemo(() => {
    return contestants
      .filter((c) => c.status === "eliminated")
      .sort((a, b) => (b.eliminatedEpisode || 0) - (a.eliminatedEpisode || 0));
  }, [contestants]);

  const stats = useMemo(() => {
    return {
      remainingCount: activeContestants.length,
      eliminatedCount: eliminatedContestants.length,
      totalCount: contestants.length,
    };
  }, [activeContestants.length, eliminatedContestants.length, contestants.length]);

  return {
    // Data
    contestants,
    activeContestants,
    eliminatedContestants,
    stats,
  };
};
