// ViewModel for Home Page - handles leagues and seasons display

import { useMemo } from 'react';
import useSWR from 'swr';
import { mutate } from 'swr';
import { SupabaseService } from '../services/supabaseService';
import { fetcher, createKey } from '../lib/swr';
import type { League, Season } from '../models';
import { myLeagues, availableSeasons } from '../data/mockData';

export const useHomeViewModel = () => {
  // Note: This ViewModel requires userId to be passed or fetched from auth context
  // For now, we'll need to get userId from auth context or pass it as a parameter
  // This is a simplified version - the actual implementation is in useHomeViewModel.ts
  
  // Fetch available seasons using SWR (no userId needed)
  const seasonsKey = createKey('seasons');
  const { data: seasonsData = [], error: seasonsError, isLoading: isLoadingSeasons } = useSWR<Season[]>(
    seasonsKey,
    fetcher
  );

  // Use fallback data if SWR returns empty or error
  const seasons = useMemo(() => {
    if (seasonsError || (seasonsData.length === 0 && !isLoadingSeasons)) {
      return availableSeasons as any;
    }
    return seasonsData;
  }, [seasonsData, seasonsError, isLoadingSeasons]);

  // Create a new league
  const createLeague = async (
    name: string,
    seasonId: string,
    userId: string,
    draftDate?: string
  ): Promise<boolean> => {
    try {
      const newLeague = await SupabaseService.createLeague(name, seasonId, userId, draftDate);
      if (newLeague) {
        // Invalidate leagues cache
        const leaguesKey = createKey('leagues', userId);
        if (leaguesKey) await mutate(leaguesKey);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating league:', err);
      return false;
    }
  };

  // Join a league with invite code
  const joinLeague = async (inviteCode: string, userId: string): Promise<boolean> => {
    try {
      const league = await SupabaseService.joinLeagueByInviteCode(inviteCode, userId);
      if (league) {
        // Invalidate leagues cache
        const leaguesKey = createKey('leagues', userId);
        if (leaguesKey) await mutate(leaguesKey);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error joining league:', err);
      return false;
    }
  };

  // Fetch leagues function (requires userId)
  const fetchLeagues = async (userId: string) => {
    const leaguesKey = createKey('leagues', userId);
    if (leaguesKey) await mutate(leaguesKey);
  };

  return {
    leagues: [], // This ViewModel doesn't fetch leagues - use useHomeViewModel.ts instead
    seasons,
    isLoading: isLoadingSeasons,
    error: seasonsError ? 'Failed to load seasons' : null,
    createLeague,
    joinLeague,
    refreshLeagues: fetchLeagues,
  };
};
