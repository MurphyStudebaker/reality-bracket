import { useMemo } from 'react';
import useSWR from 'swr';
import { fetcher, createKey } from '../../lib/swr';

interface ActivityEvent {
  id: string;
  contestantId: string;
  contestantName: string;
  weekNumber: number;
  activityType: string;
  createdAt: string;
}

interface UserActivity {
  userId: string;
  displayName: string;
  contestantName: string;
  pickType: 'final3' | 'boot';
  activityType: string;
  points: number;
  weekNumber: number;
}

interface LeagueActivityContentProps {
  leagueId: string | null;
  seasonId: string | null;
}

export default function LeagueActivityContent({ leagueId, seasonId }: LeagueActivityContentProps) {
  // Fetch roster picks using SWR
  const rosterPicksKey = createKey('league-activity-roster-picks', leagueId);
  const { data: rosterPicks = [], isLoading: isLoadingPicks } = useSWR<Array<{
    id: string;
    userId: string;
    contestantId: string;
    pickType: 'final3' | 'boot';
    displayName: string;
  }>>(rosterPicksKey, fetcher);

  // Fetch activity events using SWR
  const activityEventsKey = createKey('league-activity-events', seasonId);
  const { data: activityEvents = [], isLoading: isLoadingEvents } = useSWR<ActivityEvent[]>(
    activityEventsKey,
    fetcher
  );

  const isLoading = isLoadingPicks || isLoadingEvents;

  // Process and combine the data
  const userActivities = useMemo(() => {
    if (!leagueId || !seasonId || rosterPicks.length === 0 || activityEvents.length === 0) {
      return [];
    }

    // Create a map of contestant ID to roster picks
    const contestantPicksMap: Record<string, Array<{
      userId: string;
      displayName: string;
      pickType: 'final3' | 'boot';
    }>> = {};

    rosterPicks.forEach(pick => {
      if (!contestantPicksMap[pick.contestantId]) {
        contestantPicksMap[pick.contestantId] = [];
      }
      contestantPicksMap[pick.contestantId].push({
        userId: pick.userId,
        displayName: pick.displayName,
        pickType: pick.pickType,
      });
    });

    // Calculate points for each activity event
    const activities: UserActivity[] = [];
    
    activityEvents.forEach(event => {
      const picks = contestantPicksMap[event.contestantId] || [];
      
      picks.forEach(pick => {
        let points = 0;
        
        if (pick.pickType === 'boot') {
          // Boot pick: +15 pts for eliminated or medical_evacuated
          if (event.activityType === 'eliminated' || event.activityType === 'medical_evacuated') {
            points = 15;
          }
        } else if (pick.pickType === 'final3') {
          // Final 3 pick: +5 for tribal immunity, +10 for individual immunity, +5 for made_jury, +5 for made_final_three
          if (event.activityType === 'tribal_immunity') {
            points = 5;
          } else if (event.activityType === 'individual_immunity' || event.activityType === 'immunity') {
            points = 10;
          } else if (event.activityType === 'made_jury') {
            points = 5;
          } else if (event.activityType === 'made_final_three') {
            points = 5;
          }
        }

        if (points > 0) {
          activities.push({
            userId: pick.userId,
            displayName: pick.displayName,
            contestantName: event.contestantName,
            pickType: pick.pickType,
            activityType: event.activityType,
            points,
            weekNumber: event.weekNumber,
          });
        }
      });
    });

    return activities;
  }, [rosterPicks, activityEvents, leagueId, seasonId]);

  // Group activities by week
  const activitiesByWeek = useMemo(() => {
    const grouped: Record<number, UserActivity[]> = {};
    userActivities.forEach(activity => {
      if (!grouped[activity.weekNumber]) {
        grouped[activity.weekNumber] = [];
      }
      grouped[activity.weekNumber].push(activity);
    });
    return grouped;
  }, [userActivities]);

  // Format activity type for display
  const formatActivityType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'tribal_immunity': 'Tribal Immunity',
      'individual_immunity': 'Individual Immunity',
      'immunity': 'Immunity',
      'eliminated': 'Eliminated',
      'medical_evacuated': 'Medical Evacuation',
      'made_merge': 'Made Merge',
      'made_final_three': 'Made Final 3',
      'made_jury': 'Made Jury',
    };
    return typeMap[type] || type;
  };

  if (isLoading) {
    return (
      <div className="text-center text-slate-400 py-8 text-sm">Loading activity...</div>
    );
  }

  if (userActivities.length === 0) {
    return (
      <div className="text-center text-slate-400 py-8 text-sm">
        No activity events yet. Points will appear here as events are added.
      </div>
    );
  }

  // Get weeks sorted (newest first)
  const weeks = Object.keys(activitiesByWeek)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="w-full space-y-6 flex flex-col gap-4">
      {weeks.map(week => {
        const weekActivities = activitiesByWeek[week];
        
        // Group by user for this week
        const byUser: Record<string, UserActivity[]> = {};
        weekActivities.forEach(activity => {
          if (!byUser[activity.userId]) {
            byUser[activity.userId] = [];
          }
          byUser[activity.userId].push(activity);
        });

        return (
          <div key={week} className="">
            <h3 className="text-lg font-semibold text-white mb-8">Week {week}</h3>
            <div className="h4"></div>
            <div className="space-y-3">
              {Object.entries(byUser).map(([userId, activities]) => {
                const totalPoints = activities.reduce((sum, a) => sum + a.points, 0);
                const displayName = activities[0].displayName;

                return (
                  <div
                    key={userId}
                    className="bg-slate-800/50 rounded-lg p-3 border border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-white">{displayName}</h4>
                      <div className="text-sm font-semibold" style={{ color: '#BFFF0B' }}>
                        +{totalPoints} pts
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {activities.map((activity, idx) => (
                        <div
                          key={`${activity.userId}-${activity.contestantName}-${activity.activityType}-${idx}`}
                          className="flex items-center justify-between py-1.5 px-2 bg-slate-800/50 rounded"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-white">
                              {activity.contestantName} - {formatActivityType(activity.activityType)}
                            </div>
                            <div className="text-xs text-slate-400">
                              {activity.pickType === 'boot' ? 'Next Boot' : 'Final 3'}
                            </div>
                          </div>
                          <div className="text-xs font-semibold ml-2 flex-shrink-0" style={{ color: '#BFFF0B' }}>
                            +{activity.points} pts
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

