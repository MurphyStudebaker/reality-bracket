import { useMemo } from 'react';
import useSWR from 'swr';
import { fetcher, createKey } from '../../lib/swr';
import { scoreActivityEventForPick } from '../../lib/scoringRules';
import {
  formatActivityType,
  getActivityEventDisplayPoints,
} from '../../lib/activityEventDisplay';
import ActivityEventIcon from '../activity/ActivityEventIcon';

interface ActivityEvent {
  id: string;
  contestantId: string;
  contestantName: string;
  weekNumber: number;
  activityType: string;
  createdAt: string;
}

interface EventAwardee {
  userId: string;
  displayName: string;
  points: number;
}

interface LeagueActivityContentProps {
  leagueId: string | null;
  seasonId: string | null;
  seasonCompleted?: boolean;
}

export default function LeagueActivityContent({
  leagueId,
  seasonId,
  seasonCompleted = false,
}: LeagueActivityContentProps) {
  const rosterPicksKey = createKey('league-activity-roster-picks', leagueId);
  const { data: rosterPicks = [], isLoading: isLoadingPicks } = useSWR<Array<{
    id: string;
    userId: string;
    contestantId: string;
    pickType: 'final3' | 'boot';
    weekNumber?: number;
    final3Position?: number;
    activeFromWeek?: number;
    activeThroughWeek?: number;
    displayName: string;
  }>>(rosterPicksKey, fetcher);

  const activityEventsKey = createKey('league-activity-events', seasonId);
  const { data: activityEvents = [], isLoading: isLoadingEvents } = useSWR<ActivityEvent[]>(
    activityEventsKey,
    fetcher
  );

  const isLoading = isLoadingPicks || isLoadingEvents;

  const weekEventRows = useMemo(() => {
    if (!seasonId || activityEvents.length === 0) {
      return {} as Record<number, Array<{ event: ActivityEvent; awardees: EventAwardee[] }>>;
    }

    const contestantPicksMap: Record<string, Array<{
      userId: string;
      displayName: string;
      pickType: 'final3' | 'boot';
      weekNumber?: number;
      final3Position?: number;
      activeFromWeek?: number;
      activeThroughWeek?: number;
    }>> = {};

    rosterPicks.forEach(pick => {
      if (!contestantPicksMap[pick.contestantId]) {
        contestantPicksMap[pick.contestantId] = [];
      }
      contestantPicksMap[pick.contestantId].push({
        userId: pick.userId,
        displayName: pick.displayName,
        pickType: pick.pickType,
        weekNumber: pick.weekNumber,
        final3Position: pick.final3Position,
        activeFromWeek: pick.activeFromWeek,
        activeThroughWeek: pick.activeThroughWeek,
      });
    });

    const grouped: Record<number, Array<{ event: ActivityEvent; awardees: EventAwardee[] }>> = {};

    activityEvents.forEach(event => {
      const picks = contestantPicksMap[event.contestantId] || [];
      const awardees: EventAwardee[] = [];

      picks.forEach(pick => {
        const points = scoreActivityEventForPick(
          { weekNumber: event.weekNumber, activityType: event.activityType },
          {
            pickType: pick.pickType,
            weekNumber: pick.weekNumber,
            final3Position: pick.final3Position,
            activeFromWeek: pick.activeFromWeek,
            activeThroughWeek: pick.activeThroughWeek,
            seasonCompleted,
          }
        );

        if (points > 0) {
          awardees.push({
            userId: pick.userId,
            displayName: pick.displayName,
            points,
          });
        }
      });

      if (!grouped[event.weekNumber]) {
        grouped[event.weekNumber] = [];
      }
      grouped[event.weekNumber].push({ event, awardees });
    });

    Object.values(grouped).forEach(rows => {
      rows.sort(
        (a, b) =>
          new Date(b.event.createdAt).getTime() - new Date(a.event.createdAt).getTime()
      );
    });

    return grouped;
  }, [rosterPicks, activityEvents, seasonId, seasonCompleted]);

  if (isLoading) {
    return (
      <div className="text-center text-slate-400 py-8 text-sm">Loading activity...</div>
    );
  }

  if (activityEvents.length === 0) {
    return (
      <div className="text-center text-slate-400 py-8 text-sm">
        No activity events yet. Points will appear here as events are added.
      </div>
    );
  }

  const weeks = Object.keys(weekEventRows)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="w-full space-y-8">
      {weeks.map(week => {
        const rows = weekEventRows[week];

        return (
          <div key={week}>
            <h3 className="text-base font-semibold text-white mb-4">Week {week}</h3>
            <div className="space-y-4">
              {rows.map(({ event, awardees }) => {
                const displayPoints = getActivityEventDisplayPoints(event.activityType);

                return (
                  <div key={event.id} className="activity-league-event-card">
                    <div className="activity-league-event-body">
                      <ActivityEventIcon activityType={event.activityType} active />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="activity-event-type-badge">
                            {formatActivityType(event.activityType)}
                          </span>
                          {displayPoints != null && (
                            <span className="activity-event-base-points">+{displayPoints} pts</span>
                          )}
                        </div>
                        <p className="activity-contestant-name">{event.contestantName}</p>
                      </div>
                    </div>

                    <div className="activity-league-event-footer">
                      {awardees.length === 0 ? (
                        <p className="text-sm text-slate-400" style={{ fontStyle: 'italic' }}>
                          No one in this league earned points from this event
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-slate-400">Points awarded to:</p>
                          <div className="flex flex-wrap gap-2">
                            {awardees.map(awardee => (
                              <div
                                key={`${event.id}-${awardee.userId}`}
                                className="activity-member-chip"
                              >
                                <span className="activity-member-chip__name">
                                  {awardee.displayName}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
