import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronDown, Users, TrendingUp, TrendingDown, Minus, Crown, Award, Medal, Copy, Check, Play, Lock, Bell, ArrowUpDown } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import LeagueSelector from '../common/LeagueSelector';
import LeagueActivityContent from '../league/LeagueActivityContent';
import ModifyDraftOrderModal from '../modals/ModifyDraftOrderModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import ContestantReplacementModal from '../modals/ContestantReplacementModal';
import UserRosterModal from '../modals/UserRosterModal';
import { Progress } from '../ui/progress';
import { SupabaseService } from '../../services/supabaseService';
import { fetcher, createKey } from '../../lib/swr';
import { useRosterViewModel } from '../../viewmodels/roster.viewmodel';
import type { Contestant, LeagueStanding } from '../../models';

interface League {
  id: string;
  name: string;
  season: string;
  seasonNumber: number;
  seasonName: string;
  memberCount: number;
  inviteCode: string;
  createdById?: string;
}

interface DraftOrderMember {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  draftOrder: number | null;
  joinedAt: string;
}

interface LeagueActivityEvent {
  id: string;
  contestantId: string;
  weekNumber: number;
  activityType: string;
  createdAt: string;
  contestantName: string;
}

interface MedicalEvacReplacementNeed {
  slotIndex: number;
  evacuationWeek: number;
  contestantName: string;
}

interface LeaguePageProps {
  selectedLeague: League | null;
  onLeagueChange: (league: League | null) => void;
  onNavigateToRoster?: () => void;
}

export default function LeaguePage({ selectedLeague, onLeagueChange, onNavigateToRoster }: LeaguePageProps) {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDraftOrderModalOpen, setIsDraftOrderModalOpen] = useState(false);
  const leagueActivityRef = useRef<HTMLDivElement | null>(null);
  const [isStartDraftConfirmOpen, setIsStartDraftConfirmOpen] = useState(false);
  const [isStartingDraft, setIsStartingDraft] = useState(false);
  const [selectedUserForRoster, setSelectedUserForRoster] = useState<{ userId: string; username: string } | null>(null);
  const [isReplacementModalOpen, setIsReplacementModalOpen] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [selectedSlotType, setSelectedSlotType] = useState<'final3' | 'boot'>('final3');
  const [pendingContestant, setPendingContestant] = useState<Contestant | null>(null);
  const [isDraftConfirmOpen, setIsDraftConfirmOpen] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [medicalEvacReplacement, setMedicalEvacReplacement] = useState<MedicalEvacReplacementNeed | null>(null);

  // Fetch current user
  const userKey = createKey('current-user');
  const { data: currentUser } = useSWR<{ id: string } | null>(userKey, fetcher);

  // Check if draft has started
  const draftStartedKey = createKey('draft-started', selectedLeague?.id);
  const { data: hasDraftStarted = false } = useSWR<boolean>(
    draftStartedKey,
    fetcher
  );

  // Fetch current draft turn
  const draftTurnKey = createKey('draft-turn', selectedLeague?.id);
  const { data: currentDraftTurn, mutate: mutateDraftTurn } = useSWR<{
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

  // Handle start draft confirmation
  const handleStartDraftClick = () => {
    setIsStartDraftConfirmOpen(true);
  };

  // Handle start draft (after confirmation)
  const handleStartDraft = async () => {
    if (!selectedLeague?.id) return;
    
    setIsStartingDraft(true);
    try {
      const success = await SupabaseService.startDraft(selectedLeague.id);
      
      if (success) {
        setIsStartDraftConfirmOpen(false);
        // Refresh draft status and turn
        if (draftStartedKey) {
          await mutate(draftStartedKey);
        }
        // Also refresh draft status cache
        if (draftStatusKey) {
          await mutate(draftStatusKey);
        }
        // Also invalidate leagues cache to refresh status
        const leaguesKey = createKey('leagues-selector', currentUser?.id);
        if (leaguesKey) {
          await mutate(leaguesKey);
        }
        // Invalidate draft order cache in case it was initialized
        const draftOrderKey = createKey('draft-order-members', selectedLeague.id);
        if (draftOrderKey) {
          await mutate(draftOrderKey);
        }
        await mutateDraftTurn();
      } else {
        console.error('Start draft returned false');
        alert('Failed to start draft. Please check the console for details and ensure you have permission to update the league.');
      }
    } catch (error: any) {
      console.error('Error starting draft:', error);
      alert(`An error occurred while starting the draft: ${error?.message || 'Unknown error'}. Please check the console for details.`);
    } finally {
      setIsStartingDraft(false);
    }
  };

  // Handle user click - navigate to roster if it's the current user, otherwise show drawer
  const handleUserClick = (userId: string, username: string) => {
    if (currentUser && userId === currentUser.id && onNavigateToRoster) {
      onNavigateToRoster();
    } else {
      setSelectedUserForRoster({ userId, username });
    }
  };

  const isCurrentUserTurn = Boolean(
    currentDraftTurn?.currentPlayerId &&
    currentUser?.id &&
    currentDraftTurn.currentPlayerId === currentUser.id
  );

  const handleOpenDraftModal = () => {
    if (!currentDraftTurn?.position || !isCurrentUserTurn) {
      return;
    }
    const slotIndex = currentDraftTurn.position - 1;
    if (slotIndex < 0 || slotIndex > 2) {
      return;
    }
    setSelectedSlotIndex(slotIndex);
    setSelectedSlotType('final3');
    setMedicalEvacReplacement(null);
    setIsReplacementModalOpen(true);
  };

  const handleOpenBootDraftModal = (bootSlotIndex: number, canDraftBoot: boolean) => {
    if (!canDraftBoot || bootSlotIndex < 0) {
      return;
    }
    setSelectedSlotIndex(bootSlotIndex);
    setSelectedSlotType('boot');
    setMedicalEvacReplacement(null);
    setIsReplacementModalOpen(true);
  };

  const handleOpenMedicalEvacReplacementModal = (replacementNeed: MedicalEvacReplacementNeed) => {
    setSelectedSlotIndex(replacementNeed.slotIndex);
    setSelectedSlotType('final3');
    setMedicalEvacReplacement(replacementNeed);
    setIsReplacementModalOpen(true);
  };

  const handleSelectContestant = (contestant: Contestant) => {
    setPendingContestant(contestant);
    setIsDraftConfirmOpen(true);
    setIsReplacementModalOpen(false);
  };

  const handleConfirmDraftPick = async () => {
    if (selectedSlotIndex === null || !selectedLeague?.id || !pendingContestant) {
      setIsDraftConfirmOpen(false);
      setPendingContestant(null);
      return;
    }

    setIsDrafting(true);
    try {
      const pickType = selectedSlotType;
      const weekNumberForPick = pickType === 'boot' ? nextBootWeek : undefined;
      const evacuationWeekForReplacement =
        pickType === 'final3' &&
        medicalEvacReplacement &&
        medicalEvacReplacement.slotIndex === selectedSlotIndex
          ? medicalEvacReplacement.evacuationWeek
          : undefined;

      const success = await addContestantToRoster(
        pendingContestant.id,
        pickType,
        selectedSlotIndex,
        weekNumberForPick,
        evacuationWeekForReplacement
      );

      if (success) {
        await refreshRoster();
        if (selectedLeague?.id) {
          mutate(createKey('league-draft-state', selectedLeague.id));
        }
        if (draftTurnKey) {
          await mutateDraftTurn();
        }
        setIsDraftConfirmOpen(false);
        setPendingContestant(null);
        setSelectedSlotIndex(null);
        setSelectedSlotType('final3');
        setMedicalEvacReplacement(null);
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

  // Fetch leagues using SWR
  const leaguesKey = createKey('leagues-selector', currentUser?.id);
  const { data: leagues = [], isLoading } = useSWR<League[]>(
    leaguesKey,
    fetcher
  );

  // Get the current league data from the loaded leagues array (which has complete season data)
  const currentLeagueData = leagues.find(league => league.id === selectedLeague?.id);

  // Check if current user is the league commissioner
  const isCommissioner = currentUser && (currentLeagueData?.createdById || selectedLeague?.createdById) && currentUser.id === (currentLeagueData?.createdById || selectedLeague?.createdById);

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

  // Use roster viewmodel for draft pick modal
  const {
    roster,
    availableContestants,
    addContestantToRoster,
    refreshRoster,
  } = useRosterViewModel(selectedLeague?.id || null, currentUser?.id || null);

  // Fetch standings using SWR
  const standingsKey = createKey('standings', selectedLeague?.id);
  const { data: standings = [], isLoading: isLoadingStandings } = useSWR<LeagueStanding[]>(
    standingsKey,
    fetcher
  );

  // Fetch current week for the season
  const currentWeekKey = createKey('current-week', selectedLeague?.id);
  const { data: currentWeek = 0 } = useSWR<number>(
    currentWeekKey,
    fetcher
  );

  // Fetch season ID for the league
  const seasonIdKey = createKey('league-season', selectedLeague?.id);
  const { data: seasonId } = useSWR<string | null>(
    seasonIdKey,
    fetcher
  );

  const latestEliminationWeekKey = createKey('latest-elimination-week', seasonId);
  const { data: latestEliminationWeek = 0 } = useSWR<number>(
    latestEliminationWeekKey,
    fetcher
  );
  const nextBootWeek = Math.max(latestEliminationWeek + 1, 1);

  const leagueActivityEventsKey = createKey('league-activity-events', seasonId);
  const { data: leagueActivityEvents = [] } = useSWR<LeagueActivityEvent[]>(
    leagueActivityEventsKey,
    fetcher
  );
  const hasSeasonActivityEvents = leagueActivityEvents.length > 0;

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
  const { data: draftOrderMembers = [] } = useSWR<DraftOrderMember[]>(
    selectedLeague?.id ? draftOrderKey : null,
    async () => {
      if (!selectedLeague?.id) return [];
      return await SupabaseService.getLeagueMembersForDraftOrder(selectedLeague.id);
    }
  );

  // Get league-wide draft state (count of picks per member)
  const leagueDraftStateKey = createKey('league-draft-state', selectedLeague?.id);
  const { data: leagueDraftState = [] } = useSWR(
    selectedLeague?.id && draftStatus === 'in_progress' ? leagueDraftStateKey : null,
    async () => {
      if (!selectedLeague?.id) return [];

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
          return [];
        }

        // Count picks per user
        const pickCounts: Record<string, number> = {};
        picks?.forEach(pick => {
          pickCounts[pick.user_id] = (pickCounts[pick.user_id] || 0) + 1;
        });

        return pickCounts;
      } catch (error) {
        console.error('Error in league draft state:', error);
        return [];
      }
    }
  );

  // Get roster picks grouped by position to filter out already-drafted contestants
  const rosterPicksByPositionKey = createKey('roster-picks-by-position', selectedLeague?.id);
  const { data: rosterPicksByPosition = {} } = useSWR<Record<number, string[]>>(
    selectedLeague?.id && hasDraftStarted ? rosterPicksByPositionKey : null,
    fetcher
  );

  const bootSlotIndex = roster.findIndex(slot => slot.type === 'boot');
  const bootSlot = bootSlotIndex >= 0 ? roster[bootSlotIndex] : undefined;
  const currentBootWeek = bootSlot?.weekNumber ?? 0;
  const canDraftBoot = bootSlotIndex >= 0 && currentBootWeek < nextBootWeek;
  const shouldShowBootDraftPrompt = draftStatus === 'completed' && canDraftBoot;

  const medicalEvacReplacementsNeeded = useMemo<MedicalEvacReplacementNeed[]>(() => {
    if (!roster.length || !leagueActivityEvents.length) {
      return [];
    }

    const replacements: MedicalEvacReplacementNeed[] = [];

    roster
      .slice(0, 3)
      .forEach((slot, slotIndex) => {
        const contestant = slot.contestant;
        if (!contestant) return;

        const evacEvents = leagueActivityEvents
          .filter(event => event.contestantId === contestant.id && event.activityType === 'medical_evacuated')
          .sort((a, b) => b.weekNumber - a.weekNumber);

        if (evacEvents.length > 0) {
          replacements.push({
            slotIndex,
            evacuationWeek: evacEvents[0].weekNumber,
            contestantName: contestant.name,
          });
        }
      });

    return replacements.sort((a, b) => a.slotIndex - b.slotIndex);
  }, [roster, leagueActivityEvents]);

  const currentMedicalEvacReplacement = medicalEvacReplacementsNeeded[0] || null;

  const topThree = standings.slice(0, 3);
  const restOfStandings = standings.slice(3);
  const hasPointTotals = standings.some((standing) => (standing.points ?? 0) > 0);
  const shouldShowPodium = currentWeek > 0 && hasPointTotals;
  const shouldShowDraftHowItWorks = !(draftStatus === 'completed' && currentWeek > 0);

  const draftHowItWorksSection = (
    <div className={shouldShowPodium ? 'mt-12' : 'mb-8'}>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-2xl">How Drafts Work</h2>
      </div>
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 border-slate-700 p-6">
        <div className="space-y-6">
          <p>
            Once you begin the draft, players will be able to select contestants for all Final 3 positions in a snake draft order. You must wait for each player to make their selection until it is your turn. The same contestant cannot be drafted in the same slot by multiple people in the league. After the draft is complete, these selections are locked for the season. 
            <br />
            <br />
            Weekly while the season is active, you can draft a contestant for the next boot slot. For this position, multiple people in the league can have the same selection.
          </p>
        </div>
      </div>

      <div className="h-4"></div>

      {/* Draft Controls - Only visible to commissioner */}
      {isCommissioner ? (
        <div className="mt-6 flex flex-col gap-3">
          {/* Begin Draft Button */}
          <button
            onClick={handleStartDraftClick}
            disabled={draftStatus === 'completed' || hasDraftStarted}
            className={`w-full px-6 py-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${
              draftStatus === 'completed' || hasDraftStarted
                ? 'cursor-not-allowed opacity-60'
                : 'hover:scale-[1.02] active:scale-[0.98] hover:opacity-90 active:opacity-80'
            }`}
            style={
              draftStatus === 'completed' || hasDraftStarted
                ? { backgroundColor: '#475569', color: '#94a3b8', borderColor: '#475569' }
                : { 
                  borderColor: '#BFFF0B',
                  backgroundColor: 'rgba(191, 255, 11, 0.1)',
                  color: '#BFFF0B'
                }
            }
          >
            {draftStatus === 'completed' ? (
              <>
                <Lock className="w-5 h-5" />
                <span>Draft Completed</span>
              </>
            ) : hasDraftStarted ? (
              <>
                <Play className="w-5 h-5" />
                <span>Draft In Progress</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Begin Draft</span>
              </>
            )}
          </button>

          {/* Modify Draft Order Button */}
          <button
            onClick={() => {
              if (draftStatus !== 'completed' && !hasDraftStarted) {
                setIsDraftOrderModalOpen(true);
              }
            }}
            disabled={draftStatus === 'completed' || hasDraftStarted}
            className={`w-full px-6 py-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${
              draftStatus === 'completed' || hasDraftStarted
                ? 'cursor-not-allowed opacity-60'
                : 'hover:scale-[1.02] active:scale-[0.98] hover:opacity-90 active:opacity-80'
            }`}
            style={
              draftStatus === 'completed' || hasDraftStarted
                ? { backgroundColor: '#475569', color: '#94a3b8', borderColor: '#475569' }
                : {
                  borderColor: '#64748b',
                  backgroundColor: 'rgba(100, 116, 139, 0.1)',
                  color: '#94a3b8'
                }
            }
          >
            <ArrowUpDown className="w-5 h-5" />
            <span>
              {draftStatus === 'completed'
                ? 'Draft Order Locked'
                : hasDraftStarted
                ? 'Draft Order Locked'
                : 'Modify Draft Order'
              }
            </span>
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 border-slate-700 p-6">
            <p className="text-slate-400 text-center">
              Only the league commissioner can modify the draft order and begin the draft.
            </p>
          </div>
        </div>
      )}
    </div>
  );

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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        <div className="text-center text-slate-400">Loading leagues...</div>
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
              <button
                onClick={() => setIsSelectorOpen(true)}
                className="flex items-center gap-3 rounded-lg hover:bg-slate-800 transition-colors px-2 py-1 -ml-2 text-left"
                title="Change league"
              >
                <h1 className="text-3xl font-semibold text-white text-left">{selectedLeague.name}</h1>
                <ChevronDown className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            {/* <button
              onClick={() => {
                leagueActivityRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors relative"
              title="View league activity"
            >
              <Bell className="w-5 h-5 text-slate-400" />
            </button> */}
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
          {(currentLeagueData?.inviteCode || selectedLeague?.inviteCode) && (
            <>
              <span className="hidden sm:inline text-slate-600">•</span>
              <button
                onClick={handleCopyInviteCode}
                className="flex items-center gap-2 text-sm hover:text-slate-300 transition-colors group"
                title="Click to copy invite code"
              >
                <span>Invite Code:</span>
                <span className="font-mono font-semibold text-white">{currentLeagueData?.inviteCode || selectedLeague?.inviteCode}</span>
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

      {/* Draft Status - Show current draft round and whose turn it is */}
      {currentMedicalEvacReplacement ? (
        <div className="mb-6 bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl border-2 border-slate-700 bg-slate-900/50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-amber-300 font-semibold mb-1">Final 3 Replacement Needed</h3>
              <p className="text-amber-200/80 text-sm mb-3">
                Your pick {currentMedicalEvacReplacement.contestantName} was medically evacuated in Week {currentMedicalEvacReplacement.evacuationWeek}. Draft a replacement for Position {currentMedicalEvacReplacement.slotIndex + 1}.
              </p>
              <div className="h-4"></div>
              <button
                onClick={() => handleOpenMedicalEvacReplacementModal(currentMedicalEvacReplacement)}
                className="mt-4 w-full px-4 py-3 rounded-lg border-2 transition-all font-semibold hover:scale-[1.02] active:scale-[0.98] hover:opacity-90 active:opacity-80"
                style={{
                  borderColor: '#BFFF0B',
                  backgroundColor: 'rgba(191, 255, 11, 0.1)',
                  color: '#BFFF0B',
                }}
              >
                Draft Replacement
              </button>
            </div>
          </div>
        </div>
      ) : shouldShowBootDraftPrompt ? (
        <div className="mb-6 bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl border-2 border-slate-700 bg-slate-900/50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-blue-300 font-semibold mb-1">Next Eliminated Pick</h3>
              <p className="text-blue-200/80 text-sm mb-3">
                Week {nextBootWeek} is open. Make your next eliminated pick before the episode airs.
              </p>
              <div className="h-4"></div>
              <button
                onClick={() => handleOpenBootDraftModal(bootSlotIndex, canDraftBoot)}
                className="mt-4 w-full px-4 py-3 rounded-lg border-2 transition-all font-semibold hover:scale-[1.02] active:scale-[0.98] hover:opacity-90 active:opacity-80"
                style={{
                  borderColor: '#BFFF0B',
                  backgroundColor: 'rgba(191, 255, 11, 0.1)',
                  color: '#BFFF0B',
                }}
              >
                Make Your Pick
              </button>
            </div>
          </div>
        </div>
      ) : !hasDraftStarted ? (
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
                The league commissioner needs to start the draft before players can begin selecting contestants for Final 3 positions.
              </p>
            </div>
          </div>
        </div>
      ) : currentDraftTurn ? (
        <div className="mb-6 bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl border-2 border-slate-700 bg-slate-900/50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-blue-300 font-semibold mb-1">
                Draft Round: {(() => {
                  switch (currentDraftTurn.position) {
                    case 1: return 'Sole Survivor';
                    case 2: return 'Runner Up';
                    case 3: return 'Third Place';
                    default: return `Position ${currentDraftTurn.position}`;
                  }
                })()}
              </h3>
              <p className="text-blue-200/80 text-sm mb-3">
                {currentDraftTurn.currentPlayerId === currentUser?.id ? (
                  <span>It's <span style={{ fontWeight: 'bold' }}>your</span> turn to draft for this position.</span>
                ) : (
                  <span>It's <span style={{ fontWeight: 'bold' }}>{currentDraftTurn.currentPlayerName || 'Unknown Player'}</span>'s turn to draft for this position.</span>
                )}
              </p>

              {/* Draft Progress Bar */}
              {/* {(() => {
                const totalPlayers = draftOrderMembers.length;
                const totalPicksNeeded = totalPlayers * 3;
                const currentPicks = Object.values(leagueDraftState).reduce((sum, count) => sum + count, 0);
                const progressPercentage = totalPicksNeeded > 0 
                  ? Math.round((currentPicks / totalPicksNeeded) * 100) 
                  : 0;

                return (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-blue-200/60">
                      <span>Draft Progress</span>
                      <span>{currentPicks} / {totalPicksNeeded} picks</span>
                    </div>
                    <Progress 
                      value={progressPercentage} 
                      className="h-2 bg-blue-900/30 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-400"
                    />
                    <div className="text-center text-xs text-blue-200/60">
                      {progressPercentage}% complete
                    </div>
                  </div>
                );
              })()} */}
              <div className="h-4"></div>
              <button
                onClick={handleOpenDraftModal}
                disabled={!isCurrentUserTurn}
                className={`mt-4 w-full px-4 py-3 rounded-lg border-2 transition-all font-semibold ${
                  isCurrentUserTurn
                    ? 'hover:scale-[1.02] active:scale-[0.98] hover:opacity-90 active:opacity-80'
                    : 'cursor-not-allowed opacity-60'
                }`}
                style={
                  isCurrentUserTurn
                    ? {
                      borderColor: '#BFFF0B',
                      backgroundColor: 'rgba(191, 255, 11, 0.1)',
                      color: '#BFFF0B',
                    }
                    : { backgroundColor: '#475569', color: '#94a3b8', borderColor: '#475569' }
                }
              >
                {isCurrentUserTurn ? 'Make Your Pick' : 'Wait Your Turn'}
              </button>
            </div>
          </div>
        </div>
      ) : hasSeasonActivityEvents ? null : (
        <div className="mb-6 bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl border-2 border-green-600/50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-green-300 font-semibold mb-1">Draft Completed</h3>
              <p className="text-green-200/80 text-sm">
                All Final 3 positions have been drafted. Players can now make weekly boot picks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Podium Visualization */}
      {shouldShowPodium ? (
        <div className="mb-8">
        <h2 className="text-2xl mb-6">Top 3</h2>
        
        {isLoadingStandings ? (
          <div className="text-center text-slate-400 py-8">Loading standings...</div>
        ) : topThree.length === 0 ? (
          <div className="flex items-end justify-center gap-2 sm:gap-4 mb-8">
            {/* Empty 2nd Place */}
            <div className="flex-1 max-w-[140px] sm:max-w-[200px]">
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-3 sm:p-4 mb-3 border-2 border-dashed border-slate-600">
                <div className="flex justify-center mb-2 sm:mb-3">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" />
                </div>
                <div className="aspect-square rounded-full bg-slate-700/30 mb-2 sm:mb-3 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl text-slate-600">
                    ?
                  </div>
                </div>
                <p className="text-center text-xs sm:text-sm mb-1 text-slate-500">No player</p>
                <p className="text-center text-sm sm:text-base text-slate-600">—</p>
              </div>
              <div className="h-20 sm:h-24 bg-gradient-to-b from-slate-700/50 to-slate-800/50 rounded-t-lg flex items-center justify-center">
                <span className="text-2xl sm:text-3xl text-slate-600">2</span>
              </div>
            </div>

            {/* Empty 1st Place */}
            <div className="flex-1 max-w-[140px] sm:max-w-[200px]">
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-3 sm:p-4 mb-3 border-2 border-dashed"
                   style={{ borderColor: '#BFFF0B40' }}>
                <div className="flex justify-center mb-2 sm:mb-3">
                  <Crown className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#BFFF0B40' }} />
                </div>
                <div className="aspect-square rounded-full mb-2 sm:mb-3 overflow-hidden"
                     style={{ backgroundColor: '#BFFF0B20' }}>
                  <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl text-slate-600">
                    ?
                  </div>
                </div>
                <p className="text-center text-xs sm:text-sm mb-1 text-slate-500">No player</p>
                <p className="text-center text-sm sm:text-base text-slate-600">—</p>
              </div>
              <div className="h-28 sm:h-32 bg-gradient-to-b from-slate-700/50 to-slate-800/50 rounded-t-lg flex items-center justify-center">
                <span className="text-3xl sm:text-4xl text-slate-600">1</span>
              </div>
            </div>

            {/* Empty 3rd Place */}
            <div className="flex-1 max-w-[140px] sm:max-w-[200px]">
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-3 sm:p-4 mb-3 border-2 border-dashed border-slate-600">
                <div className="flex justify-center mb-2 sm:mb-3">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" />
                </div>
                <div className="aspect-square rounded-full bg-slate-700/30 mb-2 sm:mb-3 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl text-slate-600">
                    ?
                  </div>
                </div>
                <p className="text-center text-xs sm:text-sm mb-1 text-slate-500">No player</p>
                <p className="text-center text-sm sm:text-base text-slate-600">—</p>
              </div>
              <div className="h-12 sm:h-16 bg-gradient-to-b from-slate-700/50 to-slate-800/50 rounded-t-lg flex items-center justify-center">
                <span className="text-xl sm:text-2xl text-slate-600">3</span>
              </div>
            </div>
          </div>
        ) : (
          /* Podium - Shows on all screen sizes */
          <div className="flex items-end justify-center gap-2 sm:gap-4 mb-8">
            {/* 2nd Place */}
            {topThree[1] ? (
              <div className="flex-1 max-w-[140px] sm:max-w-[200px]">
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-3 sm:p-4 mb-3 border-2 border-slate-600">
                  <div className="flex justify-center mb-2 sm:mb-3">
                    <Award className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                  </div>
                  <div className="aspect-square rounded-full bg-slate-600 mb-2 sm:mb-3 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl">
                      {topThree[1].username[0]}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUserClick(topThree[1].userId, topThree[1].username)}
                    className="w-full text-center text-xs sm:text-sm mb-1 truncate hover:underline cursor-pointer text-white"
                  >
                    {topThree[1].username}
                  </button>
                  <p className="text-center text-sm sm:text-base" style={{ color: '#BFFF0B' }}>{topThree[1].points} pts</p>
                </div>
                <div className="h-20 sm:h-24 bg-gradient-to-b from-slate-700 to-slate-800 rounded-t-lg flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl text-slate-400">2</span>
                </div>
              </div>
            ) : (
              <div className="flex-1 max-w-[140px] sm:max-w-[200px]">
                <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-3 sm:p-4 mb-3 border-2 border-dashed border-slate-600">
                  <div className="flex justify-center mb-2 sm:mb-3">
                    <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" />
                  </div>
                  <div className="aspect-square rounded-full bg-slate-700/30 mb-2 sm:mb-3 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl text-slate-600">
                      ?
                    </div>
                  </div>
                  <p className="text-center text-xs sm:text-sm mb-1 text-slate-500">No player</p>
                  <p className="text-center text-sm sm:text-base text-slate-600">—</p>
                </div>
                <div className="h-20 sm:h-24 bg-gradient-to-b from-slate-700/50 to-slate-800/50 rounded-t-lg flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl text-slate-600">2</span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {topThree[0] ? (
              <div className="flex-1 max-w-[140px] sm:max-w-[200px]">
                <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-3 sm:p-4 mb-3 border-2"
                     style={{ borderColor: '#BFFF0B' }}>
                  <div className="flex justify-center mb-2 sm:mb-3">
                    <Crown className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#BFFF0B' }} />
                  </div>
                  <div className="aspect-square rounded-full mb-2 sm:mb-3 overflow-hidden"
                       style={{ backgroundColor: '#BFFF0B' }}>
                    <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl text-slate-900">
                      {topThree[0].username[0]}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUserClick(topThree[0].userId, topThree[0].username)}
                    className="w-full text-center text-xs sm:text-sm mb-1 truncate hover:underline cursor-pointer text-white"
                  >
                    {topThree[0].username}
                  </button>
                  <p className="text-center text-sm sm:text-base" style={{ color: '#BFFF0B' }}>{topThree[0].points} pts</p>
                </div>
                <div className="h-28 sm:h-32 bg-gradient-to-b from-yellow-600 to-yellow-700 rounded-t-lg flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl" style={{ color: '#BFFF0B' }}>1</span>
                </div>
              </div>
            ) : (
              <div className="flex-1 max-w-[140px] sm:max-w-[200px]">
                <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-3 sm:p-4 mb-3 border-2 border-dashed"
                     style={{ borderColor: '#BFFF0B40' }}>
                  <div className="flex justify-center mb-2 sm:mb-3">
                    <Crown className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#BFFF0B40' }} />
                  </div>
                  <div className="aspect-square rounded-full mb-2 sm:mb-3 overflow-hidden"
                       style={{ backgroundColor: '#BFFF0B20' }}>
                    <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl text-slate-600">
                      ?
                    </div>
                  </div>
                  <p className="text-center text-xs sm:text-sm mb-1 text-slate-500">No player</p>
                  <p className="text-center text-sm sm:text-base text-slate-600">—</p>
                </div>
                <div className="h-28 sm:h-32 bg-gradient-to-b from-slate-700/50 to-slate-800/50 rounded-t-lg flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl text-slate-600">1</span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] ? (
              <div className="flex-1 max-w-[140px] sm:max-w-[200px]">
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-3 sm:p-4 mb-3 border-2 border-slate-600">
                  <div className="flex justify-center mb-2 sm:mb-3">
                    <Award className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500" />
                  </div>
                  <div className="aspect-square rounded-full bg-slate-600 mb-2 sm:mb-3 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl">
                      {topThree[2].username[0]}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUserClick(topThree[2].userId, topThree[2].username)}
                    className="w-full text-center text-xs sm:text-sm mb-1 truncate hover:underline cursor-pointer text-white"
                  >
                    {topThree[2].username}
                  </button>
                  <p className="text-center text-sm sm:text-base" style={{ color: '#BFFF0B' }}>{topThree[2].points} pts</p>
                </div>
                <div className="h-12 sm:h-16 bg-gradient-to-b from-slate-700 to-slate-800 rounded-t-lg flex items-center justify-center">
                  <span className="text-xl sm:text-2xl text-slate-500">3</span>
                </div>
              </div>
            ) : (
              <div className="flex-1 max-w-[140px] sm:max-w-[200px]">
                <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-3 sm:p-4 mb-3 border-2 border-dashed border-slate-600">
                  <div className="flex justify-center mb-2 sm:mb-3">
                    <Award className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" />
                  </div>
                  <div className="aspect-square rounded-full bg-slate-700/30 mb-2 sm:mb-3 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl text-slate-600">
                      ?
                    </div>
                  </div>
                  <p className="text-center text-xs sm:text-sm mb-1 text-slate-500">No player</p>
                  <p className="text-center text-sm sm:text-base text-slate-600">—</p>
                </div>
                <div className="h-12 sm:h-16 bg-gradient-to-b from-slate-700/50 to-slate-800/50 rounded-t-lg flex items-center justify-center">
                  <span className="text-xl sm:text-2xl text-slate-600">3</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      ) : shouldShowDraftHowItWorks ? (
        draftHowItWorksSection
      ) : null}

      {/* Full Standings */}
      <div>
        <h2 className="text-2xl mb-4">Standings</h2>
        <div className="h-3"></div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[40px_1fr_80px_50px] sm:grid-cols-[60px_1fr_100px_80px] gap-2 sm:gap-4 p-4 border-b border-slate-800 text-sm text-slate-400">
            <div className="text-center">Rank</div>
            <div>Player</div>
            <div className="text-right">Points</div>
            <div className="text-center">Change</div>
          </div>

          {/* Standings List */}
          <div>
            {isLoadingStandings ? (
              <div className="p-8 text-center text-slate-400">Loading standings...</div>
            ) : standings.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p>No standings available yet.</p>
                <p className="text-sm mt-2">Players will appear here once they join the league.</p>
              </div>
            ) : (
              standings.map((standing) => (
                <button
                  key={standing.userId}
                  type="button"
                  onClick={() => handleUserClick(standing.userId, standing.username)}
                  className="standings-row grid grid-cols-[40px_1fr_80px_50px] sm:grid-cols-[60px_1fr_100px_80px] gap-2 sm:gap-4 p-4 border-b border-slate-800 last:border-b-0 transition-colors text-left w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-600/70"
                  aria-label={`View ${standing.username}'s roster`}
                >
                  <div className="text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-sm sm:text-base ${
                      currentUser && standing.userId === currentUser.id ? 'text-slate-900' : 'bg-slate-800'
                    }`}
                    style={currentUser && standing.userId === currentUser.id ? { backgroundColor: '#BFFF0B' } : {}}>
                      {standing.rank}
                    </span>
                  </div>
                  <span className="truncate text-white hover:underline">
                    {standing.username}
                  </span>
                  <div className="text-right">{standing.points ?? 0}</div>
                  <div className="flex justify-center">
                    {standing.change > 0 && (
                      <div className="flex items-center gap-1 text-emerald-500">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">{standing.change}</span>
                      </div>
                    )}
                    {standing.change < 0 && (
                      <div className="flex items-center gap-1 text-red-500">
                        <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">{Math.abs(standing.change)}</span>
                      </div>
                    )}
                    {(standing.change === 0 || standing.change === null || standing.change === undefined) && (
                      <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="h-3"></div>
      <div className="h-3"></div>



      <div ref={leagueActivityRef} className="mt-10">
        <h2 className="text-2xl mb-4">League Activity</h2>
        <div className="h-3"></div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <LeagueActivityContent
            leagueId={selectedLeague?.id || null}
            seasonId={seasonId || null}
          />
        </div>
      </div>

      {shouldShowPodium && shouldShowDraftHowItWorks ? (
        <>
          <div className="h-12"></div>
          {draftHowItWorksSection}
        </>
      ) : null}

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

      {/* Modify Draft Order Modal */}
      <ModifyDraftOrderModal
        isOpen={isDraftOrderModalOpen}
        onClose={() => {
          setIsDraftOrderModalOpen(false);
          // Invalidate caches after modal closes
          if (selectedLeague?.id) {
            mutate(createKey('draft-order-members', selectedLeague.id));
            mutate(createKey('league-draft-state', selectedLeague.id));
          }
        }}
        leagueId={selectedLeague?.id || null}
      />

      {/* Contestant Replacement Modal */}
      <ContestantReplacementModal
        isOpen={isReplacementModalOpen}
        onClose={() => {
          setIsReplacementModalOpen(false);
          setSelectedSlotIndex(null);
          setSelectedSlotType('final3');
          setMedicalEvacReplacement(null);
        }}
        contestants={availableContestants}
        currentContestant={selectedSlotIndex !== null ? roster[selectedSlotIndex]?.contestant || null : null}
        slotType={selectedSlotType}
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
            setIsReplacementModalOpen(true);
          }}
          onConfirm={handleConfirmDraftPick}
          title="Confirm Draft Selection"
          message={
            selectedSlotType === 'boot'
              ? `Are you sure you want to draft ${pendingContestant.name} for the Week ${nextBootWeek} Next Eliminated pick? This selection cannot be changed once confirmed.`
              : medicalEvacReplacement && medicalEvacReplacement.slotIndex === selectedSlotIndex
              ? `Are you sure you want to replace ${medicalEvacReplacement.contestantName} with ${pendingContestant.name} for Position ${
                  selectedSlotIndex + 1
                } (${selectedSlotIndex === 0 ? 'Sole Survivor' : selectedSlotIndex === 1 ? 'Runner Up' : 'Third Place'})?`
              : `Are you sure you want to draft ${pendingContestant.name} for Position ${
                  selectedSlotIndex + 1
                } (${selectedSlotIndex === 0 ? 'Sole Survivor' : selectedSlotIndex === 1 ? 'Runner Up' : 'Third Place'})? This selection cannot be changed once confirmed.`
          }
          confirmText="Confirm Draft"
          cancelText="Cancel"
          isLoading={isDrafting}
          confirmButtonStyle={{
            backgroundColor: '#22c55e',
            color: '#0f172a',
          }}
        />
      )}

      {/* Start Draft Confirmation Modal */}
      <ConfirmationModal
        isOpen={isStartDraftConfirmOpen}
        onClose={() => setIsStartDraftConfirmOpen(false)}
        onConfirm={handleStartDraft}
        title="Start Draft"
        message="Are you sure you want to start the draft? Once started, players will be able to draft contestants in snake draft order. Make sure the draft order is set correctly before starting."
        confirmText="Start Draft"
        cancelText="Cancel"
        isLoading={isStartingDraft}
        confirmButtonStyle={{
          backgroundColor: '#BFFF0B',
          color: '#000',
        }}
      />

      {/* User Roster Modal */}
      <UserRosterModal
        isOpen={selectedUserForRoster !== null}
        onClose={() => setSelectedUserForRoster(null)}
        userId={selectedUserForRoster?.userId || null}
        leagueId={selectedLeague?.id || null}
        seasonId={seasonId || null}
        username={selectedUserForRoster?.username || ''}
      />
    </div>
  );
}