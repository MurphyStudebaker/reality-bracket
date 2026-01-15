import { useMemo } from 'react';
import useSWR from 'swr';
import { fetcher, createKey } from '../../lib/swr';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { RosterSlot } from '../../models';

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
  seasonId: string | null;
  userId: string | null;
  leagueId: string | null;
}

export default function RosterActivityContent({ roster, seasonId, userId, leagueId }: RosterActivityContentProps) {
  // Get all contestant IDs from roster
  const contestantIds = useMemo(() => {
    return roster
      .filter(slot => slot.contestant !== null)
      .map(slot => slot.contestant!.id);
  }, [roster]);

  // Create a map of contestant ID to pick type
  const contestantPickTypeMap = useMemo(() => {
    const map: Record<string, 'final3' | 'boot'> = {};
    roster.forEach(slot => {
      if (slot.contestant) {
        map[slot.contestant.id] = slot.type;
      }
    });
    return map;
  }, [roster]);

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
    return rawEvents.map((event) => {
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
    });
  }, [rawEvents, contestantPickTypeMap]);

  // Group events by contestant
  const eventsByContestant = useMemo(() => {
    const grouped: Record<string, ActivityEvent[]> = {};
    activityEvents.forEach(event => {
      if (!grouped[event.contestantId]) {
        grouped[event.contestantId] = [];
      }
      grouped[event.contestantId].push(event);
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
        <div className="space-y-3">
          {Object.entries(eventsByContestant).map(([contestantId, events]) => {
            const contestant = roster.find(slot => slot.contestant?.id === contestantId)?.contestant;
            const pickType = contestantPickTypeMap[contestantId];
            
            if (!contestant) return null;

            // Sort events by week (newest first)
            const sortedEvents = [...events].sort((a, b) => {
              if (b.weekNumber !== a.weekNumber) {
                return b.weekNumber - a.weekNumber;
              }
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            return (
              <div
                key={contestantId}
                className="bg-slate-800/50 rounded-lg p-3 border border-slate-700"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Avatar
                    className={`w-12 h-12 border-2 flex-shrink-0 ${
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
                    <h4 className="text-sm font-semibold text-white truncate">{contestant.name}</h4>
                    <p className="text-xs text-slate-400">
                      {pickType === 'boot' ? 'Next Boot' : 'Final 3'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {sortedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between py-1.5 px-2 rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white">
                          {formatActivityType(event.activityType)}
                        </div>
                        <div className="text-xs text-slate-400">
                          Week {event.weekNumber}
                        </div>
                      </div>
                      {event.points > 0 && (
                        <div className="text-xs font-semibold ml-2 flex-shrink-0" style={{ color: '#BFFF0B' }}>
                          +{event.points} pts
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

