import { useState } from 'react';
import { Plus, LogIn, ChevronRight } from 'lucide-react';
import { myLeagues, availableSeasons } from '../../data/mockData';
import JoinLeagueModal from '../modals/JoinLeagueModal';
import CreateLeagueModal from '../modals/CreateLeagueModal';

type League = { id: string; name: string; season: string; memberCount: number; inviteCode: string };

interface HomePageProps {
  onLeagueClick: (league: League) => void;
}

export default function HomePage({ onLeagueClick }: HomePageProps) {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8">
      {/* Hero Section */}
      <div className="mb-8 lg:mb-12">
        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-4xl mb-2">Welcome to Reality Bracket</h2>
            <p className="text-teal-100 lg:text-lg">Draft your picks. Track the points. Win the league.</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setIsJoinModalOpen(true)}
          className="flex items-center gap-3 p-4 lg:p-6 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ borderColor: '#BFFF0B', backgroundColor: 'rgba(191, 255, 11, 0.1)' }}
        >
          <div className="p-3 rounded-lg bg-slate-900">
            <LogIn className="w-6 h-6" style={{ color: '#BFFF0B' }} />
          </div>
          <div className="text-left flex-1">
            <h3 className="text-lg">Join League</h3>
            <p className="text-sm text-slate-400">Enter invite code</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-3 p-4 lg:p-6 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ borderColor: '#BFFF0B', backgroundColor: 'rgba(191, 255, 11, 0.1)' }}
        >
          <div className="p-3 rounded-lg bg-slate-900">
            <Plus className="w-6 h-6" style={{ color: '#BFFF0B' }} />
          </div>
          <div className="text-left flex-1">
            <h3 className="text-lg">Create League</h3>
            <p className="text-sm text-slate-400">Start a new league</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* My Leagues */}
      <div className="mb-8">
        <h3 className="text-xl mb-4">My Leagues</h3>
        <div className="space-y-3">
          {myLeagues.map((league) => (
            <button
              key={league.id}
              onClick={() => onLeagueClick(league)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 lg:p-5 hover:border-slate-700 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg">{league.name}</h4>
                <span className="px-3 py-1 rounded-full text-xs bg-slate-800 text-slate-300">
                  {league.memberCount} members
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{league.season}</p>
                <p className="text-xs text-slate-500">Code: {league.inviteCode}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Available Seasons */}
      <div>
        <h3 className="text-xl mb-4">Available Seasons</h3>
        <div className="space-y-3">
          {availableSeasons.map((season) => (
            <div
              key={season.id}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 lg:p-5 flex items-center justify-between"
            >
              <div>
                <h4 className="text-lg mb-1">{season.name}</h4>
                <p className="text-sm text-slate-400">Survivor</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  season.status === 'active'
                    ? 'text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
                style={season.status === 'active' ? { backgroundColor: '#BFFF0B', color: '#0f172a' } : {}}
              >
                {season.status === 'active' ? 'Active' : 'Completed'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <JoinLeagueModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
      <CreateLeagueModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
}