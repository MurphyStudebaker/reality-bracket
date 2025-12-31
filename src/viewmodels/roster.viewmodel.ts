// ViewModel for Roster Page - handles user roster management

import { useState, useEffect } from 'react';
import { SupabaseService } from '../services/supabaseService';
import type { RosterPick, Contestant, RosterSlot, League } from '../models';
import { myRoster, contestants } from '../data/mockData';

export const useRosterViewModel = (leagueId: string, userId: string) => {
  const [roster, setRoster] = useState<RosterSlot[]>([]);
  const [availableContestants, setAvailableContestants] = useState<Contestant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);

  // Fetch user's roster for the league
  const fetchRoster = async () => {
    try {
      setIsLoading(true);
      const picks = await SupabaseService.getRosterByUserAndLeague(userId, leagueId);
      
      if (picks && picks.length > 0) {
        // Transform picks into roster slots
        const rosterSlots: RosterSlot[] = [
          { type: 'final3', contestant: null },
          { type: 'final3', contestant: null },
          { type: 'final3', contestant: null },
          { type: 'boot', contestant: null },
        ];
        
        // Fill slots with picks
        picks.forEach((pick: any) => {
          const slotIndex = rosterSlots.findIndex(
            slot => slot.type === pick.pickType && !slot.contestant
          );
          if (slotIndex !== -1) {
            rosterSlots[slotIndex].contestant = pick.contestant;
          }
        });
        
        setRoster(rosterSlots);
      } else {
        // Fallback to mock data
        setRoster(myRoster);
      }
    } catch (err) {
      console.error('Error fetching roster:', err);
      setError('Failed to load roster');
      // Fallback to mock data
      setRoster(myRoster);
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
        // Fallback to mock data
        setAvailableContestants(contestants);
      }
    } catch (err) {
      console.error('Error fetching contestants:', err);
      // Fallback to mock data
      setAvailableContestants(contestants);
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
    pickType: 'final3' | 'boot'
  ): Promise<boolean> => {
    try {
      const pick = await SupabaseService.addRosterPick(userId, leagueId, contestantId, pickType);
      
      if (pick) {
        // Update local state
        setRoster(prev => {
          const newRoster = [...prev];
          const emptySlotIndex = newRoster.findIndex(
            slot => slot.type === pickType && !slot.contestant
          );
          
          if (emptySlotIndex !== -1) {
            const contestant = availableContestants.find(c => c.id === contestantId);
            if (contestant) {
              newRoster[emptySlotIndex].contestant = contestant;
            }
          }
          
          return newRoster;
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding contestant:', err);
      setError('Failed to add contestant');
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

  // Get contestants not in roster
  const getAvailableContestants = (): Contestant[] => {
    const rosterContestantIds = roster
      .map(slot => slot.contestant?.id)
      .filter(Boolean);
    
    return availableContestants.filter(
      contestant => !rosterContestantIds.includes(contestant.id)
    );
  };

  // Initialize data
  useEffect(() => {
    fetchRoster();
    // TODO: Get season ID from league
    fetchContestants('s47');
    calculatePoints();
  }, [leagueId, userId]);

  return {
    roster,
    availableContestants: getAvailableContestants(),
    totalPoints,
    isLoading,
    error,
    addContestantToRoster,
    removeContestantFromRoster,
    replaceContestant,
    refreshRoster: fetchRoster,
  };
};
