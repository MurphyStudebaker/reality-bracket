import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Users, TrendingUp, TrendingDown, Minus, Crown, Award, Medal, Copy, Check, Play, Lock, Bell, ArrowUpDown } from 'lucide-react';
import useSWR from 'swr';
import LeagueSelector from '../common/LeagueSelector';
import LeagueActivityModal from '../modals/LeagueActivityModal';
import ModifyDraftOrderModal from '../modals/ModifyDraftOrderModal';
import UserRosterDrawer from '../drawers/UserRosterDrawer';
import { SupabaseService } from '../../services/supabaseService';
import { fetcher, createKey } from '../../lib/swr';
import type { LeagueStanding } from '../../models';

interface League {
  id: string;
  name: string;
  season: string;
  seasonNumber: number;
  seasonName: string;
  memberCount: number;
  inviteCode: string;
}

interface LeaguePageProps {
  selectedLeague: League | null;
  onLeagueChange: (league: League | null) => void;
  onNavigateToRoster?: () => void;
}

export default function LeaguePage({ selectedLeague, onLeagueChange, onNavigateToRoster }: LeaguePageProps) {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isDraftOrderModalOpen, setIsDraftOrderModalOpen] = useState(false);
  const [selectedUserForRoster, setSelectedUserForRoster] = useState<{ userId: string; username: string } | null>(null);

  // Fetch current user
  const userKey = createKey('current-user');
  const { data: currentUser } = useSWR<{ id: string } | null>(userKey, fetcher);

  // Handle user click - navigate to roster if it's the current user, otherwise show drawer
  const handleUserClick = (userId: string, username: string) => {
    if (currentUser && userId === currentUser.id && onNavigateToRoster) {
      onNavigateToRoster();
    } else {
      setSelectedUserForRoster({ userId, username });
    }
  };

  // Fetch leagues using SWR
  const leaguesKey = createKey('leagues-selector', currentUser?.id);
  const { data: leagues = [], isLoading } = useSWR<League[]>(
    leaguesKey,
    fetcher
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

  // Check if draft is completed by checking if all league members have 3 Final 3 picks
  const draftStatusKey = createKey('draft-status', selectedLeague?.id);
  const { data: isDraftCompleted = false } = useSWR<boolean>(
    selectedLeague?.id ? draftStatusKey : null,
    async () => {
      if (!selectedLeague?.id) return false;
      
      try {
        const supabase = SupabaseService.getClient();
        
        // Get all league members
        const { data: members, error: membersError } = await supabase
          .from('league_members')
          .select('user_id')
          .eq('league_id', selectedLeague.id);
        
        if (membersError || !members || members.length === 0) {
          return false;
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
        return memberChecks.every(completed => completed === true);
      } catch (error) {
        console.error('Error checking draft status:', error);
        return false;
      }
    }
  );

  const topThree = standings.slice(0, 3);
  const restOfStandings = standings.slice(3);

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
              title="View league activity"
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

      {/* Podium Visualization */}
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
                    <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
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

      {/* Full Standings */}
      <div>
        <h2 className="text-2xl mb-4">Standings</h2>
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
                <div
                  key={standing.userId}
                  className="grid grid-cols-[40px_1fr_80px_50px] sm:grid-cols-[60px_1fr_100px_80px] gap-2 sm:gap-4 p-4 border-b border-slate-800 last:border-b-0 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-sm sm:text-base ${
                      currentUser && standing.userId === currentUser.id ? 'text-slate-900' : 'bg-slate-800'
                    }`}
                    style={currentUser && standing.userId === currentUser.id ? { backgroundColor: '#BFFF0B' } : {}}>
                      {standing.rank}
                    </span>
                  </div>
                  <button
                    onClick={() => handleUserClick(standing.userId, standing.username)}
                    className="truncate text-left hover:underline cursor-pointer text-white"
                  >
                    {standing.username}
                  </button>
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
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="h-12"></div>

      {/* How Draft Works Section */}
      <div className="mt-12">
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

        {/* Begin Draft Button */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => {
              if (!isDraftCompleted) {
                // TODO: Implement draft start logic
                console.log('Begin draft clicked');
              }
            }}
            disabled={isDraftCompleted}
            className={`w-full px-6 py-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${
              isDraftCompleted
                ? 'cursor-not-allowed opacity-60'
                : 'hover:scale-[1.02] active:scale-[0.98] hover:opacity-90 active:opacity-80'
            }`}
            style={
              isDraftCompleted
                ? { backgroundColor: '#475569', color: '#94a3b8' }
                : { 
                  borderColor: '#BFFF0B',
                  backgroundColor: 'rgba(191, 255, 11, 0.1)',
                  color: '#BFFF0B'
                }
            }
          >
            {isDraftCompleted ? (
              <>
                <Lock className="w-5 h-5" />
                <span>Draft Completed</span>
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
              if (!isDraftCompleted) {
                setIsDraftOrderModalOpen(true);
              }
            }}
            disabled={isDraftCompleted}
            className={`w-full px-6 py-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${
              isDraftCompleted
                ? 'cursor-not-allowed opacity-60'
                : 'hover:scale-[1.02] active:scale-[0.98] hover:opacity-90 active:opacity-80'
            }`}
            style={
              isDraftCompleted
                ? { backgroundColor: '#475569', color: '#94a3b8', borderColor: '#475569' }
                : {
                  borderColor: '#64748b',
                  backgroundColor: 'rgba(100, 116, 139, 0.1)',
                  color: '#94a3b8'
                }
            }
          >
            <ArrowUpDown className="w-5 h-5" />
            <span>Modify Draft Order</span>
          </button>
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

      {/* League Activity Modal */}
      <LeagueActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        leagueId={selectedLeague?.id || null}
        seasonId={seasonId || null}
      />

      {/* Modify Draft Order Modal */}
      <ModifyDraftOrderModal
        isOpen={isDraftOrderModalOpen}
        onClose={() => setIsDraftOrderModalOpen(false)}
        leagueId={selectedLeague?.id || null}
      />

      {/* User Roster Drawer */}
      <UserRosterDrawer
        isOpen={selectedUserForRoster !== null}
        onClose={() => setSelectedUserForRoster(null)}
        userId={selectedUserForRoster?.userId || null}
        leagueId={selectedLeague?.id || null}
        username={selectedUserForRoster?.username || ''}
      />
    </div>
  );
}