// ViewModel for HomeScreen - handles all business logic and state management

import { useState, useEffect } from "react";
import { Season, League } from "../models/types";
import { leagueNameSuggestions } from "../models/mockData";
import { SupabaseService } from "../services/supabaseService";
import type { Season as DbSeason } from "../models";

export const useHomeViewModel = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [leagueName, setLeagueName] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [draftDate, setDraftDate] = useState<Date>(new Date(2026, 1, 14));
  const [viewingSeason, setViewingSeason] = useState<Season | null>(null);
  const [activeTab, setActiveTab] = useState("join");
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [availableSeasonsForCreate, setAvailableSeasonsForCreate] = useState<Season[]>([]);
  const [dbSeasons, setDbSeasons] = useState<DbSeason[]>([]); // Store database seasons for ID mapping
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(true);
  const [isCreatingLeague, setIsCreatingLeague] = useState(false);
  const [isJoiningLeague, setIsJoiningLeague] = useState(false);
  const [createLeagueError, setCreateLeagueError] = useState<string | null>(null);
  const [joinLeagueError, setJoinLeagueError] = useState<string | null>(null);
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [leagueUuidMap, setLeagueUuidMap] = useState<Map<number, string>>(new Map());
  const [isLoadingLeagues, setIsLoadingLeagues] = useState(true);

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

  // Helper function to refresh leagues list
  const refreshLeagues = async () => {
    try {
      const user = await SupabaseService.getCurrentUser();
      if (!user) {
        setMyLeagues([]);
        setLeagueUuidMap(new Map());
        return;
      }

      const uiLeaguesData = await SupabaseService.getUILeaguesByUserId(user.id);
      
      // Create map of numeric ID to UUID
      const uuidMap = new Map<number, string>();
      
      // Transform to UI League format
      const transformedLeagues: League[] = uiLeaguesData.map((data) => {
        const numericId = uuidToNumber(data.league.id);
        uuidMap.set(numericId, data.league.id); // Store UUID mapping
        return {
          id: numericId, // Convert UUID to number
          name: data.league.name,
          season: data.seasonName,
          members: data.memberCount,
          rank: data.userRank,
          points: data.userPoints,
        };
      });

      setMyLeagues(transformedLeagues);
      setLeagueUuidMap(uuidMap);
    } catch (error) {
      console.error("Error refreshing leagues:", error);
    }
  };

  // Fetch user's leagues from Supabase
  useEffect(() => {
    const fetchMyLeagues = async () => {
      try {
        setIsLoadingLeagues(true);
        await refreshLeagues();
      } catch (error) {
        console.error("Error fetching user leagues:", error);
        setMyLeagues([]);
      } finally {
        setIsLoadingLeagues(false);
      }
    };

    fetchMyLeagues();
  }, []);

  // Fetch seasons from Supabase
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        setIsLoadingSeasons(true);
        const fetchedDbSeasons = await SupabaseService.getSeasons();
        setDbSeasons(fetchedDbSeasons);
        
        // Filter database seasons for Create League modal FIRST - only show "active" or "upcoming"
        const filteredDbSeasonsForCreate = fetchedDbSeasons.filter(
          (dbSeason) => {
            const status = dbSeason.status;
            return status === "active" || status === "upcoming";
          }
        );
        
        // Transform filtered seasons for Create League modal
        const filteredSeasonsForCreate: Season[] = filteredDbSeasonsForCreate.map((dbSeason: DbSeason) => {
          // Map status: 'active' -> 'live', 'upcoming' -> archived (for UI consistency)
          let status: "live" | "completed" | "archived" = "archived";
          if (dbSeason.status === "active") status = "live";

          // Generate subtitle based on status
          let subtitle = "Archive";
          if (dbSeason.status === "active") subtitle = "Current Season";
          else if (dbSeason.status === "upcoming") subtitle = "Upcoming Season";

          return {
            id: dbSeason.number, // Use season number as id for UI
            title: dbSeason.name || `Season ${dbSeason.number}`,
            subtitle,
            image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=240&fit=crop", // Default image
            status,
            leagues: 0,
          };
        });
        setAvailableSeasonsForCreate(filteredSeasonsForCreate);
        
        // Auto-select the season with the closest start date
        if (filteredDbSeasonsForCreate.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Normalize to start of day
          
          let closestSeason = filteredDbSeasonsForCreate[0];
          let closestDistance = Math.abs(new Date(closestSeason.startDate).getTime() - today.getTime());
          
          for (const season of filteredDbSeasonsForCreate) {
            const seasonDate = new Date(season.startDate);
            seasonDate.setHours(0, 0, 0, 0);
            const distance = Math.abs(seasonDate.getTime() - today.getTime());
            
            if (distance < closestDistance) {
              closestDistance = distance;
              closestSeason = season;
            }
          }
          
          setSelectedSeason(closestSeason.number);
        }
        
        // Transform ALL database Season to UI Season type (for general display)
        const transformedSeasons: Season[] = fetchedDbSeasons.map((dbSeason: DbSeason) => {
          // Map status: 'active' -> 'live', 'completed' -> 'completed', 'upcoming' -> 'archived'
          let status: "live" | "completed" | "archived" = "archived";
          if (dbSeason.status === "active") status = "live";
          else if (dbSeason.status === "completed") status = "completed";

          // Generate subtitle based on status
          let subtitle = "Archive";
          if (dbSeason.status === "active") subtitle = "Current Season";
          else if (dbSeason.status === "completed") subtitle = "Recently Completed";

          return {
            id: dbSeason.number, // Use season number as id for UI
            title: dbSeason.name || `Season ${dbSeason.number}`,
            subtitle,
            image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=240&fit=crop", // Default image
            status,
            leagues: 0, // TODO: Query league count from database
          };
        });

        setSeasons(transformedSeasons);
      } catch (error) {
        console.error("Error fetching seasons:", error);
        // Fallback to empty array on error
        setSeasons([]);
        setAvailableSeasonsForCreate([]);
        setDbSeasons([]);
      } finally {
        setIsLoadingSeasons(false);
      }
    };

    fetchSeasons();
  }, []);

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
      const user = await SupabaseService.getCurrentUser();
      if (!user) {
        setJoinLeagueError("You must be logged in to join a league");
        setIsJoiningLeague(false);
        return;
      }

      // Join league
      const league = await SupabaseService.joinLeagueByInviteCode(inviteCode, user.id);
      
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
      const user = await SupabaseService.getCurrentUser();
      if (!user) {
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
        user.id,
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
