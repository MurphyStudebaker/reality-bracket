import { X, UserPlus } from 'lucide-react';
import { useMemo, useEffect, useState, useRef } from 'react';
import useSWR from 'swr';
import { fetcher, createKey } from '../../lib/swr';
import { SupabaseService } from '../../services/supabaseService';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { RosterPick, RosterSlot } from '../../models';

interface UserRosterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  leagueId: string | null;
  username: string;
}

export default function UserRosterDrawer({ 
  isOpen, 
  onClose, 
  userId, 
  leagueId, 
  username 
}: UserRosterDrawerProps) {
  // Fetch roster data for the user
  const rosterKey = createKey('roster', userId, leagueId);
  const { data: picks = [], isLoading: isLoadingRoster } = useSWR<RosterPick[]>(
    isOpen && userId && leagueId ? rosterKey : null,
    fetcher
  );

  // Fetch points for each pick
  const [pickPointsMap, setPickPointsMap] = useState<Record<string, number>>({});
  const prevPicksRef = useRef<string>('');
  
  useEffect(() => {
    if (!isOpen || !userId || !leagueId || !picks || picks.length === 0) {
      if (Object.keys(pickPointsMap).length > 0) {
        setPickPointsMap({});
      }
      prevPicksRef.current = '';
      return;
    }

    // Create a stable string representation of picks to detect changes
    const picksKey = picks.map(p => `${p.id}:${p.contestant?.id || ''}`).sort().join('|');
    
    // Only fetch if picks actually changed
    if (prevPicksRef.current === picksKey) {
      return;
    }

    prevPicksRef.current = picksKey;

    const fetchPickPoints = async () => {
      const pointsMap: Record<string, number> = {};

      await Promise.all(
        picks.map(async (pick) => {
          if (pick.contestant) {
            const points = await SupabaseService.calculatePickPoints(
              userId,
              leagueId,
              pick.contestant.id,
              pick.pickType
            );
            pointsMap[pick.id] = points;
          }
        })
      );

      setPickPointsMap(pointsMap);
    };

    fetchPickPoints();
  }, [userId, leagueId, picks, isOpen]); // Added isOpen to dependencies

  // Transform picks into roster slots (same logic as RosterPage)
  const roster = useMemo<RosterSlot[]>(() => {
    const rosterSlots: RosterSlot[] = [
      { type: 'final3', contestant: null, points: 0 },
      { type: 'final3', contestant: null, points: 0 },
      { type: 'final3', contestant: null, points: 0 },
      { type: 'boot', contestant: null, points: 0 },
    ];

    if (picks && picks.length > 0) {
      const final3Picks = picks.filter(p => p.pickType === 'final3');
      const bootPicks = picks.filter(p => p.pickType === 'boot');
      
      final3Picks.forEach((pick, index) => {
        if (index < 3 && pick.contestant) {
          rosterSlots[index].contestant = pick.contestant;
          rosterSlots[index].points = pickPointsMap[pick.id] || 0;
          rosterSlots[index].pickId = pick.id;
        }
      });
      
      if (bootPicks.length > 0 && bootPicks[0].contestant) {
        rosterSlots[3].contestant = bootPicks[0].contestant;
        rosterSlots[3].points = pickPointsMap[bootPicks[0].id] || 0;
        rosterSlots[3].pickId = bootPicks[0].id;
      }
    }

    return rosterSlots;
  }, [picks, pickPointsMap]);

  const final3Slots = roster.filter(slot => slot.type === 'final3');
  const bootSlot = roster.find(slot => slot.type === 'boot');

  const isContestantEliminated = (contestant: any) => {
    if (!contestant) return false;
    return contestant.status === 'eliminated' || contestant.status === 'jury';
  };

  const isFinal3ContestantEliminated = (contestant: any) => {
    if (!contestant) return false;
    return contestant.status === 'eliminated' || contestant.status === 'jury';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Mobile: Bottom Drawer, Desktop: Center Panel */}
      <div className="fixed inset-x-0 bottom-0 lg:inset-0 lg:flex lg:items-center lg:justify-center z-50 pointer-events-none">
        <div 
          className="bg-slate-900 border-slate-800 flex flex-col max-h-[85vh] lg:max-h-[700px] w-full lg:w-[600px] rounded-t-2xl lg:rounded-2xl border-t lg:border pointer-events-auto animate-slide-in-bottom lg:animate-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-slate-800">
            <h2 className="text-xl">{username}'s Roster</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            {isLoadingRoster ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-slate-400">Loading roster...</div>
              </div>
            ) : (
              <>
                {/* Final 3 Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 rounded-full" style={{ backgroundColor: '#BFFF0B' }} />
                    <h3 className="text-lg font-semibold">Final 3 Picks</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {final3Slots.map((slot, index) => {
                      const isEliminated = isFinal3ContestantEliminated(slot.contestant);
                      
                      return (
                        <div
                          key={index}
                          className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 p-4 relative overflow-hidden transition-all ${
                            isEliminated ? 'opacity-60 grayscale' : ''
                          }`}
                          style={{ borderColor: isEliminated ? '#6B7280' : '#BFFF0B' }}
                        >
                          {slot.contestant ? (
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4 flex-1">
                                <Avatar
                                  className={`w-12 h-12 border-2 flex-shrink-0 ${
                                    isEliminated ? 'border-slate-500 grayscale' : 'border-[#BFFF0B]'
                                  }`}
                                >
                                  <AvatarImage
                                    src={slot.contestant.imageUrl}
                                    alt={slot.contestant.name}
                                    className={`object-cover ${isEliminated ? 'grayscale' : ''}`}
                                  />
                                  <AvatarFallback>
                                    {slot.contestant.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h4 className={`text-base font-semibold ${isEliminated ? 'text-slate-500' : 'text-white'}`}>
                                    {slot.contestant.name}
                                  </h4>
                                  <p className={`text-sm ${isEliminated ? 'text-slate-600' : 'text-slate-400'}`}>
                                    {slot.contestant.occupation || 'N/A'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 flex-shrink-0">
                                <div>
                                  {isEliminated && (
                                    <span className="px-2 py-1 rounded-full text-xs bg-red-600 text-white font-semibold">
                                      Eliminated
                                    </span>
                                  )}
                                </div>
                                
                                <div className="text-right">
                                  <div className={`text-xl font-bold ${isEliminated ? 'text-slate-600' : 'text-[#BFFF0B]'}`}>
                                    {slot.points ?? 0}
                                  </div>
                                  <div className="text-xs text-slate-500">points</div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-slate-800/50 border-2 border-dashed border-slate-700 flex items-center justify-center flex-shrink-0">
                                <UserPlus className="w-6 h-6 text-slate-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-base font-semibold text-slate-400">Empty Slot {index + 1}</h4>
                                <p className="text-sm text-slate-500">No contestant selected</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Next Boot Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 rounded-full bg-red-500" />
                    <h3 className="text-lg font-semibold">Next Boot Pick</h3>
                  </div>

                  <div className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 border-red-500 p-4 relative overflow-hidden ${
                    bootSlot?.contestant && isContestantEliminated(bootSlot.contestant) ? 'opacity-60 grayscale' : ''
                  }`}>
                    {bootSlot?.contestant ? (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <Avatar
                            className="w-12 h-12 border-2 border-red-500 flex-shrink-0"
                          >
                            <AvatarImage
                              src={bootSlot.contestant.imageUrl}
                              alt={bootSlot.contestant.name}
                              className={`object-cover ${bootSlot?.contestant && isContestantEliminated(bootSlot.contestant) ? 'grayscale' : ''}`}
                            />
                            <AvatarFallback>
                              {bootSlot.contestant.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-base font-semibold ${isContestantEliminated(bootSlot.contestant) ? 'text-slate-500' : 'text-white'}`}>
                              {bootSlot.contestant.name}
                            </h4>
                            <p className={`text-sm ${isContestantEliminated(bootSlot.contestant) ? 'text-slate-600' : 'text-slate-400'}`}>
                              {bootSlot.contestant.occupation || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div>
                            {isContestantEliminated(bootSlot.contestant) ? (
                              <span className="px-2 py-1 rounded-full text-xs bg-red-600 text-white font-semibold">
                                Eliminated
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs bg-red-500 text-white font-semibold">
                                BOOT
                              </span>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <div className={`text-xl font-bold ${isContestantEliminated(bootSlot.contestant) ? 'text-slate-600' : 'text-[#BFFF0B]'}`}>
                              {bootSlot.points ?? 0}
                            </div>
                            <div className="text-xs text-slate-500">points</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-800/50 border-2 border-dashed border-red-500/50 flex items-center justify-center flex-shrink-0">
                          <UserPlus className="w-6 h-6 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-slate-400">Empty Slot</h4>
                          <p className="text-sm text-slate-500">No contestant selected</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

