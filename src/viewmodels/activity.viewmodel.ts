// ViewModel for Latest Activity - handles activity feed

import { useMemo } from 'react';
import useSWR from 'swr';
import { mutate } from 'swr';
import { fetcher, createKey } from '../lib/swr';
import type { ActivityItem } from '../models';
import { latestActivity } from '../data/mockData';

export const useActivityViewModel = (leagueId: string, limit: number = 20) => {
  // Fetch league activity using SWR
  const activityKey = createKey('activity', leagueId, limit.toString());
  const { data: activitiesData = [], error: activityError, isLoading } = useSWR<ActivityItem[]>(
    activityKey,
    fetcher
  );

  // Use fallback data if SWR returns empty or error
  const activities = useMemo(() => {
    if (activityError || (activitiesData.length === 0 && !isLoading)) {
      return latestActivity;
    }
    return activitiesData;
  }, [activitiesData, activityError, isLoading]);

  // Group activities by week
  const activitiesByWeek = useMemo(() => {
    const groupedActivities = new Map<number, ActivityItem[]>();
    
    activities.forEach(activity => {
      const week = activity.week;
      if (!groupedActivities.has(week)) {
        groupedActivities.set(week, []);
      }
      groupedActivities.get(week)!.push(activity);
    });

    return groupedActivities;
  }, [activities]);

  // Get latest week activities
  const latestWeekActivities = useMemo(() => {
    if (activities.length === 0) return [];
    
    const latestWeek = Math.max(...activities.map(a => a.week));
    return activities.filter(a => a.week === latestWeek);
  }, [activities]);

  // Refresh function
  const refreshActivity = async () => {
    if (activityKey) await mutate(activityKey);
  };

  return {
    activities,
    activitiesByWeek,
    latestWeekActivities,
    isLoading,
    error: activityError ? 'Failed to load activity' : null,
    refreshActivity,
  };
};
