import React from 'react';
import { useMemo } from 'react';
import useSWR from 'swr';
import { fetcher, createKey } from '../../lib/swr';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { Contestant, RosterPickWithContestant, RosterSlot } from '../../models';
import { scoreActivityEventForPick } from '../../lib/scoringRules';

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

  const formatActivityType = (type: string): string => {
    const typeMap: Record<string, string> = {
      tribal_immunity: 'Tribal Immunity',
      individual_immunity: 'Individual Immunity',
      found_immunity_idol: 'Found Immunity Idol',
      immunity: 'Immunity',
      eliminated: 'Eliminated',
      medical_evacuated: 'Medical Evacuation',
      made_merge: 'Made Merge',
      made_final_three: 'Made Final 3',
      made_jury: 'Made Jury',
      finished_first: 'Finished as Sole Survivor',
      finished_second: 'Finished as Runner Up',
      finished_third: 'Finished in Third Place',
    };
    return typeMap[type] || type;
  };

  if (contestantIds.length === 0) {
    return (
      <div className="text-center text-slate-400 py-4 text-sm">
        No drafted players yet
      </div>
    );
  }

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="text-center text-slate-400 py-4 text-sm">Loading activity...</div>
      ) : scoredActivityEvents.length === 0 ? (
        <div className="text-center text-slate-400 py-4 text-sm">
          No activity events yet. Points will appear here as events are added.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(eventsByWeek)
            .map(Number)
            .sort((a, b) => b - a)
            .map((weekNumber) => {
              const events = eventsByWeek[weekNumber];
              const totalPoints = events.reduce((sum, event) => sum + event.points, 0);
              const sortedEvents = [...events]
                .filter((e) => e.points > 0)
                .sort((a, b) => {
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });

              return (
                <div key={weekNumber}>
                  <div className="flex items-center justify-between mb-2 gap-5">
                    <h3 className="text-lg font-semibold text-white">Week {weekNumber}</h3>
                    {totalPoints > 0 ? (
                      <div className="text-sm font-semibold shrink-0" style={{ color: '#BFFF0B' }}>
                        +{totalPoints} pts
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 text-right">
                        No points awarded to your roster this week.
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    {sortedEvents.map((event) => {
                      const metadata = contestantMetadata[event.contestantId];
                      const contestant = metadata?.contestant;
                      const pickType = metadata?.pickType;
                      const weekPickNumber = metadata?.weekNumber;

                      if (!contestant || !pickType) return null;

                      return (
                        <div
                          key={event.id}
                          className="bg-slate-800/50 rounded-lg p-3 border border-slate-700"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar
                              className={`w-10 h-10 border-2 flex-shrink-0 ${
                                pickType === 'boot' ? 'border-red-500' : 'border-[#BFFF0B]'
                              }`}
                            >
                              <AvatarImage
                                src={contestant.imageUrl}
                                alt={contestant.name}
                                className="object-cover"
                              />
                              <AvatarFallback className="text-xs bg-slate-700 text-white">
                                {contestant.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-white">
                                {contestant.name} - {formatActivityType(event.activityType)}
                              </div>
                              <div className="text-xs text-slate-400">
                                {pickType === 'boot'
                                  ? `Next Boot${weekPickNumber ? ` • Week ${weekPickNumber}` : ''}`
                                  : 'Final 3'}
                              </div>
                            </div>
                            <div className="text-xs font-semibold ml-2 flex-shrink-0" style={{ color: '#BFFF0B' }}>
                              +{event.points} pts
                            </div>
                          </div>
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
