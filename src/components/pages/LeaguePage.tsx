import { useState } from 'react';
import { ChevronDown, Users, TrendingUp, TrendingDown, Minus, Crown, Award, Medal } from 'lucide-react';
import { leagueStandings, myLeagues } from '../../data/mockData';
import LeagueSelector from '../common/LeagueSelector';

type League = { id: string; name: string; season: string; memberCount: number; inviteCode: string };

interface LeaguePageProps {
  initialLeague?: League | null;
}

export default function LeaguePage({ initialLeague }: LeaguePageProps) {
  const [selectedLeague, setSelectedLeague] = useState(initialLeague || myLeagues[0]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const topThree = leagueStandings.slice(0, 3);
  const restOfStandings = leagueStandings.slice(3);

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8">
      {/* League Selector */}
      <div className="mb-6">
        <button
          onClick={() => setIsSelectorOpen(true)}
          className="w-full sm:w-auto flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all"
        >
          <Users className="w-5 h-5 text-slate-400" />
          <span>{selectedLeague.name}</span>
          <ChevronDown className="w-4 h-4 text-slate-400 ml-auto" />
        </button>
      </div>

      {/* Podium Visualization */}
      <div className="mb-8">
        <h2 className="text-2xl mb-6">Top 3</h2>
        
        {/* Podium - Shows on all screen sizes */}
        <div className="flex items-end justify-center gap-2 sm:gap-4 mb-8">
          {/* 2nd Place */}
          <div className="flex-1 max-w-[140px] sm:max-w-[200px]">
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-3 sm:p-4 mb-3 border-2 border-slate-600">
              <div className="flex justify-center mb-2 sm:mb-3">
                <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
              </div>
              <div className="aspect-square rounded-full bg-slate-600 mb-2 sm:mb-3 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl">
                  {topThree[1]?.username[0]}
                </div>
              </div>
              <p className="text-center text-xs sm:text-sm mb-1 truncate">{topThree[1]?.username}</p>
              <p className="text-center text-sm sm:text-base" style={{ color: '#BFFF0B' }}>{topThree[1]?.points} pts</p>
            </div>
            <div className="h-20 sm:h-24 bg-gradient-to-b from-slate-700 to-slate-800 rounded-t-lg flex items-center justify-center">
              <span className="text-2xl sm:text-3xl text-slate-400">2</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex-1 max-w-[140px] sm:max-w-[200px]">
            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-3 sm:p-4 mb-3 border-2"
                 style={{ borderColor: '#BFFF0B' }}>
              <div className="flex justify-center mb-2 sm:mb-3">
                <Crown className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#BFFF0B' }} />
              </div>
              <div className="aspect-square rounded-full mb-2 sm:mb-3 overflow-hidden"
                   style={{ backgroundColor: '#BFFF0B' }}>
                <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl text-slate-900">
                  {topThree[0]?.username[0]}
                </div>
              </div>
              <p className="text-center text-xs sm:text-sm mb-1 truncate">{topThree[0]?.username}</p>
              <p className="text-center text-sm sm:text-base" style={{ color: '#BFFF0B' }}>{topThree[0]?.points} pts</p>
            </div>
            <div className="h-28 sm:h-32 bg-gradient-to-b from-yellow-600 to-yellow-700 rounded-t-lg flex items-center justify-center">
              <span className="text-3xl sm:text-4xl" style={{ color: '#BFFF0B' }}>1</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex-1 max-w-[140px] sm:max-w-[200px]">
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-3 sm:p-4 mb-3 border-2 border-slate-600">
              <div className="flex justify-center mb-2 sm:mb-3">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500" />
              </div>
              <div className="aspect-square rounded-full bg-slate-600 mb-2 sm:mb-3 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl">
                  {topThree[2]?.username[0]}
                </div>
              </div>
              <p className="text-center text-xs sm:text-sm mb-1 truncate">{topThree[2]?.username}</p>
              <p className="text-center text-sm sm:text-base" style={{ color: '#BFFF0B' }}>{topThree[2]?.points} pts</p>
            </div>
            <div className="h-12 sm:h-16 bg-gradient-to-b from-slate-700 to-slate-800 rounded-t-lg flex items-center justify-center">
              <span className="text-xl sm:text-2xl text-slate-500">3</span>
            </div>
          </div>
        </div>
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
            {leagueStandings.map((standing) => (
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
                <div className="text-right">{standing.points}</div>
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
                  {standing.change === 0 && (
                    <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* League Selector Drawer */}
      <LeagueSelector
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        leagues={myLeagues}
        selectedLeague={selectedLeague}
        onSelectLeague={(league) => {
          setSelectedLeague(league);
          setIsSelectorOpen(false);
        }}
      />
    </div>
  );
}