import React, { useState, useEffect } from 'react';
import { ChevronDown, Users, Copy, Check, Bell } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import LeagueSelector from '../common/LeagueSelector';
import ContestantReplacementModal from '../modals/ContestantReplacementModal';
import RosterActivityModal from '../modals/RosterActivityModal';
import RosterPicksDisplay from '../roster/RosterPicksDisplay';
import ConfirmationModal from '../modals/ConfirmationModal';
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
  const [isReplacementModalOpen, setIsReplacementModalOpen] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isDraftConfirmOpen, setIsDraftConfirmOpen] = useState(false);
  const [pendingContestant, setPendingContestant] = useState<Contestant | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);

  // Fetch leagues using SWR
  const leaguesKey = createKey('leagues-selector', user?.id);
  const { data: leagues = [], isLoading: isLoadingLeagues } = useSWR<League[]>(
    leaguesKey,
    fetcher
  );

  // Get the current league data from the loaded leagues array (which has complete season data)
  const currentLeagueData = leagues.find(league => league.id === selectedLeague?.id);

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
    picks = [],
    availableContestants,
    isLoading: isLoadingRoster,
    error: rosterError,
    addContestantToRoster,
    refreshRoster,
    seasonId,
  } = useRosterViewModel(selectedLeague?.id || null, user?.id || null);

  // Fetch current week for the season
  const currentWeekKey = createKey('current-week', selectedLeague?.id);
  const { data: currentWeek = 0 } = useSWR<number>(
    currentWeekKey,
    fetcher
  );

  const latestEliminationWeekKey = createKey('latest-elimination-week', seasonId);
  const { data: latestEliminationWeek = 0 } = useSWR<number>(
    latestEliminationWeekKey,
    fetcher
  );
  const nextBootWeek = Math.max(latestEliminationWeek + 1, 1);

  // Check if draft has started
  const draftStartedKey = createKey('draft-started', selectedLeague?.id);
  const { data: hasDraftStarted = false } = useSWR<boolean>(
    draftStartedKey,
    fetcher
  );

  // Fetch current draft turn
  const draftTurnKey = createKey('draft-turn', selectedLeague?.id);
  const { data: currentDraftTurn } = useSWR<{
    currentPlayerId: string | null;
    currentPlayerName: string | null;
    position: number | null;
    pickNumber: number | null;
  } | null>(
    hasDraftStarted ? draftTurnKey : null,
    fetcher,
    {
      refreshInterval: 2000, // Poll every 2 seconds when draft is in progress
      revalidateOnFocus: true,
    }
  );

  // Get league-wide draft state (count of picks per member) for snake draft logic
  const leagueDraftStateKey = createKey('league-draft-state', selectedLeague?.id);
  const { data: leagueDraftState = {} } = useSWR(
    selectedLeague?.id && hasDraftStarted ? leagueDraftStateKey : null,
    async () => {
      if (!selectedLeague?.id) return {};

      try {
        const supabase = (await import('../../services/supabaseService')).SupabaseService.getClient();

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

  // Get roster picks grouped by position to filter out already-drafted contestants
  const rosterPicksByPositionKey = createKey('roster-picks-by-position', selectedLeague?.id);
  const { data: rosterPicksByPosition = {} } = useSWR<Record<number, string[]>>(
    selectedLeague?.id && hasDraftStarted ? rosterPicksByPositionKey : null,
    fetcher
  );

  // Helper function to check if it's user's turn for a Final 3 position
  const isUserTurnForPosition = (position: 1 | 2 | 3): boolean => {
    if (!hasDraftStarted || !user?.id || !selectedLeague?.id || !currentDraftTurn) {
      return false;
    }

    try {
      // Check if it's the current user's turn and for the correct position
      return currentDraftTurn.currentPlayerId === user.id && currentDraftTurn.position === position;
    } catch (error) {
      console.error('Error checking user turn:', error);
      return false;
    }
  };

  const final3Slots = roster.filter(slot => slot.type === 'final3');
  const bootSlot = roster.find(slot => slot.type === 'boot');
  const bootSlotIndex = roster.findIndex(slot => slot.type === 'boot');
  const currentBootWeek = bootSlot?.weekNumber ?? 0;
  const isCurrentBootPickActive = Boolean(bootSlot?.contestant && bootSlot?.weekNumber === nextBootWeek);
  const canDraftBoot = currentBootWeek < nextBootWeek;

  const handleDraftClick = (index: number) => {
    if (!hasDraftStarted) {
      return; // Don't allow drafting if draft hasn't started
    }

    const slot = roster[index];
    if (!slot) {
      return;
    }

    // For Final 3 positions, check if it's user's turn
    if (slot.type === 'final3') {
      const position = (index + 1) as 1 | 2 | 3; // Final 3 slots are at indices 0, 1, 2
      if (!isUserTurnForPosition(position)) {
        return; // Don't allow if it's not their turn
      }
    }
    if (slot.type === 'boot' && !canDraftBoot) {
      return;
    }
    // Boot position can always be drafted (no turn restriction)

    setSelectedSlotIndex(index);
    setIsReplacementModalOpen(true);
  };

  const handleSelectContestant = (contestant: Contestant) => {
    // Show confirmation modal instead of directly drafting
    setPendingContestant(contestant);
    setIsDraftConfirmOpen(true);
    setIsReplacementModalOpen(false);
  };

  const handleConfirmDraft = async () => {
    if (selectedSlotIndex === null || !selectedLeague || !pendingContestant) {
      setIsDraftConfirmOpen(false);
      setPendingContestant(null);
      return;
    }

    const slot = roster[selectedSlotIndex];
    if (!slot) {
      setIsDraftConfirmOpen(false);
      setPendingContestant(null);
      return;
    }

    setIsDrafting(true);
    try {
      // Add contestant to roster via viewmodel (which writes to Supabase)
      const weekNumberForPick = slot.type === 'boot' ? nextBootWeek : undefined;
      const success = await addContestantToRoster(
        pendingContestant.id,
        slot.type,
        selectedSlotIndex,
        weekNumberForPick
      );
      
      if (success) {
        // Refresh roster to get latest data
        await refreshRoster();

        // Invalidate league draft state to update turn calculations
        if (selectedLeague?.id) {
          mutate(createKey('league-draft-state', selectedLeague.id));
        }

        // Refresh draft turn if draft has started
        if (hasDraftStarted && draftTurnKey) {
          await mutate(draftTurnKey, undefined, { revalidate: true });
        }
        
        setIsDraftConfirmOpen(false);
        setPendingContestant(null);
        setSelectedSlotIndex(null);
      } else {
        console.error('Failed to add contestant to roster');
        alert('Failed to draft contestant. Please try again.');
      }
    } catch (error) {
      console.error('Error drafting contestant:', error);
      alert('An error occurred while drafting. Please try again.');
    } finally {
      setIsDrafting(false);
    }
  };

  const isFinal3ContestantEliminated = (contestant: Contestant | null) => {
    if (!contestant) return false;
    // For Final 3 picks, check if they've been eliminated (but not if they're in final3 status, which means they made it)
    return contestant.status === 'eliminated' || contestant.status === 'jury';
  };

  const handleCopyInviteCode = async () => {
    const inviteCode = currentLeagueData?.inviteCode || selectedLeague?.inviteCode;
    if (!inviteCode) return;

    try {
      await navigator.clipboard.writeText(inviteCode);
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
              Survivor {currentLeagueData?.seasonNumber || selectedLeague.seasonNumber}: {currentLeagueData?.seasonName || selectedLeague.seasonName}
            </p>
            {currentWeek > 0 && (
              <p className="text-xs text-slate-500 mt-0.5">
                Week {currentWeek}
              </p>
            )}
          </div>
          {(currentLeagueData?.inviteCode || selectedLeague.inviteCode) && (
            <>
              <span className="hidden sm:inline text-slate-600">•</span>
              <button
                onClick={handleCopyInviteCode}
                className="flex items-center gap-2 text-sm hover:text-slate-300 transition-colors group"
                title="Click to copy invite code"
              >
                <span>Invite Code:</span>
                <span className="font-mono font-semibold text-white">{currentLeagueData?.inviteCode || selectedLeague.inviteCode}</span>
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

      {/* Draft Not Started Message */}
      {!hasDraftStarted && (
        <div className="mb-6 bg-gradient-to-br from-amber-900/30 to-amber-800/20 rounded-xl border-2 border-amber-600/50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-amber-300 font-semibold mb-1">Draft Has Not Started</h3>
              <p className="text-amber-200/80 text-sm">
                The draft has not started yet. You'll be able to draft players once the draft is opened.
              </p>
            </div>
          </div>
        </div>
      )}

      <RosterPicksDisplay
        final3Slots={final3Slots}
        bootSlot={bootSlot}
        nextBootWeek={nextBootWeek}
        latestEliminationWeek={latestEliminationWeek}
        isCurrentBootPickActive={isCurrentBootPickActive}
        canDraftBoot={canDraftBoot}
        hasDraftStarted={hasDraftStarted}
        currentDraftTurnName={currentDraftTurn?.currentPlayerName}
        isUserTurnForPosition={isUserTurnForPosition}
        onDraftFinal3={(index) => handleDraftClick(index)}
        onDraftBoot={() => {
          if (!canDraftBoot || bootSlotIndex === -1) return;
          handleDraftClick(bootSlotIndex);
        }}
        isFinal3ContestantEliminated={isFinal3ContestantEliminated}
      />

      {/* How Points Work Section */}
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl">How Points Work</h2>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 border-slate-700 p-6">
          <div className="space-y-6">
            <p>
              Points are awarded weekly for the following:
            </p>
              <ul>
                <li>Correctly Predicted Boot: +15 pts</li>
                <li>Drafted Player is Immune: +10 pts</li>
                <li>Drafted Player Makes Jury: +5 pts</li>
                <li>Drafted Player Finishes in Final 3: +5 pts</li>
                <li>Drafted Player Finishes in Predicted Order: +10 pts</li>
              </ul>
            <p>
              Points will be posted to the app 24 hours after the episode airs to try to avoid spoiling it for you.
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

      {/* Contestant Replacement Modal */}
      <ContestantReplacementModal
        isOpen={isReplacementModalOpen}
        onClose={() => {
          setIsReplacementModalOpen(false);
          setSelectedSlotIndex(null);
        }}
        contestants={availableContestants}
        currentContestant={selectedSlotIndex !== null ? roster[selectedSlotIndex]?.contestant || null : null}
        slotType={selectedSlotIndex !== null ? roster[selectedSlotIndex]?.type || 'final3' : 'final3'}
        slotIndex={selectedSlotIndex !== null ? selectedSlotIndex : 0}
        onSelectContestant={handleSelectContestant}
        roster={roster}
        leagueId={selectedLeague?.id || null}
        rosterPicksByPosition={rosterPicksByPosition}
      />

      {/* Draft Confirmation Modal */}
      {pendingContestant && selectedSlotIndex !== null && (
        <ConfirmationModal
          isOpen={isDraftConfirmOpen}
          onClose={() => {
            setIsDraftConfirmOpen(false);
            setPendingContestant(null);
            // Reopen the drawer so user can select a different contestant
            setIsReplacementModalOpen(true);
          }}
          onConfirm={handleConfirmDraft}
          title="Confirm Draft Selection"
          message={
            selectedSlotIndex < 3
              ? `Are you sure you want to draft ${pendingContestant.name} for Position ${selectedSlotIndex + 1} (${selectedSlotIndex === 0 ? 'Sole Survivor' : selectedSlotIndex === 1 ? 'Runner Up' : 'Third Place'})? This selection cannot be changed once confirmed.`
              : `Are you sure you want to draft ${pendingContestant.name} as your Week ${nextBootWeek} Next Boot pick?`
          }
          confirmText="Confirm Draft"
          cancelText="Cancel"
          isLoading={isDrafting}
          confirmButtonStyle={{
            backgroundColor: '#BFFF0B',
            color: '#000',
          }}
        />
      )}

      {/* Roster Activity Modal */}
      <RosterActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        roster={roster}
        picks={picks}
        seasonId={seasonId || null}
        userId={user?.id || null}
        leagueId={selectedLeague?.id || null}
      />
    </div>
  );
}