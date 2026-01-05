import { useState, useEffect } from 'react';
import { ChevronDown, Users, UserPlus, Copy, Check } from 'lucide-react';
import LeagueSelector from '../common/LeagueSelector';
import ContestantReplacementDrawer from '../drawers/ContestantReplacementDrawer';
import { SupabaseService } from '../../services/supabaseService';
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

export default function RosterPage() {
  const { user } = useAuthViewModel();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isLoadingLeagues, setIsLoadingLeagues] = useState(true);
  const [isReplacementDrawerOpen, setIsReplacementDrawerOpen] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Use roster viewmodel
  const {
    roster,
    availableContestants,
    isLoading: isLoadingRoster,
    error: rosterError,
    addContestantToRoster,
    refreshRoster,
  } = useRosterViewModel(selectedLeague?.id || null, user?.id || null);

  useEffect(() => {
    const fetchLeagues = async () => {
      if (!user) {
        setIsLoadingLeagues(false);
        return;
      }

      try {
        setIsLoadingLeagues(true);
        const fetchedLeagues = await SupabaseService.getLeaguesForSelector(user.id);
        setLeagues(fetchedLeagues);

        // Set selected league if available
        if (fetchedLeagues.length > 0) {
          setSelectedLeague(prev => prev || fetchedLeagues[0]);
        }
      } catch (error) {
        console.error('Error fetching leagues:', error);
      } finally {
        setIsLoadingLeagues(false);
      }
    };

    fetchLeagues();
  }, [user]);

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

      {/* Final 3 Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 rounded-full" style={{ backgroundColor: '#BFFF0B' }} />
          <h2 className="text-2xl">Final 3 Picks</h2>
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
                          0
                        </div>
                        <div className="text-xs text-slate-500">points</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 rounded-full bg-slate-800/50 border-2 border-dashed border-slate-700 flex items-center justify-center flex-shrink-0">
                        <UserPlus className="w-8 h-8 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-400">Empty Slot {index + 1}</h3>
                        <p className="text-sm text-slate-500">No contestant selected</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDraftClick(final3Slots.indexOf(slot))}
                      className="px-6 py-2.5 rounded-lg border-2 transition-all hover:bg-slate-800 flex-shrink-0"
                      style={{ borderColor: '#BFFF0B', color: '#BFFF0B' }}
                    >
                      Draft Player
                    </button>
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
                    0
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
    </div>
  );
}