import { useState, useEffect, useRef } from 'react';
import { Plus, LogIn, ChevronRight } from 'lucide-react';
import { useHomeViewModel } from '../../viewmodels/useHomeViewModel';
import JoinLeagueModal from '../modals/JoinLeagueModal';
import CreateLeagueModal from '../modals/CreateLeagueModal';
import type { League as UILeague } from '../../models/types';

type League = { id: string; name: string; season: string; memberCount: number; inviteCode: string };

interface HomePageProps {
  onLeagueClick: (league: League) => void;
}

export default function HomePage({ onLeagueClick }: HomePageProps) {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const viewModel = useHomeViewModel();
  const availableSeasons = viewModel.seasons;

  // Track previous states to detect successful completion
  const prevIsJoiningRef = useRef(false);
  const prevIsCreatingRef = useRef(false);

  // Close join modal on success (when loading stops and no error)
  useEffect(() => {
    if (prevIsJoiningRef.current && !viewModel.isJoiningLeague && !viewModel.joinLeagueError && isJoinModalOpen) {
      setIsJoinModalOpen(false);
    }
    prevIsJoiningRef.current = viewModel.isJoiningLeague;
  }, [viewModel.isJoiningLeague, viewModel.joinLeagueError, isJoinModalOpen]);

  // Close create modal on success (when loading stops and no error)
  useEffect(() => {
    if (prevIsCreatingRef.current && !viewModel.isCreatingLeague && !viewModel.createLeagueError && isCreateModalOpen) {
      setIsCreateModalOpen(false);
    }
    prevIsCreatingRef.current = viewModel.isCreatingLeague;
  }, [viewModel.isCreatingLeague, viewModel.createLeagueError, isCreateModalOpen]);

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8">
      {/* Hero Section */}
      {/* <div className="mb-8 lg:mb-12">
        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-4xl mb-2">Welcome to Reality Bracket</h2>
            <p className="text-teal-100 lg:text-lg">Draft your picks. Track the points. Win the league.</p>
          </div>
        </div>
      </div> */}

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
          {viewModel.isLoadingLeagues ? (
            <p className="text-slate-400 text-center py-4">Loading your leagues...</p>
          ) : viewModel.myLeagues.length === 0 ? (
            <p className="text-slate-400 text-center py-4">
              You haven't joined any leagues yet. Create or join a league to get started!
            </p>
          ) : (
            viewModel.myLeagues.map((league) => (
              <button
                key={league.id}
                onClick={() => {
                  // Convert UI League format to expected League format
                  onLeagueClick({
                    id: league.id.toString(),
                    name: league.name,
                    season: league.season,
                    memberCount: league.members || 0,
                    inviteCode: '', // We don't have invite code in UI League type, but it's not displayed anyway
                  });
                }}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 lg:p-5 hover:border-slate-700 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg">{league.name}</h4>
                  <span className="px-3 py-1 rounded-full text-xs bg-slate-800 text-slate-300">
                    {league.members || 0} members
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">{league.season}</p>
                  {league.rank && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Rank #{league.rank}</span>
                      {league.points !== undefined && (
                        <span className="text-xs font-semibold" style={{ color: '#BFFF0B' }}>
                          {league.points} pts
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Available Seasons */}
      <div>
        <h3 className="text-xl mb-4">Available Seasons</h3>
        <div className="space-y-3">
          {availableSeasons.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No seasons available</p>
          ) : (
            availableSeasons.map((season) => (
              <div
                key={season.id}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 lg:p-5 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-lg mb-1">{season.title}</h4>
                  <p className="text-sm text-slate-400">Survivor</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    season.status === 'live'
                      ? 'text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                  style={season.status === 'live' ? { backgroundColor: '#BFFF0B', color: '#0f172a' } : {}}
                >
                  {season.status === 'live' ? 'Active' : season.status === 'completed' ? 'Completed' : 'Archived'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <JoinLeagueModal
        isOpen={isJoinModalOpen}
        onClose={() => {
          setIsJoinModalOpen(false);
          viewModel.clearJoinLeagueError();
        }}
        inviteCode={viewModel.inviteCode}
        isJoining={viewModel.isJoiningLeague}
        error={viewModel.joinLeagueError}
        onInviteCodeChange={viewModel.setInviteCode}
        onJoin={viewModel.handleJoinLeague}
        onClearError={viewModel.clearJoinLeagueError}
      />
      <CreateLeagueModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          viewModel.clearCreateLeagueError();
        }}
        seasons={viewModel.availableSeasonsForCreate || []}
        isLoadingSeasons={viewModel.isLoadingSeasons}
        leagueName={viewModel.leagueName}
        selectedSeason={viewModel.selectedSeason}
        draftDate={viewModel.draftDate}
        isCreating={viewModel.isCreatingLeague}
        error={viewModel.createLeagueError}
        onLeagueNameChange={viewModel.setLeagueName}
        onSeasonSelect={viewModel.handleSeasonSelect}
        onDraftDateChange={viewModel.handleDraftDateChange}
        onCreate={viewModel.handleCreateLeague}
        onClearError={viewModel.clearCreateLeagueError}
      />
    </div>
  );
}