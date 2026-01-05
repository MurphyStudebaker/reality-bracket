// ViewModel for League Page - handles league standings and activity

import { useMemo } from 'react';
import useSWR from 'swr';
import { mutate } from 'swr';
import { fetcher, createKey } from '../lib/swr';
import type { LeagueStanding, League } from '../models';
import { leagueStandings } from '../data/mockData';

export const useLeagueViewModel = (leagueId: string) => {
  // Fetch league standings using SWR
  const standingsKey = createKey('standings', leagueId);
  const { data: standings = [], error: standingsError, isLoading: isLoadingStandings } = useSWR<LeagueStanding[]>(
    standingsKey,
    fetcher
  );

  // Fetch league member count using SWR
  const memberCountKey = createKey('member-count', leagueId);
  const { data: memberCount = 12, error: memberCountError } = useSWR<number>(
    memberCountKey,
    fetcher
  );

  // Use fallback data if SWR returns empty or error
  const finalStandings = useMemo(() => {
    if (standingsError || (standings.length === 0 && !isLoadingStandings)) {
      return leagueStandings;
    }
    return standings;
  }, [standings, standingsError, isLoadingStandings]);

  const finalMemberCount = useMemo(() => {
    if (memberCountError) {
      return 12;
    }
    return memberCount;
  }, [memberCount, memberCountError]);

  // Get top 3 standings for podium
  const topThree = useMemo(() => {
    return finalStandings.slice(0, 3);
  }, [finalStandings]);

  // Get remaining standings (4th place and below)
  const remainingStandings = useMemo(() => {
    return finalStandings.slice(3);
  }, [finalStandings]);

  // Get league stats
  const leagueStats = useMemo(() => {
    if (finalStandings.length === 0) {
      return {
        highestScore: 0,
        averageScore: 0,
        totalMembers: finalMemberCount,
      };
    }

    const highestScore = finalStandings[0]?.points || 0;
    const averageScore = Math.round(
      finalStandings.reduce((sum, standing) => sum + standing.points, 0) / finalStandings.length
    );

    return {
      highestScore,
      averageScore,
      totalMembers: finalMemberCount,
    };
  }, [finalStandings, finalMemberCount]);

  // Refresh function
  const refreshStandings = async () => {
    if (standingsKey) await mutate(standingsKey);
    if (memberCountKey) await mutate(memberCountKey);
  };

  return {
    standings: finalStandings,
    topThree,
    remainingStandings,
    league: null, // TODO: Add league fetching if needed
    memberCount: finalMemberCount,
    leagueStats,
    isLoading: isLoadingStandings,
    error: standingsError || memberCountError ? 'Failed to load league data' : null,
    refreshStandings,
  };
};
