// ViewModel for League Page - handles league standings and activity

import { useState, useEffect } from 'react';
import { SupabaseService } from '../services/supabaseService';
import type { LeagueStanding, League } from '../models';
import { leagueStandings } from '../data/mockData';

export const useLeagueViewModel = (leagueId: string) => {
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [league, setLeague] = useState<League | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch league standings
  const fetchStandings = async () => {
    try {
      setIsLoading(true);
      const data = await SupabaseService.getLeagueStandings(leagueId);
      
      if (data && data.length > 0) {
        setStandings(data);
      } else {
        // Fallback to mock data
        setStandings(leagueStandings);
      }
    } catch (err) {
      console.error('Error fetching standings:', err);
      setError('Failed to load standings');
      // Fallback to mock data
      setStandings(leagueStandings);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch league member count
  const fetchMemberCount = async () => {
    try {
      const count = await SupabaseService.getLeagueMemberCount(leagueId);
      setMemberCount(count || 12); // Default to mock data
    } catch (err) {
      console.error('Error fetching member count:', err);
      setMemberCount(12); // Default to mock data
    }
  };

  // Get top 3 standings for podium
  const getTopThree = (): LeagueStanding[] => {
    return standings.slice(0, 3);
  };

  // Get remaining standings (4th place and below)
  const getRemainingStandings = (): LeagueStanding[] => {
    return standings.slice(3);
  };

  // Get league stats
  const getLeagueStats = () => {
    if (standings.length === 0) {
      return {
        highestScore: 0,
        averageScore: 0,
        totalMembers: memberCount,
      };
    }

    const highestScore = standings[0]?.points || 0;
    const averageScore = Math.round(
      standings.reduce((sum, standing) => sum + standing.points, 0) / standings.length
    );

    return {
      highestScore,
      averageScore,
      totalMembers: memberCount,
    };
  };

  // Initialize data
  useEffect(() => {
    fetchStandings();
    fetchMemberCount();

    // Set up real-time subscription for standings updates
    // TODO: Implement Supabase real-time subscriptions
    // const subscription = supabase
    //   .channel('league-standings')
    //   .on('postgres_changes', {
    //     event: '*',
    //     schema: 'public',
    //     table: 'league_members',
    //     filter: `league_id=eq.${leagueId}`
    //   }, () => {
    //     fetchStandings();
    //   })
    //   .subscribe();

    // return () => {
    //   subscription.unsubscribe();
    // };
  }, [leagueId]);

  return {
    standings,
    topThree: getTopThree(),
    remainingStandings: getRemainingStandings(),
    league,
    memberCount,
    leagueStats: getLeagueStats(),
    isLoading,
    error,
    refreshStandings: fetchStandings,
  };
};
