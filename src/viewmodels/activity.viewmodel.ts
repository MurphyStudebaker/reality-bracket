// ViewModel for Latest Activity - handles activity feed

import { useState, useEffect } from 'react';
import { SupabaseService } from '../services/supabaseService';
import type { ActivityItem } from '../models';
import { latestActivity } from '../data/mockData';

export const useActivityViewModel = (leagueId: string) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch league activity
  const fetchActivity = async (limit: number = 20) => {
    try {
      setIsLoading(true);
      const data = await SupabaseService.getLeagueActivity(leagueId, limit);
      
      if (data && data.length > 0) {
        setActivities(data);
      } else {
        // Fallback to mock data
        setActivities(latestActivity);
      }
    } catch (err) {
      console.error('Error fetching activity:', err);
      setError('Failed to load activity');
      // Fallback to mock data
      setActivities(latestActivity);
    } finally {
      setIsLoading(false);
    }
  };

  // Group activities by week
  const getActivitiesByWeek = (): Map<number, ActivityItem[]> => {
    const groupedActivities = new Map<number, ActivityItem[]>();
    
    activities.forEach(activity => {
      const week = activity.week;
      if (!groupedActivities.has(week)) {
        groupedActivities.set(week, []);
      }
      groupedActivities.get(week)!.push(activity);
    });

    return groupedActivities;
  };

  // Get latest week activities
  const getLatestWeekActivities = (): ActivityItem[] => {
    if (activities.length === 0) return [];
    
    const latestWeek = Math.max(...activities.map(a => a.week));
    return activities.filter(a => a.week === latestWeek);
  };

  // Initialize data
  useEffect(() => {
    fetchActivity();

    // Set up real-time subscription for activity updates
    // TODO: Implement Supabase real-time subscriptions
    // const subscription = supabase
    //   .channel('league-activity')
    //   .on('postgres_changes', {
    //     event: 'INSERT',
    //     schema: 'public',
    //     table: 'activity_items',
    //     filter: `league_id=eq.${leagueId}`
    //   }, (payload) => {
    //     setActivities(prev => [payload.new as ActivityItem, ...prev]);
    //   })
    //   .subscribe();

    // return () => {
    //   subscription.unsubscribe();
    // };
  }, [leagueId]);

  return {
    activities,
    activitiesByWeek: getActivitiesByWeek(),
    latestWeekActivities: getLatestWeekActivities(),
    isLoading,
    error,
    refreshActivity: () => fetchActivity(),
  };
};
