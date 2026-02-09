import React from 'react';
import { useMemo } from 'react';
import useSWR from 'swr';
import { fetcher, createKey } from '../../lib/swr';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { Contestant, RosterPickWithContestant, RosterSlot } from '../../models';

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
}

export default function RosterActivityContent({
  roster,
  picks,
  seasonId,
  userId,
  leagueId,
}: RosterActivityContentProps) {
  const contestantMetadata = useMemo<
    Record<string, { contestant: Contestant; pickType: 'final3' | 'boot'; weekNumber?: number }>
  >(() => {
    const map: Record<string, { contestant: Contestant; pickType: 'final3' | 'boot'; weekNumber?: number }> = {};

    picks.forEach((pick) => {
      if (pick.contestant) {
        map[pick.contestant.id] = {
          contestant: pick.contestant,
          pickType: pick.pickType,
          weekNumber: pick.weekNumber,
        };
      }
    });

    roster.forEach((slot) => {
      if (slot.contestant && !map[slot.contestant.id]) {
        map[slot.contestant.id] = {
          contestant: slot.contestant,
          pickType: slot.type,
          weekNumber: slot.weekNumber,
        };
      }
    });

    return map;
  }, [picks, roster]);
  const contestantIds = useMemo(() => Object.keys(contestantMetadata), [contestantMetadata]);
  const contestantPickTypeMap = useMemo(() => {
    const map: Record<string, 'final3' | 'boot'> = {};
    Object.keys(contestantMetadata).forEach((contestantId) => {
      map[contestantId] = contestantMetadata[contestantId].pickType;
    });
    return map;
  }, [contestantMetadata]);

  // Fetch activity events using SWR
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

  // Calculate points for each event based on pick type
  const activityEvents = useMemo(() => {
    return rawEvents
      .map((event) => {
        const pickType = contestantPickTypeMap[event.contestantId];
        if (!pickType) {
          return { ...event, points: 0 };
        }

        // Calculate points for this specific event
        let points = 0;
        if (pickType === 'boot') {
          // Boot pick: +15 pts for eliminated or medical_evacuated
          if (event.activityType === 'eliminated' || event.activityType === 'medical_evacuated') {
            points = 15;
          }
        } else if (pickType === 'final3') {
          // Final 3 pick: +10 for immunity, +5 for made_jury, +5 for made_final_three
          if (event.activityType === 'immunity') {
            points = 10;
          } else if (event.activityType === 'made_jury') {
            points = 5;
          } else if (event.activityType === 'made_final_three') {
            points = 5;
          }
        }

        return { ...event, points };
      })
      .filter((event) => event.points > 0);
  }, [rawEvents, contestantPickTypeMap]);

  // Group events by week
  const eventsByWeek = useMemo<Record<number, ActivityEvent[]>>(() => {
    const grouped: Record<number, ActivityEvent[]> = {};
    activityEvents.forEach(event => {
      if (!grouped[event.weekNumber]) {
        grouped[event.weekNumber] = [];
      }
      grouped[event.weekNumber].push(event);
    });
    return grouped;
  }, [activityEvents]);

  // Format activity type for display
  const formatActivityType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'immunity': 'Immunity',
      'eliminated': 'Eliminated',
      'medical_evacuated': 'Medical Evacuation',
      'made_merge': 'Made Merge',
      'made_final_three': 'Made Final 3',
      'made_jury': 'Made Jury',
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
      ) : activityEvents.length === 0 ? (
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
              const sortedEvents = [...events].sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              });

              return (
                <div key={weekNumber}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">Week {weekNumber}</h3>
                    <div className="text-sm font-semibold" style={{ color: '#BFFF0B' }}>
                      +{totalPoints} pts
                    </div>
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
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
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

