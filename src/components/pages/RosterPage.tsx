import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Users, UserPlus, Copy, Check, Bell } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import LeagueSelector from '../common/LeagueSelector';
import ContestantReplacementDrawer from '../drawers/ContestantReplacementDrawer';
import RosterActivityModal from '../modals/RosterActivityModal';
import { SupabaseService } from '../../services/supabaseService';
import { fetcher, createKey } from '../../lib/swr';
import { useRosterViewModel } from '../../viewmodels/roster.viewmodel';
import { useAuthViewModel } from '../../viewmodels/auth.viewmodel';
import type { Contestant, RosterSlot } from '../../models';

interface League {
  id: string;
  name: string;
  season: string;
  seasonNumber: number;
  seasonName: string;
  memberCount: number;
  inviteCode: string;
}

interface RosterPageProps {
  selectedLeague: League | null;
  onLeagueChange: (league: League | null) => void;
}

export default function RosterPage({ selectedLeague, onLeagueChange }: RosterPageProps) {
  const { user } = useAuthViewModel();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isReplacementDrawerOpen, setIsReplacementDrawerOpen] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  // Fetch leagues using SWR
  const leaguesKey = createKey('leagues-selector', user?.id);
  const { data: leagues = [], isLoading: isLoadingLeagues } = useSWR<League[]>(
    leaguesKey,
    fetcher
  );

  // Check draft status: not_started, in_progress, or completed
  const draftStatusKey = createKey('draft-status', selectedLeague?.id);
  const { data: draftStatus = 'not_started' } = useSWR<'not_started' | 'in_progress' | 'completed'>(
    selectedLeague?.id ? draftStatusKey : null,
    async () => {
      if (!selectedLeague?.id) return 'not_started';

      try {
        const supabase = SupabaseService.getClient();

        // Check if draft has been started (draft_date is set)
        const { data: league, error: leagueError } = await supabase
          .from('leagues')
          .select('draft_date')
          .eq('id', selectedLeague.id)
          .single();

        if (leagueError || !league) {
          return 'not_started';
        }

        // If draft_date is null, draft hasn't started
        if (!league.draft_date) {
          return 'not_started';
        }

        // Get all league members
        const { data: members, error: membersError } = await supabase
          .from('league_members')
          .select('user_id')
          .eq('league_id', selectedLeague.id);

        if (membersError || !members || members.length === 0) {
          return 'in_progress'; // Draft started but can't check completion
        }

        // Check if all members have 3 Final 3 picks
        const memberChecks = await Promise.all(
          members.map(async (member) => {
            const { data: picks, error: picksError } = await supabase
              .from('roster_picks')
              .select('id')
              .eq('league_id', selectedLeague.id)
              .eq('user_id', member.user_id)
              .eq('pick_type', 'final3');

            if (picksError || !picks) {
              return false;
            }

            return picks.length >= 3;
          })
        );

        // Draft is completed if all members have at least 3 Final 3 picks
        return memberChecks.every(completed => completed === true) ? 'completed' : 'in_progress';
      } catch (error) {
        console.error('Error checking draft status:', error);
        return 'not_started';
      }
    }
  );

  // Get league members in draft order for turn calculation
  const draftOrderKey = createKey('draft-order-members', selectedLeague?.id);
  const { data: draftOrderMembers = [] } = useSWR(
    selectedLeague?.id ? draftOrderKey : null,
    async () => {
      if (!selectedLeague?.id) return [];
      return await SupabaseService.getLeagueMembersForDraftOrder(selectedLeague.id);
    }
  );

  // Get league-wide draft state (count of picks per member)
  const leagueDraftStateKey = createKey('league-draft-state', selectedLeague?.id);
  const { data: leagueDraftState = {} } = useSWR(
    selectedLeague?.id && draftStatus === 'in_progress' ? leagueDraftStateKey : null,
    async () => {
      if (!selectedLeague?.id) return {};

      try {
        const supabase = SupabaseService.getClient();

        // Get all final3 picks for the league
        const { data: picks, error } = await supabase
          .from('roster_picks')
          .select('user_id, pick_type')
          .eq('league_id', selectedLeague.id)
          .eq('pick_type', 'final3');

        if (error) {
          console.error('Error fetching league draft state:', error);
          return {};
        }

        // Count picks per user
        const pickCounts: Record<string, number> = {};
        picks?.forEach(pick => {
          pickCounts[pick.user_id] = (pickCounts[pick.user_id] || 0) + 1;
        });

        return pickCounts;
      } catch (error) {
        console.error('Error in league draft state:', error);
        return {};
      }
    }
  );

  // Set selected league when leagues are loaded (if no league is currently selected)
  // Also validate that the selected league is still in the leagues array
  useEffect(() => {
    if (leagues.length > 0) {
      if (!selectedLeague) {
        // No league selected, select the first one
        onLeagueChange(leagues[0]);
      } else {
        // Check if the selected league is still in the leagues array
        const isSelectedLeagueValid = leagues.some(league => league.id === selectedLeague.id);
        if (!isSelectedLeagueValid) {
          // Selected league is no longer valid, select the first one
          onLeagueChange(leagues[0]);
        }
      }
    }
  }, [leagues, selectedLeague, onLeagueChange]);

  // Use roster viewmodel
  const {
    roster,
    availableContestants,
    isLoading: isLoadingRoster,
    error: rosterError,
    addContestantToRoster,
    refreshRoster,
    seasonId,
  } = useRosterViewModel(selectedLeague?.id || null, user?.id || null);

  // Calculate current draft turn information for snake draft
  const currentDraftTurn = useMemo(() => {
    if (draftStatus !== 'in_progress' || draftOrderMembers.length === 0 || !user?.id) {
      return null;
    }

    try {
      const numPlayers = draftOrderMembers.length;
      const totalPositions = numPlayers * 3; // 3 positions per player

      // Count total final3 picks made by all players
      const totalPicksMade = Object.values(leagueDraftState).reduce((sum, count) => sum + count, 0);

      if (totalPicksMade >= totalPositions) {
        return {
          canDraftFinal3: false,
          canDraftBoot: true,
          currentSlotIndex: null,
          nextPlayer: null,
          message: "Draft completed"
        };
      }

      // Calculate current round and position
      const currentRound = Math.floor(totalPicksMade / numPlayers) + 1; // 1-based
      const positionInRound = totalPicksMade % numPlayers;

      // In snake draft: odd rounds go forward (0,1,2,...), even rounds go backward (N-1,N-2,...,0)
      const isReverseRound = currentRound % 2 === 0;
      const memberIndex = isReverseRound
        ? numPlayers - 1 - positionInRound
        : positionInRound;

      const currentMember = draftOrderMembers[memberIndex];
      if (!currentMember) return null;

      const positionNames = ['Sole Survivor', 'Runner Up', 'Third Place'];
      const currentPositionName = positionNames[currentRound - 1] || `Position ${currentRound}`;

      // Check if it's the current user's turn
      const isCurrentUserTurn = currentMember.userId === user.id;

      // For the current user, determine which slot they should pick
      let userNextSlot: number | null = null;
      if (isCurrentUserTurn) {
        const userPickCount = leagueDraftState[user.id] || 0;
        userNextSlot = userPickCount; // Next slot index (0, 1, or 2)
      }

      return {
        canDraftFinal3: isCurrentUserTurn,
        canDraftBoot: true,
        currentSlotIndex: isCurrentUserTurn ? userNextSlot : null,
        nextPlayer: currentMember,
        message: isCurrentUserTurn
          ? `Pick your ${currentPositionName}`
          : `${currentMember.displayName || currentMember.username} is picking the ${currentPositionName}`
      };

    } catch (error) {
      console.error('Error calculating draft turn:', error);
      return null;
    }
  }, [draftStatus, draftOrderMembers, leagueDraftState, user?.id]);

  // Fetch current week for the season
  const currentWeekKey = createKey('current-week', selectedLeague?.id);
  const { data: currentWeek = 0 } = useSWR<number>(
    currentWeekKey,
    fetcher
  );

  const final3Slots = roster.filter(slot => slot.type === 'final3');
  const bootSlot = roster.find(slot => slot.type === 'boot');

  const handleDraftClick = (index: number) => {
    setSelectedSlotIndex(index);
    setIsReplacementDrawerOpen(true);
  };

  const handleSelectContestant = async (contestant: Contestant) => {
    if (selectedSlotIndex === null || !selectedLeague) {
      return;
    }

    const slot = roster[selectedSlotIndex];
    if (!slot) {
      return;
    }

    // Add contestant to roster via viewmodel (which writes to Supabase)
    const success = await addContestantToRoster(contestant.id, slot.type, selectedSlotIndex);
    
    if (success) {
      // Refresh roster to get latest data
      await refreshRoster();
      // Invalidate league draft state to update turn calculations
      if (selectedLeague?.id) {
        mutate(createKey('league-draft-state', selectedLeague.id));
      }
      setIsReplacementDrawerOpen(false);
      setSelectedSlotIndex(null);
    } else {
      console.error('Failed to add contestant to roster');
    }
  };

  const isContestantEliminated = (contestant: Contestant | null) => {
    if (!contestant) return false;
    return contestant.status === 'eliminated' || contestant.status === 'jury';
  };

  const isFinal3ContestantEliminated = (contestant: Contestant | null) => {
    if (!contestant) return false;
    // For Final 3 picks, check if they've been eliminated (but not if they're in final3 status, which means they made it)
    return contestant.status === 'eliminated' || contestant.status === 'jury';
  };

  const handleCopyInviteCode = async () => {
    if (!selectedLeague?.inviteCode) return;

    try {
      await navigator.clipboard.writeText(selectedLeague.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy invite code:', error);
    }
  };

  if (isLoadingLeagues || isLoadingRoster) {
    return (
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        <div className="text-center text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!selectedLeague || leagues.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        <div className="text-center text-slate-400">
          <p className="mb-2">No active or upcoming leagues found.</p>
          <p className="text-sm">Join or create a league to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8">
      {/* League Header */}
      <div className="mb-6">
        {/* League Name - Main Heading */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold text-white">{selectedLeague.name}</h1>
              <button
                onClick={() => setIsSelectorOpen(true)}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                title="Change league"
              >
                <ChevronDown className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <button
              onClick={() => setIsActivityModalOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors relative"
              title="View roster activity"
            >
              <Bell className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Season Info and Invite Code - Subheadings */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-slate-400">
          <div className="flex flex-col">
            <p className="text-sm">
              Survivor {selectedLeague.seasonNumber}: {selectedLeague.seasonName}
            </p>
            {currentWeek > 0 && (
              <p className="text-xs text-slate-500 mt-0.5">
                Week {currentWeek}
              </p>
            )}
          </div>
          {selectedLeague.inviteCode && (
            <>
              <span className="hidden sm:inline text-slate-600">•</span>
              <button
                onClick={handleCopyInviteCode}
                className="flex items-center gap-2 text-sm hover:text-slate-300 transition-colors group"
                title="Click to copy invite code"
              >
                <span>Invite Code:</span>
                <span className="font-mono font-semibold text-white">{selectedLeague.inviteCode}</span>
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-300 transition-colors" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Final 3 Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 rounded-full" style={{ backgroundColor: '#BFFF0B' }} />
          <h2 className="text-2xl">Final 3 Picks</h2>
          {draftStatus === 'in_progress' && currentDraftTurn && (
            <div className="ml-4 text-sm text-slate-400">
              {currentDraftTurn.message}
            </div>
          )}
        </div>
        
        <div className="space-y-4">
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
                    {/* Left Side: Image, Name, Occupation */}
                    <div className="flex items-center gap-4 flex-1">
                      <div 
                        className={`w-16 h-16 rounded-full overflow-hidden bg-slate-700 border-2 flex-shrink-0 ${
                          isEliminated ? 'grayscale' : ''
                        }`}
                        style={{ borderColor: isEliminated ? '#6B7280' : '#BFFF0B' }}
                      >
                        <img
                          src={slot.contestant.imageUrl}
                          alt={slot.contestant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-semibold ${isEliminated ? 'text-slate-500' : 'text-white'}`}>
                          {slot.contestant.name}
                        </h3>
                        <p className={`text-sm ${isEliminated ? 'text-slate-600' : 'text-slate-400'}`}>
                          {slot.contestant.occupation || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Right Side: Status and Points */}
                    <div className="flex items-center gap-6 flex-shrink-0">
                      {/* Status Badge */}
                      <div>
                        {isEliminated ? (
                          <span className="px-3 py-1 rounded-full text-xs bg-red-600 text-white font-semibold">
                            Eliminated
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs bg-green-600 text-white font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                      
                      {/* Points */}
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${isEliminated ? 'text-slate-600' : 'text-[#BFFF0B]'}`}>
                          {slot.points ?? 0}
                        </div>
                        <div className="text-xs text-slate-500">points</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 rounded-full bg-slate-800/50 border-2 border-dashed border-slate-700 flex items-center justify-center flex-shrink-0"
                           style={{ borderColor: '#BFFF0B' }}>
                        <UserPlus className="w-8 h-8 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-400">
                          {index === 0 ? 'Sole Survivor' : index === 1 ? 'Runner Up' : 'Third Place'}
                        </h3>
                        <p className="text-sm text-slate-500">No contestant selected</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      {draftStatus === 'in_progress' && (
                        <div className="text-sm">
                          {currentDraftTurn?.currentSlotIndex === index ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#BFFF0B', color: '#000' }}>
                              YOUR TURN
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs bg-slate-700 text-slate-400">
                              Waiting...
                            </span>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => handleDraftClick(index)}
                        disabled={draftStatus === 'in_progress' && currentDraftTurn?.currentSlotIndex !== index}
                        className={`px-6 py-2.5 rounded-lg border-2 transition-all flex-shrink-0 ${
                          draftStatus === 'in_progress' && currentDraftTurn?.currentSlotIndex !== index
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-slate-800'
                        }`}
                        style={{
                          borderColor: draftStatus === 'in_progress' && currentDraftTurn?.currentSlotIndex !== index ? '#64748b' : '#BFFF0B',
                          color: draftStatus === 'in_progress' && currentDraftTurn?.currentSlotIndex !== index ? '#64748b' : '#BFFF0B'
                        }}
                      >
                        {draftStatus === 'in_progress' && currentDraftTurn?.currentSlotIndex !== index ? 'Not Your Turn' : 'Draft Player'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Boot Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 rounded-full bg-red-500" />
          <h2 className="text-2xl">Next Boot Pick</h2>
        </div>

        <div className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 border-red-500 p-4 relative overflow-hidden ${
          bootSlot?.contestant && isContestantEliminated(bootSlot.contestant) ? 'opacity-60 grayscale' : ''
        }`}>
          {bootSlot?.contestant ? (
            <div className="flex items-center justify-between gap-4">
              {/* Left Side: Image, Name, Occupation */}
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-700 border-2 border-red-500 flex-shrink-0">
                  <img
                    src={bootSlot.contestant.imageUrl}
                    alt={bootSlot.contestant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg font-semibold ${isContestantEliminated(bootSlot.contestant) ? 'text-slate-500' : 'text-white'}`}>
                    {bootSlot.contestant.name}
                  </h3>
                  <p className={`text-sm ${isContestantEliminated(bootSlot.contestant) ? 'text-slate-600' : 'text-slate-400'}`}>
                    {bootSlot.contestant.occupation || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Right Side: Status and Points */}
              <div className="flex items-center gap-6 flex-shrink-0">
                {/* Status Badge */}
                <div>
                  {isContestantEliminated(bootSlot.contestant) ? (
                    <span className="px-3 py-1 rounded-full text-xs bg-red-600 text-white font-semibold">
                      Eliminated
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs bg-red-500 text-white font-semibold">
                      BOOT
                    </span>
                  )}
                </div>
                
                {/* Points */}
                <div className="text-right">
                  <div className={`text-2xl font-bold ${isContestantEliminated(bootSlot.contestant) ? 'text-slate-600' : 'text-[#BFFF0B]'}`}>
                    {bootSlot.points ?? 0}
                  </div>
                  <div className="text-xs text-slate-500">points</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 border-2 border-dashed border-red-500/50 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-8 h-8 text-slate-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-400">Empty Slot</h3>
                  <p className="text-sm text-slate-500">No contestant selected</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const bootIndex = roster.findIndex(slot => slot.type === 'boot');
                  if (bootIndex !== -1) {
                    handleDraftClick(bootIndex);
                  }
                }}
                className="px-6 py-2.5 rounded-lg border-2 transition-all hover:bg-slate-800 flex-shrink-0"
                style={{ borderColor: '#BFFF0B', color: '#BFFF0B' }}
              >
                Draft Player
              </button>
            </div>
          )}
        </div>
      </div>

      {/* How Points Work Section */}
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl">How Points Work</h2>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 border-slate-700 p-6">
          <div className="space-y-6">
            <p>
              Points are awarded weekly for the following:
              <ul>
                <li>Correctly Predicted Boot: +15 pts</li>
                <li>Drafted Player is Immune: +10 pts</li>
                <li>Drafted Player Makes Jury: +5 pts</li>
                <li>Drafted Player Finishes in Final 3: +5 pts</li>
                <li>Drafted Player Finishes in Predicted Order: +10 pts</li>
              </ul>
            </p>
          </div>
        </div>
      </div>

      {/* League Selector Drawer */}
      {selectedLeague && (
        <LeagueSelector
          isOpen={isSelectorOpen}
          onClose={() => setIsSelectorOpen(false)}
          leagues={leagues}
          selectedLeague={selectedLeague}
          onSelectLeague={(league) => {
            onLeagueChange(league);
            setIsSelectorOpen(false);
          }}
        />
      )}

      {/* Contestant Replacement Drawer */}
      <ContestantReplacementDrawer
        isOpen={isReplacementDrawerOpen}
        onClose={() => {
          setIsReplacementDrawerOpen(false);
          setSelectedSlotIndex(null);
        }}
        contestants={availableContestants}
        currentContestant={selectedSlotIndex !== null ? roster[selectedSlotIndex]?.contestant || null : null}
        slotType={selectedSlotIndex !== null ? roster[selectedSlotIndex]?.type || 'final3' : 'final3'}
        slotIndex={selectedSlotIndex !== null ? selectedSlotIndex : 0}
        onSelectContestant={handleSelectContestant}
        roster={roster}
      />

      {/* Roster Activity Modal */}
      <RosterActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        roster={roster}
        seasonId={seasonId || null}
        userId={user?.id || null}
        leagueId={selectedLeague?.id || null}
      />
    </div>
  );
}