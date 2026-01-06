// SWR Configuration and Fetchers
// This file provides SWR configuration and fetcher functions for Supabase data

import { SWRConfiguration } from 'swr';
import { SupabaseService } from '../services/supabaseService';

// Default SWR configuration
export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 2000, // Dedupe requests within 2 seconds
  focusThrottleInterval: 5000, // Throttle revalidation on focus to every 5 seconds
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  shouldRetryOnError: (error) => {
    // Don't retry on 4xx errors (client errors)
    if (error?.status >= 400 && error?.status < 500) {
      return false;
    }
    return true;
  },
};

// Generic fetcher function that handles different fetcher types
export const fetcher = async <T = any>(key: string): Promise<T> => {
  const [type, ...args] = key.split(':');
  
  switch (type) {
    case 'roster':
      return await SupabaseService.getRosterByUserAndLeague(args[0], args[1]) as T;
    
    case 'contestants':
      return await SupabaseService.getContestantsBySeason(args[0]) as T;
    
    case 'points':
      return await SupabaseService.calculateUserPoints(args[0], args[1]) as T;
    
    case 'league-season':
      const supabase = SupabaseService.getClient();
      const { data: league, error } = await supabase
        .from('leagues')
        .select('season_id')
        .eq('id', args[0])
        .single();
      if (error || !league) {
        console.error('Error fetching league season:', error);
        return null as T;
      }
      return league.season_id as T;
    
    case 'standings':
      return await SupabaseService.getLeagueStandings(args[0]) as T;
    
    case 'member-count':
      return await SupabaseService.getLeagueMemberCount(args[0]) as T;
    
    case 'leagues':
      return await SupabaseService.getLeaguesByUserId(args[0]) as T;
    
    case 'ui-leagues':
      return await SupabaseService.getUILeaguesByUserId(args[0]) as T;
    
    case 'leagues-selector':
      return await SupabaseService.getLeaguesForSelector(args[0]) as T;
    
    case 'league-display-names':
      return await SupabaseService.getLeagueDisplayNames(args[0]) as T;
    
    case 'seasons':
      return await SupabaseService.getSeasons() as T;
    
    case 'activity':
      return await SupabaseService.getLeagueActivity(args[0], parseInt(args[1] || '20')) as T;
    
    case 'current-user':
      return await SupabaseService.getCurrentUser() as T;
    
    case 'current-week':
      // First get season_id from league
      const supabaseClient = SupabaseService.getClient();
      const { data: leagueData, error: leagueErr } = await supabaseClient
        .from('leagues')
        .select('season_id')
        .eq('id', args[0])
        .single();
      if (leagueErr || !leagueData || !leagueData.season_id) {
        return 0 as T;
      }
      return await SupabaseService.getCurrentWeek(leagueData.season_id) as T;
    
    case 'roster-activity':
      // args[0] = seasonId, args[1] = comma-separated contestantIds
      const contestantIds = args[1] ? args[1].split(',') : [];
      if (!args[0] || contestantIds.length === 0) {
        return [] as T;
      }
      return await SupabaseService.getActivityEventsForContestants(args[0], contestantIds) as T;
    
    case 'league-activity-roster-picks':
      // args[0] = leagueId
      if (!args[0]) {
        return [] as T;
      }
      return await SupabaseService.getAllRosterPicksForLeague(args[0]) as T;
    
    case 'league-activity-events':
      // args[0] = seasonId
      if (!args[0]) {
        return [] as T;
      }
      return await SupabaseService.getActivityEventsForSeason(args[0]) as T;
    
    default:
      throw new Error(`Unknown fetcher type: ${type}`);
  }
};

// Helper to create SWR key
export const createKey = (type: string, ...args: (string | number | null | undefined)[]): string | null => {
  // Return null if any argument is null/undefined (SWR will skip the request)
  if (args.some(arg => arg === null || arg === undefined)) {
    return null;
  }
  return `${type}:${args.join(':')}`;
};

