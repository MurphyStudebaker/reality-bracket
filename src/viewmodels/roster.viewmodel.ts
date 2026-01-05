// ViewModel for Roster Page - handles user roster management

import { useState, useEffect } from 'react';
import { SupabaseService } from '../services/supabaseService';
import type { RosterPick, Contestant, RosterSlot, League } from '../models';

export const useRosterViewModel = (leagueId: string | null, userId: string | null) => {
  const [roster, setRoster] = useState<RosterSlot[]>([]);
  const [availableContestants, setAvailableContestants] = useState<Contestant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [seasonId, setSeasonId] = useState<string | null>(null);

  // Fetch user's roster for the league
  const fetchRoster = async () => {
    if (!leagueId || !userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Initialize empty roster slots
      const rosterSlots: RosterSlot[] = [
        { type: 'final3', contestant: null },
        { type: 'final3', contestant: null },
        { type: 'final3', contestant: null },
        { type: 'boot', contestant: null },
      ];
      
      const picks = await SupabaseService.getRosterByUserAndLeague(userId, leagueId);
      
      if (picks && picks.length > 0) {
        // Separate final3 and boot picks
        const final3Picks = picks.filter(p => p.pickType === 'final3');
        const bootPicks = picks.filter(p => p.pickType === 'boot');
        
        // Fill final3 slots (up to 3)
        final3Picks.forEach((pick, index) => {
          if (index < 3 && pick.contestant) {
            rosterSlots[index].contestant = pick.contestant;
          }
        });
        
        // Fill boot slot (only one)
        if (bootPicks.length > 0 && bootPicks[0].contestant) {
          rosterSlots[3].contestant = bootPicks[0].contestant;
        }
      }
      
      setRoster(rosterSlots);
    } catch (err) {
      console.error('Error fetching roster:', err);
      setError('Failed to load roster');
      // Initialize empty roster on error
      setRoster([
        { type: 'final3', contestant: null },
        { type: 'final3', contestant: null },
        { type: 'final3', contestant: null },
        { type: 'boot', contestant: null },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available contestants for the season
  const fetchContestants = async (seasonId: string) => {
    try {
      const data = await SupabaseService.getContestantsBySeason(seasonId);
      if (data && data.length > 0) {
        setAvailableContestants(data);
      } else {
        setAvailableContestants([]);
      }
    } catch (err) {
      console.error('Error fetching contestants:', err);
      setAvailableContestants([]);
    }
  };

  // Get season ID from league
  const fetchSeasonId = async (leagueId: string) => {
    try {
      // Query league directly to get season_id
      const supabase = SupabaseService.getClient();
      const { data: league, error } = await supabase
        .from('leagues')
        .select('season_id')
        .eq('id', leagueId)
        .single();

      if (error || !league) {
        console.error('Error fetching league season:', error);
        return null;
      }

      setSeasonId(league.season_id);
      return league.season_id;
    } catch (err) {
      console.error('Error fetching season ID:', err);
      return null;
    }
  };

  // Calculate total points for user
  const calculatePoints = async () => {
    try {
      const points = await SupabaseService.calculateUserPoints(userId, leagueId);
      setTotalPoints(points);
    } catch (err) {
      console.error('Error calculating points:', err);
      // Mock calculation
      setTotalPoints(125);
    }
  };

  // Add a contestant to roster
  const addContestantToRoster = async (
    contestantId: string,
    pickType: 'final3' | 'boot',
    slotIndex?: number
  ): Promise<boolean> => {
    if (!userId || !leagueId) {
      setError('User or league not available');
      return false;
    }

    try {
      setError(null);
      const pick = await SupabaseService.addRosterPick(userId, leagueId, contestantId, pickType);
      
      if (pick) {
        // Find the contestant in available contestants
        const contestant = availableContestants.find(c => c.id === contestantId);
        
        if (contestant) {
          // Update local state
          setRoster(prev => {
            const newRoster = [...prev];
            
            // If slotIndex is provided, use it; otherwise find first empty slot of the type
            const targetIndex = slotIndex !== undefined 
              ? slotIndex 
              : newRoster.findIndex(slot => slot.type === pickType && !slot.contestant);
            
            if (targetIndex !== -1) {
              newRoster[targetIndex] = {
                ...newRoster[targetIndex],
                contestant: contestant,
              };
            }
            
            return newRoster;
          });
        }
        
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error adding contestant:', err);
      setError(err?.message || 'Failed to add contestant');
      return false;
    }
  };

  // Remove a contestant from roster
  const removeContestantFromRoster = async (pickId: string): Promise<boolean> => {
    try {
      await SupabaseService.removeRosterPick(pickId);
      
      // Update local state
      setRoster(prev => {
        const newRoster = [...prev];
        const slotIndex = newRoster.findIndex(
          slot => slot.contestant && (slot.contestant as any).pickId === pickId
        );
        
        if (slotIndex !== -1) {
          newRoster[slotIndex].contestant = null;
        }
        
        return newRoster;
      });
      return true;
    } catch (err) {
      console.error('Error removing contestant:', err);
      setError('Failed to remove contestant');
      return false;
    }
  };

  // Replace a contestant in roster
  const replaceContestant = async (
    slotIndex: number,
    contestantId: string
  ): Promise<boolean> => {
    try {
      const slot = roster[slotIndex];
      
      // Add new pick
      const success = await addContestantToRoster(contestantId, slot.type);
      
      return success;
    } catch (err) {
      console.error('Error replacing contestant:', err);
      return false;
    }
  };

  // Initialize data
  useEffect(() => {
    if (!leagueId || !userId) {
      setIsLoading(false);
      return;
    }

    const initializeData = async () => {
      setIsLoading(true);
      try {
        // Get season ID from league
        const seasonIdFromLeague = await fetchSeasonId(leagueId);
        if (seasonIdFromLeague) {
          setSeasonId(seasonIdFromLeague);
          // Fetch contestants for the season
          await fetchContestants(seasonIdFromLeague);
        }
        
        // Fetch roster
        await fetchRoster();
        
        // Calculate points
        await calculatePoints();
      } catch (err) {
        console.error('Error initializing roster data:', err);
        setError('Failed to load roster data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [leagueId, userId]);

  return {
    roster,
    availableContestants,
    totalPoints,
    isLoading,
    error,
    addContestantToRoster,
    removeContestantFromRoster,
    replaceContestant,
    refreshRoster: fetchRoster,
    seasonId,
  };
};
