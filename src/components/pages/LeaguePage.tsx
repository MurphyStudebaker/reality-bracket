import { useState, useEffect } from 'react';
import { ChevronDown, Users, TrendingUp, TrendingDown, Minus, Crown, Award, Medal, Copy, Check } from 'lucide-react';
import LeagueSelector from '../common/LeagueSelector';
import { SupabaseService } from '../../services/supabaseService';
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
  initialLeague?: League | null;
}

export default function LeaguePage({ initialLeague }: LeaguePageProps) {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(initialLeague || null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [isLoadingStandings, setIsLoadingStandings] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setIsLoading(true);
        const user = await SupabaseService.getCurrentUser();
        if (!user) {
          console.error('No user logged in');
          setIsLoading(false);
          return;
        }

        const fetchedLeagues = await SupabaseService.getLeaguesForSelector(user.id);
        setLeagues(fetchedLeagues);

        // Set selected league based on initialLeague prop or first available
        if (initialLeague && fetchedLeagues.find(l => l.id === initialLeague.id)) {
          setSelectedLeague(initialLeague);
        } else if (fetchedLeagues.length > 0) {
          setSelectedLeague(fetchedLeagues[0]);
        }
      } catch (error) {
        console.error('Error fetching leagues:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagues();
  }, [initialLeague]);

  // Fetch standings when selected league changes
  useEffect(() => {
    const fetchStandings = async () => {
      if (!selectedLeague) {
        setStandings([]);
        return;
      }

      try {
        setIsLoadingStandings(true);
        console.log('Fetching standings for league:', selectedLeague.id);
        const fetchedStandings = await SupabaseService.getLeagueStandings(selectedLeague.id);
        console.log('Fetched standings:', fetchedStandings);
        setStandings(fetchedStandings);
      } catch (error) {
        console.error('Error fetching standings:', error);
        setStandings([]);
      } finally {
        setIsLoadingStandings(false);
      }
    };

    fetchStandings();
  }, [selectedLeague]);

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
        </div>

        {/* Season Info and Invite Code - Subheadings */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-slate-400">
          <p className="text-sm">
            Survivor {selectedLeague.seasonNumber}: {selectedLeague.seasonName}
          </p>
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
                  <p className="text-center text-xs sm:text-sm mb-1 truncate">{topThree[1].username}</p>
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
                  <p className="text-center text-xs sm:text-sm mb-1 truncate">{topThree[0].username}</p>
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
                  <p className="text-center text-xs sm:text-sm mb-1 truncate">{topThree[2].username}</p>
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
                      standing.rank <= 3 ? 'text-slate-900' : 'bg-slate-800'
                    }`}
                    style={standing.rank <= 3 ? { backgroundColor: '#BFFF0B' } : {}}>
                      {standing.rank}
                    </span>
                  </div>
                  <div className="truncate">{standing.username}</div>
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

      {/* League Selector Drawer */}
      <LeagueSelector
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        leagues={leagues}
        selectedLeague={selectedLeague}
        onSelectLeague={(league) => {
          setSelectedLeague(league);
          setIsSelectorOpen(false);
        }}
      />
    </div>
  );
}