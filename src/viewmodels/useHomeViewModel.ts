// ViewModel for HomeScreen - handles all business logic and state management

import { useState, useEffect } from "react";
import { Season } from "../models/types";
import { leagues, seasons, leagueNameSuggestions } from "../models/mockData";

export const useHomeViewModel = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [leagueName, setLeagueName] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [draftDate, setDraftDate] = useState<Date>(new Date(2026, 1, 14));
  const [viewingSeason, setViewingSeason] = useState<Season | null>(null);
  const [activeTab, setActiveTab] = useState("join");

  // Auto-populate league name with a random suggestion when create tab is opened
  useEffect(() => {
    if (activeTab === "create" && !leagueName) {
      const randomIndex = Math.floor(
        Math.random() * leagueNameSuggestions.length
      );
      setLeagueName(leagueNameSuggestions[randomIndex]);
    }
  }, [activeTab, leagueName]);

  // Computed values
  const canJoinLeague = inviteCode && inviteCode.length === 6;
  const canCreateLeague = leagueName && selectedSeason && draftDate;

  // Actions
  const handleJoinLeague = () => {
    if (!canJoinLeague) return;
    // In a real app, this would call an API to join the league
    console.log("Joining league with code:", inviteCode);
    setIsSheetOpen(false);
    // TODO: Navigate to the league or show success message
  };

  const handleCreateLeague = () => {
    if (!canCreateLeague) return;
    // In a real app, this would call an API to create the league
    console.log("Creating league:", {
      name: leagueName,
      seasonId: selectedSeason,
      draftDate,
    });
    setIsSheetOpen(false);
    // TODO: Navigate to the new league or show success message
  };

  const handleSeasonSelect = (seasonId: number) => {
    setSelectedSeason(seasonId);
  };

  const handleDraftDateChange = (date: Date) => {
    setDraftDate(date);
  };

  const handleViewSeason = (season: Season) => {
    setViewingSeason(season);
  };

  const handleBackFromSeason = () => {
    setViewingSeason(null);
  };

  return {
    // State
    isSheetOpen,
    inviteCode,
    leagueName,
    selectedSeason,
    draftDate,
    viewingSeason,
    activeTab,

    // Data
    myLeagues: leagues,
    seasons,

    // Computed
    canJoinLeague,
    canCreateLeague,

    // Actions
    setIsSheetOpen,
    setInviteCode,
    setLeagueName,
    setActiveTab,
    handleSeasonSelect,
    handleDraftDateChange,
    handleJoinLeague,
    handleCreateLeague,
    handleViewSeason,
    handleBackFromSeason,
  };
};
