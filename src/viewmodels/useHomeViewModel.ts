// ViewModel for HomeScreen - handles all business logic and state management

import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { mutate } from "swr";
import { Season, League } from "../models/types";
import { leagueNameSuggestions } from "../models/mockData";
import { SupabaseService } from "../services/supabaseService";
import { fetcher, createKey } from "../lib/swr";
import type { Season as DbSeason } from "../models";

export const useHomeViewModel = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [leagueName, setLeagueName] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [draftDate, setDraftDate] = useState<Date>(new Date(2026, 1, 14));
  const [viewingSeason, setViewingSeason] = useState<Season | null>(null);
  const [activeTab, setActiveTab] = useState("join");
  const [isCreatingLeague, setIsCreatingLeague] = useState(false);
  const [isJoiningLeague, setIsJoiningLeague] = useState(false);
  const [createLeagueError, setCreateLeagueError] = useState<string | null>(null);
  const [joinLeagueError, setJoinLeagueError] = useState<string | null>(null);

  // Helper function to convert UUID string to number (for UI compatibility)
  const uuidToNumber = (uuid: string): number => {
    // Simple hash of UUID to number
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
      const char = uuid.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  // Fetch current user for leagues fetching
  const userKey = createKey('current-user');
  const { data: currentUser } = useSWR(userKey, fetcher);

  // Fetch user's leagues from Supabase using SWR
  const leaguesKey = createKey('ui-leagues', currentUser?.id);
  const { data: uiLeaguesData = [], error: leaguesError, isLoading: isLoadingLeagues } = useSWR(
    leaguesKey,
    fetcher
  );

  // Transform leagues data
  const { myLeagues, leagueUuidMap } = useMemo(() => {
    if (!uiLeaguesData || uiLeaguesData.length === 0) {
      return { myLeagues: [], leagueUuidMap: new Map<number, string>() };
    }

    const uuidMap = new Map<number, string>();
    const transformedLeagues: League[] = uiLeaguesData.map((data: any) => {
      const numericId = uuidToNumber(data.league.id);
      uuidMap.set(numericId, data.league.id);
      return {
        id: numericId,
        name: data.league.name,
        season: data.seasonName,
        members: data.memberCount,
        rank: data.userRank,
        points: data.userPoints,
      };
    });

    return { myLeagues: transformedLeagues, leagueUuidMap: uuidMap };
  }, [uiLeaguesData]);

  // Helper function to refresh leagues list
  const refreshLeagues = async () => {
    if (leaguesKey) await mutate(leaguesKey);
  };

  // Fetch seasons from Supabase using SWR
  const seasonsKey = createKey('seasons');
  const { data: fetchedDbSeasons = [], error: seasonsError, isLoading: isLoadingSeasons } = useSWR<DbSeason[]>(
    seasonsKey,
    fetcher
  );

  // Store dbSeasons for ID mapping
  const dbSeasons = useMemo(() => fetchedDbSeasons, [fetchedDbSeasons]);

  // Transform seasons data
  const { seasons, availableSeasonsForCreate } = useMemo(() => {
    if (!fetchedDbSeasons || fetchedDbSeasons.length === 0) {
      return { seasons: [], availableSeasonsForCreate: [] };
    }

    // Filter database seasons for Create League modal - only show "active" or "upcoming"
    const filteredDbSeasonsForCreate = fetchedDbSeasons.filter(
      (dbSeason) => {
        const status = dbSeason.status;
        return status === "active" || status === "upcoming";
      }
    );
    
    // Transform filtered seasons for Create League modal
    const filteredSeasonsForCreate: Season[] = filteredDbSeasonsForCreate.map((dbSeason: DbSeason) => {
      let status: "live" | "completed" | "archived" = "archived";
      if (dbSeason.status === "active") status = "live";

      let subtitle = "Archive";
      if (dbSeason.status === "active") subtitle = "Current Season";
      else if (dbSeason.status === "upcoming") subtitle = "Upcoming Season";

      return {
        id: dbSeason.number,
        title: dbSeason.name || `Season ${dbSeason.number}`,
        subtitle,
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=240&fit=crop",
        status,
        leagues: 0,
      };
    });
    
    // Transform ALL database Season to UI Season type (for general display)
    const transformedSeasons: Season[] = fetchedDbSeasons.map((dbSeason: DbSeason) => {
      let status: "live" | "completed" | "archived" = "archived";
      if (dbSeason.status === "active") status = "live";
      else if (dbSeason.status === "completed") status = "completed";

      let subtitle = "Archive";
      if (dbSeason.status === "active") subtitle = "Current Season";
      else if (dbSeason.status === "completed") subtitle = "Recently Completed";

      return {
        id: dbSeason.number,
        title: dbSeason.name || `Season ${dbSeason.number}`,
        subtitle,
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=240&fit=crop",
        status,
        leagues: 0,
      };
    });

    return { seasons: transformedSeasons, availableSeasonsForCreate: filteredSeasonsForCreate };
  }, [fetchedDbSeasons]);

  // Auto-select the season with the closest start date
  useEffect(() => {
    if (availableSeasonsForCreate.length > 0 && !selectedSeason) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let closestSeason = availableSeasonsForCreate[0];
      let closestDistance = Math.abs(new Date(dbSeasons.find(s => s.number === closestSeason.id)?.startDate || '').getTime() - today.getTime());
      
      for (const season of availableSeasonsForCreate) {
        const dbSeason = dbSeasons.find(s => s.number === season.id);
        if (!dbSeason) continue;
        const seasonDate = new Date(dbSeason.startDate);
        seasonDate.setHours(0, 0, 0, 0);
        const distance = Math.abs(seasonDate.getTime() - today.getTime());
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestSeason = season;
        }
      }
      
      setSelectedSeason(closestSeason.id);
    }
  }, [availableSeasonsForCreate, dbSeasons, selectedSeason]);

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
  const handleJoinLeague = async () => {
    if (!canJoinLeague) return;
    
    try {
      setIsJoiningLeague(true);
      setJoinLeagueError(null);
      
      // Get current user
      if (!currentUser) {
        setJoinLeagueError("You must be logged in to join a league");
        setIsJoiningLeague(false);
        return;
      }

      // Join league
      const league = await SupabaseService.joinLeagueByInviteCode(inviteCode, currentUser.id);
      
      if (league) {
        // Success - reset form and close
        setInviteCode("");
        setIsSheetOpen(false);
        // Refresh leagues list
        await refreshLeagues();
      }
    } catch (error: any) {
      console.error("Error joining league:", error);
      setJoinLeagueError(error?.message || "Failed to join league. Please check the invite code and try again.");
    } finally {
      setIsJoiningLeague(false);
    }
  };

  const handleCreateLeague = async () => {
    if (!canCreateLeague) return;
    
    try {
      setIsCreatingLeague(true);
      setCreateLeagueError(null);
      
      // Get current user
      if (!currentUser) {
        setCreateLeagueError("You must be logged in to create a league");
        setIsCreatingLeague(false);
        return;
      }

      // Map UI season number to database season UUID
      const dbSeason = dbSeasons.find(s => s.number === selectedSeason);
      if (!dbSeason) {
        setCreateLeagueError("Invalid season selected");
        setIsCreatingLeague(false);
        return;
      }

      // Format draft date as YYYY-MM-DD
      const draftDateStr = draftDate.toISOString().split('T')[0];

      // Create league
      const league = await SupabaseService.createLeague(
        leagueName,
        dbSeason.id,
        currentUser.id,
        draftDateStr
      );
      
      if (league) {
        // Success - reset form and close
        setLeagueName("");
        setSelectedSeason(null);
        setDraftDate(new Date(2026, 1, 14));
        setIsSheetOpen(false);
        // Refresh leagues list
        await refreshLeagues();
      }
    } catch (error: any) {
      console.error("Error creating league:", error);
      setCreateLeagueError(error?.message || "Failed to create league. Please try again.");
    } finally {
      setIsCreatingLeague(false);
    }
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

  // Get UUID for a league by numeric ID
  const getLeagueUuid = (numericId: number): string | undefined => {
    return leagueUuidMap.get(numericId);
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
    myLeagues,
    isLoadingLeagues,
    getLeagueUuid,
    seasons,
    availableSeasonsForCreate, // Filtered seasons for Create League modal
    isLoadingSeasons,

    // Loading states
    isCreatingLeague,
    isJoiningLeague,

    // Errors
    createLeagueError,
    joinLeagueError,

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
    // Error clearing
    clearCreateLeagueError: () => setCreateLeagueError(null),
    clearJoinLeagueError: () => setJoinLeagueError(null),
  };
};
