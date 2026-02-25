import { useMemo, useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { SupabaseService } from '../../services/supabaseService';
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

interface RosterActivityCardProps {
  roster: RosterSlot[];
  seasonId: string | null;
  userId: string | null;
  leagueId: string | null;
}

export default function RosterActivityCard({ roster, seasonId, userId, leagueId }: RosterActivityCardProps) {
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // Fetch activity events
  useEffect(() => {
    if (!seasonId || contestantIds.length === 0) {
      setActivityEvents([]);
      return;
    }

    const fetchActivityEvents = async () => {
      setIsLoading(true);
      try {
        const events = await SupabaseService.getActivityEventsForContestants(seasonId, contestantIds);
        
        // Calculate points for each event based on pick type
        const eventsWithPoints = await Promise.all(
          events.map(async (event) => {
            const pickType = contestantPickTypeMap[event.contestantId];
            if (!pickType || !userId || !leagueId) {
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

            return { ...event, points };
          })
        );

        setActivityEvents(eventsWithPoints);
      } catch (error) {
        console.error('Error fetching activity events:', error);
        setActivityEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivityEvents();
  }, [seasonId, contestantIds, contestantPickTypeMap, userId, leagueId]);

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

  if (contestantIds.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="activity" className="border border-slate-800 rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: '#BFFF0B' }} />
              <h2 className="text-xl font-semibold text-white">Roster Activity</h2>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            {isLoading ? (
              <div className="text-center text-slate-400 py-4">Loading activity...</div>
            ) : activityEvents.length === 0 ? (
              <div className="text-center text-slate-400 py-4">
                No activity events yet. Points will appear here as events are added.
              </div>
            ) : (
              <div className="space-y-4">
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
                      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 border-2 flex-shrink-0"
                             style={{ borderColor: pickType === 'boot' ? '#ef4444' : '#BFFF0B' }}>
                          <Avatar
              className={`w-16 h-16 border-2 ${
                pick.status === "eliminated"
                  ? "border-red-400/30"
                  : "border-red-400/30"
              }`}
            >
              <AvatarImage
                src={pick.image || ""}
                alt={pick.name}
                className={`object-cover ${
                  pick.status === "eliminated" ? "grayscale" : ""
                }`}
              />
              <AvatarFallback>
                {pick.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-white">{contestant.name}</h3>
                          <p className="text-xs text-slate-400">
                            {pickType === 'boot' ? 'Next Boot' : 'Final 3'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {sortedEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center justify-between py-2 px-3 bg-slate-900/50 rounded border border-slate-700"
                          >
                            <div className="flex-1">
                              <div className="text-sm text-white">
                                {formatActivityType(event.activityType)}
                              </div>
                              <div className="text-xs text-slate-400">
                                Week {event.weekNumber}
                              </div>
                            </div>
                            {event.points > 0 && (
                              <div className="text-sm font-semibold" style={{ color: '#BFFF0B' }}>
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

