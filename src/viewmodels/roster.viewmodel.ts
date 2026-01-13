// ViewModel for Roster Page - handles user roster management

import { useMemo, useEffect, useState } from 'react';
import useSWR from 'swr';
import { mutate } from 'swr';
import { SupabaseService } from '../services/supabaseService';
import { fetcher, createKey } from '../lib/swr';
import type { RosterPick, Contestant, RosterSlot, League } from '../models';

export const useRosterViewModel = (leagueId: string | null, userId: string | null) => {
  // Fetch roster data using SWR
  const rosterKey = createKey('roster', userId, leagueId);
  const { data: picks, error: rosterError, isLoading: isLoadingRoster } = useSWR<RosterPick[]>(
    rosterKey,
    fetcher
  );

  // Fetch season ID from league
  const seasonIdKey = createKey('league-season', leagueId);
  const { data: seasonId, error: seasonError } = useSWR<string | null>(
    seasonIdKey,
    fetcher
  );

  // Fetch contestants for the season
  const contestantsKey = createKey('contestants', seasonId);
  const { data: availableContestants = [], error: contestantsError } = useSWR<Contestant[]>(
    contestantsKey,
    fetcher
  );

  // Calculate total points
  const pointsKey = createKey('points', userId, leagueId);
  const { data: totalPoints = 0, error: pointsError } = useSWR<number>(
    pointsKey,
    fetcher
  );

  // Fetch points for each pick
  const [pickPointsMap, setPickPointsMap] = useState<Record<string, number>>({});

  // Use a stable representation of picks for dependency checking
  const picksKey = picks?.map(p => `${p.id}:${p.contestant?.id || 'null'}`).sort().join(',') || '';

  useEffect(() => {
    if (!userId || !leagueId || !picks || picks.length === 0) {
      setPickPointsMap({});
      return;
    }

    const fetchPickPoints = async () => {
      const pointsMap: Record<string, number> = {};

      // Calculate points for each pick
      await Promise.all(
        picks.map(async (pick) => {
          if (pick.contestant) {
            const points = await SupabaseService.calculatePickPoints(
              userId,
              leagueId,
              pick.contestant.id,
              pick.pickType
            );
            pointsMap[pick.id] = points;
          }
        })
      );

      setPickPointsMap(pointsMap);
    };

    fetchPickPoints();
  }, [userId, leagueId, picksKey]);

  // Transform picks into roster slots
  const roster = useMemo<RosterSlot[]>(() => {
    const rosterSlots: RosterSlot[] = [
      { type: 'final3', contestant: null, points: 0 },
      { type: 'final3', contestant: null, points: 0 },
      { type: 'final3', contestant: null, points: 0 },
      { type: 'boot', contestant: null, points: 0 },
    ];

    if (picks && picks.length > 0) {
      // Separate final3 and boot picks
      const final3Picks = picks.filter(p => p.pickType === 'final3');
      const bootPicks = picks.filter(p => p.pickType === 'boot');
      
      // Fill final3 slots (up to 3)
      final3Picks.forEach((pick, index) => {
        if (index < 3 && pick.contestant) {
          rosterSlots[index].contestant = pick.contestant;
          rosterSlots[index].points = pickPointsMap[pick.id] || 0;
          rosterSlots[index].pickId = pick.id;
        }
      });
      
      // Fill boot slot (only one)
      if (bootPicks.length > 0 && bootPicks[0].contestant) {
        rosterSlots[3].contestant = bootPicks[0].contestant;
        rosterSlots[3].points = pickPointsMap[bootPicks[0].id] || 0;
        rosterSlots[3].pickId = bootPicks[0].id;
      }
    }

    return rosterSlots;
  }, [picks, pickPointsMap]);

  // Combine all errors
  const error = rosterError || seasonError || contestantsError || pointsError 
    ? 'Failed to load roster data' 
    : null;

  // Combined loading state
  const isLoading = isLoadingRoster && (leagueId !== null && userId !== null);

  // Refresh function to revalidate all related data
  const refreshRoster = async () => {
    if (rosterKey) await mutate(rosterKey);
    if (pointsKey) await mutate(pointsKey);
    // Also refresh contestants if seasonId changes
    if (contestantsKey) await mutate(contestantsKey);
    // Reset pick points map to trigger recalculation
    setPickPointsMap({});
  };

  // Add a contestant to roster
  const addContestantToRoster = async (
    contestantId: string,
    pickType: 'final3' | 'boot',
    slotIndex?: number
  ): Promise<boolean> => {
    if (!userId || !leagueId) {
      return false;
    }

    try {
      // For boot picks, remove existing boot pick first (only one boot slot allowed)
      if (pickType === 'boot') {
        const existingBootPick = picks?.find(p => p.pickType === 'boot');
        if (existingBootPick) {
          await SupabaseService.removeRosterPick(existingBootPick.id);
        }
      }

      // For final3 picks during draft, if slotIndex is provided and that slot already has a pick, remove it
      if (pickType === 'final3' && slotIndex !== undefined) {
        const slot = roster[slotIndex];
        if (slot?.pickId) {
          await SupabaseService.removeRosterPick(slot.pickId);
        }
      }

      const pick = await SupabaseService.addRosterPick(userId, leagueId, contestantId, pickType);

      if (pick) {
        // Invalidate and revalidate cache
        await refreshRoster();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error adding contestant:', err);
      return false;
    }
  };

  // Remove a contestant from roster
  const removeContestantFromRoster = async (pickId: string): Promise<boolean> => {
    try {
      await SupabaseService.removeRosterPick(pickId);
      
      // Invalidate and revalidate cache
      await refreshRoster();
      return true;
    } catch (err) {
      console.error('Error removing contestant:', err);
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

  return {
    roster,
    availableContestants,
    totalPoints,
    isLoading,
    error,
    addContestantToRoster,
    removeContestantFromRoster,
    replaceContestant,
    refreshRoster,
    seasonId,
  };
};
