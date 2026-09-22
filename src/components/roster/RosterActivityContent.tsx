import { useMemo } from 'react';
import useSWR from 'swr';
import { fetcher, createKey } from '../../lib/swr';
import type { Contestant, RosterPickWithContestant, RosterSlot } from '../../models';
import { scoreActivityEventForPick } from '../../lib/scoringRules';
import {
  formatActivityType,
  getActivityEventDisplayPoints,
  isBootCorrectPrediction,
} from '../../lib/activityEventDisplay';
import { Check } from 'lucide-react';
import ActivityEventIcon from '../activity/ActivityEventIcon';

interface ActivityEvent {
  id: string;
  contestantId: string;
  contestantName: string;
  weekNumber: number;
  activityType: string;
  points: number;
  createdAt: string;
}

interface RosterActivityContentProps {
  roster: RosterSlot[];
  picks: RosterPickWithContestant[];
  seasonId: string | null;
  userId: string | null;
  leagueId: string | null;
  seasonCompleted?: boolean;
}

export default function RosterActivityContent({
  roster,
  picks,
  seasonId,
  seasonCompleted = false,
}: RosterActivityContentProps) {
  const contestantMetadata = useMemo<
    Record<
      string,
      {
        contestant: Contestant;
        pickType: 'final3' | 'boot';
        weekNumber?: number;
        activeFromWeek?: number;
        activeThroughWeek?: number;
        final3Position?: number;
      }
    >
  >(() => {
    const map: Record<
      string,
      {
        contestant: Contestant;
        pickType: 'final3' | 'boot';
        weekNumber?: number;
        activeFromWeek?: number;
        activeThroughWeek?: number;
        final3Position?: number;
      }
    > = {};

    picks.forEach((pick) => {
      if (pick.contestant) {
        map[pick.contestant.id] = {
          contestant: pick.contestant,
          pickType: pick.pickType,
          weekNumber: pick.weekNumber,
          activeFromWeek: pick.activeFromWeek,
          activeThroughWeek: pick.activeThroughWeek,
          final3Position: pick.final3Position,
        };
      }
    });

    roster.forEach((slot, index) => {
      if (slot.contestant && !map[slot.contestant.id]) {
        map[slot.contestant.id] = {
          contestant: slot.contestant,
          pickType: slot.type,
          weekNumber: slot.weekNumber,
          activeFromWeek: slot.activeFromWeek,
          activeThroughWeek: slot.activeThroughWeek,
          final3Position: slot.type === 'final3' ? index + 1 : undefined,
        };
      }
    });

    return map;
  }, [picks, roster]);
  const contestantIds = useMemo(() => Object.keys(contestantMetadata), [contestantMetadata]);

  const activityKey = createKey(
    'roster-activity',
    seasonId,
    contestantIds.length > 0 ? contestantIds.join(',') : null
  );
  const { data: rawEvents = [], isLoading } = useSWR<Array<{
    id: string;
    contestantId: string;
    contestantName: string;
    weekNumber: number;
    activityType: string;
    createdAt: string;
  }>>(activityKey, fetcher);

  const scoredActivityEvents = useMemo(() => {
    return rawEvents.map((event) => {
      const metadata = contestantMetadata[event.contestantId];
      const pickType = metadata?.pickType;
      if (!pickType || !metadata) {
        return { ...event, points: 0 };
      }

      const points = scoreActivityEventForPick(
        { weekNumber: event.weekNumber, activityType: event.activityType },
        {
          pickType,
          weekNumber: metadata.weekNumber,
          activeFromWeek: metadata.activeFromWeek,
          activeThroughWeek: metadata.activeThroughWeek,
          final3Position: metadata.final3Position,
          seasonCompleted,
        }
      );

      return { ...event, points };
    });
  }, [rawEvents, contestantMetadata, seasonCompleted]);

  const eventsByWeek = useMemo<Record<number, ActivityEvent[]>>(() => {
    const grouped: Record<number, ActivityEvent[]> = {};
    scoredActivityEvents.forEach((event) => {
      if (!grouped[event.weekNumber]) {
        grouped[event.weekNumber] = [];
      }
      grouped[event.weekNumber].push(event);
    });
    return grouped;
  }, [scoredActivityEvents]);

  const totalPoints = useMemo(
    () => scoredActivityEvents.reduce((sum, event) => sum + event.points, 0),
    [scoredActivityEvents]
  );

  if (contestantIds.length === 0) {
    return (
      <div className="text-center text-slate-400 py-4 text-sm">
        No drafted players yet
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">Weekly Points History</h2>
        <span className="activity-roster-header-total">Total: {totalPoints} pts</span>
      </div>

      {isLoading ? (
        <div className="text-center text-slate-400 py-4 text-sm">Loading activity...</div>
      ) : scoredActivityEvents.length === 0 ? (
        <div className="text-center text-slate-400 py-4 text-sm">
          No activity events yet. Points will appear here as events are added.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.keys(eventsByWeek)
            .map(Number)
            .sort((a, b) => b - a)
            .map((weekNumber) => {
              const events = eventsByWeek[weekNumber];
              const weekTotal = events.reduce((sum, event) => sum + event.points, 0);
              const sortedEvents = [...events].sort((a, b) => {
                if (a.points !== b.points) {
                  return b.points - a.points;
                }
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              });

              return (
                <div key={weekNumber}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-slate-400">Week {weekNumber}</h3>
                    {weekTotal > 0 && (
                      <span className="activity-roster-week-total">+{weekTotal} pts</span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {sortedEvents.map((event) => {
                      const metadata = contestantMetadata[event.contestantId];
                      const contestant = metadata?.contestant;
                      const pickType = metadata?.pickType;
                      const weekPickNumber = metadata?.weekNumber;
                      const awarded = event.points > 0;
                      const displayPoints = getActivityEventDisplayPoints(event.activityType);
                      const showCorrectPrediction =
                        awarded &&
                        pickType &&
                        isBootCorrectPrediction(
                          event.activityType,
                          pickType,
                          weekPickNumber,
                          event.weekNumber
                        );

                      if (!contestant || !pickType) return null;

                      return (
                        <div
                          key={event.id}
                          className={`activity-roster-row ${
                            awarded ? 'activity-roster-row--awarded' : 'activity-roster-row--muted'
                          }`}
                        >
                          <ActivityEventIcon
                            activityType={event.activityType}
                            active={awarded}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                              <span
                                className={`activity-roster-event-tag ${
                                  awarded
                                    ? 'activity-roster-event-tag--awarded'
                                    : 'activity-roster-event-tag--muted'
                                }`}
                              >
                                {formatActivityType(event.activityType)}
                              </span>
                            </div>
                            <p
                              className={`text-sm sm:text-base font-semibold truncate ${
                                awarded ? 'text-white' : 'text-slate-400'
                              }`}
                            >
                              {contestant.name}
                            </p>
                            {showCorrectPrediction && (
                              <p className="activity-correct-prediction">
                                <Check width={14} height={14} strokeWidth={3} />
                                Correct prediction!
                              </p>
                            )}
                          </div>
                          {awarded ? (
                            <span className="activity-points-pill activity-points-pill--md">
                              +{event.points}
                            </span>
                          ) : (
                            <span className="activity-roster-zero-badge">0</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
