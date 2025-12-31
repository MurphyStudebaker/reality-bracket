// ViewModel for Home Page - handles leagues and seasons display

import { useState, useEffect } from 'react';
import { SupabaseService } from '../services/supabaseService';
import type { League, Season } from '../models';
import { myLeagues, availableSeasons } from '../data/mockData';

export const useHomeViewModel = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's leagues
  const fetchLeagues = async (userId: string) => {
    try {
      setIsLoading(true);
      const data = await SupabaseService.getLeaguesByUserId(userId);
      if (data && data.length > 0) {
        setLeagues(data);
      } else {
        // Fallback to mock data
        setLeagues(myLeagues as any);
      }
    } catch (err) {
      console.error('Error fetching leagues:', err);
      setError('Failed to load leagues');
      // Fallback to mock data
      setLeagues(myLeagues as any);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available seasons
  const fetchSeasons = async () => {
    try {
      const data = await SupabaseService.getSeasons();
      if (data && data.length > 0) {
        setSeasons(data);
      } else {
        // Fallback to mock data
        setSeasons(availableSeasons as any);
      }
    } catch (err) {
      console.error('Error fetching seasons:', err);
      // Fallback to mock data
      setSeasons(availableSeasons as any);
    }
  };

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
        setLeagues(prev => [...prev, newLeague]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating league:', err);
      setError('Failed to create league');
      return false;
    }
  };

  // Join a league with invite code
  const joinLeague = async (inviteCode: string, userId: string): Promise<boolean> => {
    try {
      const league = await SupabaseService.joinLeagueByInviteCode(inviteCode, userId);
      if (league) {
        setLeagues(prev => [...prev, league]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error joining league:', err);
      setError('Failed to join league');
      return false;
    }
  };

  // Initialize data
  useEffect(() => {
    // TODO: Get current user ID from auth context
    const userId = 'current-user-id';
    fetchLeagues(userId);
    fetchSeasons();
  }, []);

  return {
    leagues,
    seasons,
    isLoading,
    error,
    createLeague,
    joinLeague,
    refreshLeagues: (userId: string) => fetchLeagues(userId),
  };
};
