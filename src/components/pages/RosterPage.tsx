import { useState } from 'react';
import { ChevronDown, Users, UserPlus } from 'lucide-react';
import { myRoster, myLeagues, contestants, Contestant, RosterSlot } from '../../data/mockData';
import LeagueSelector from '../common/LeagueSelector';
import ContestantReplacementDrawer from '../drawers/ContestantReplacementDrawer';

export default function RosterPage() {
  const [selectedLeague, setSelectedLeague] = useState(myLeagues[0]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isReplacementDrawerOpen, setIsReplacementDrawerOpen] = useState(false);
  const [roster, setRoster] = useState<RosterSlot[]>(myRoster);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const final3Slots = roster.filter(slot => slot.type === 'final3');
  const bootSlot = roster.find(slot => slot.type === 'boot');

  const handleDraftClick = (index: number) => {
    setSelectedSlotIndex(index);
    setIsReplacementDrawerOpen(true);
  };

  const handleSelectContestant = (contestant: Contestant) => {
    if (selectedSlotIndex !== null) {
      const newRoster = [...roster];
      newRoster[selectedSlotIndex] = {
        ...newRoster[selectedSlotIndex],
        contestant,
      };
      setRoster(newRoster);
    }
  };

  const isContestantEliminated = (contestant: Contestant | null) => {
    if (!contestant) return false;
    return contestant.status === 'eliminated' || contestant.status === 'jury';
  };

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

      {/* Final 3 Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 rounded-full" style={{ backgroundColor: '#BFFF0B' }} />
          <h2 className="text-2xl">Final 3 Picks</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {final3Slots.map((slot, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 p-6 relative overflow-hidden"
              style={{ borderColor: '#BFFF0B' }}
            >
              {slot.contestant ? (
                <>
                  {/* Position Number */}
                  <div className="absolute top-4 right-4 text-4xl opacity-20"
                       style={{ color: '#BFFF0B' }}>
                    {index + 1}
                  </div>

                  {/* Profile Picture */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-700 mb-3 border-2"
                         style={{ borderColor: '#BFFF0B' }}>
                      <img
                        src={slot.contestant.imageUrl}
                        alt={slot.contestant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-center text-xl">{slot.contestant.name}</h3>
                  </div>
                </>
              ) : (
                <>
                  {/* Position Number */}
                  <div className="absolute top-4 right-4 text-4xl opacity-20"
                       style={{ color: '#BFFF0B' }}>
                    {index + 1}
                  </div>

                  {/* Empty Slot State */}
                  <div className="flex flex-col items-center justify-center h-full py-4">
                    <div className="w-24 h-24 rounded-full bg-slate-800/50 mb-4 border-2 border-dashed border-slate-700 flex items-center justify-center">
                      <UserPlus className="w-10 h-10 text-slate-600" />
                    </div>
                    <button
                      onClick={() => handleDraftClick(index)}
                      className="px-6 py-2.5 rounded-lg border-2 transition-all hover:bg-slate-800"
                      style={{ borderColor: '#BFFF0B', color: '#BFFF0B' }}
                    >
                      Draft Player
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Next Boot Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 rounded-full bg-red-500" />
          <h2 className="text-2xl">Next Boot Pick</h2>
        </div>

        <div className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 border-red-500 p-6 max-w-md relative overflow-hidden ${
          bootSlot?.contestant && isContestantEliminated(bootSlot.contestant) ? 'opacity-60' : ''
        }`}>
          {bootSlot?.contestant ? (
            <>
              {/* Boot Badge */}
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs bg-red-600 text-white">
                BOOT
              </div>

              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-700 mb-3 border-2 border-red-500">
                  <img
                    src={bootSlot.contestant.imageUrl}
                    alt={bootSlot.contestant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-center text-xl">{bootSlot.contestant.name}</h3>
              </div>
            </>
          ) : (
            <>
              {/* Empty Slot State */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-24 h-24 rounded-full bg-slate-800/50 mb-4 border-2 border-dashed border-red-500/50 flex items-center justify-center">
                  <UserPlus className="w-10 h-10 text-slate-600" />
                </div>
                <button
                  onClick={() => handleDraftClick(roster.indexOf(bootSlot!))}
                  className="px-6 py-2.5 rounded-lg border-2 transition-all hover:bg-slate-800"
                  style={{ borderColor: '#BFFF0B', color: '#BFFF0B' }}
                >
                  Draft Player
                </button>
              </div>
            </>
          )}
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

      {/* Contestant Replacement Drawer */}
      <ContestantReplacementDrawer
        isOpen={isReplacementDrawerOpen}
        onClose={() => setIsReplacementDrawerOpen(false)}
        contestants={contestants}
        currentContestant={selectedSlotIndex !== null ? roster[selectedSlotIndex].contestant : null}
        slotType={selectedSlotIndex !== null ? roster[selectedSlotIndex].type : 'final3'}
        onSelectContestant={handleSelectContestant}
      />
    </div>
  );
}