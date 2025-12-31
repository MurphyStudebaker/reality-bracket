import { X, Check } from 'lucide-react';
import { Contestant } from '../../data/mockData';

interface ContestantReplacementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contestants: Contestant[];
  currentContestant: Contestant | null;
  slotType: 'final3' | 'boot';
  onSelectContestant: (contestant: Contestant) => void;
}

export default function ContestantReplacementDrawer({
  isOpen,
  onClose,
  contestants,
  currentContestant,
  slotType,
  onSelectContestant,
}: ContestantReplacementDrawerProps) {
  if (!isOpen) return null;

  // Available players are those with 'active' status
  const availableContestants = contestants.filter(c => c.status === 'active');
  
  // Unavailable players are eliminated, jury, or final3
  const unavailableContestants = contestants.filter(c => c.status !== 'active');

  const handleSelect = (contestant: Contestant) => {
    onSelectContestant(contestant);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Mobile: Bottom Drawer, Desktop: Center Panel */}
      <div className="fixed inset-x-0 bottom-0 lg:inset-0 lg:flex lg:items-center lg:justify-center z-50 pointer-events-none">
        <div 
          className="bg-slate-900 border-slate-800 flex flex-col max-h-[85vh] lg:max-h-[700px] w-full lg:w-[600px] rounded-t-2xl lg:rounded-2xl border-t lg:border pointer-events-auto animate-slide-in-bottom lg:animate-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-slate-800">
            <div>
              <h2 className="text-xl">Replace Contestant</h2>
              <p className="text-sm text-slate-400 mt-1">
                {currentContestant ? `Replacing ${currentContestant.name}` : 'Select a contestant'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            {/* Available Contestants */}
            {availableContestants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm text-slate-400 mb-3">AVAILABLE CONTESTANTS</h3>
                <div className="space-y-2">
                  {availableContestants.map((contestant) => (
                    <button
                      key={contestant.id}
                      onClick={() => handleSelect(contestant)}
                      className="w-full bg-slate-800/50 rounded-lg p-4 hover:bg-slate-800 transition-all border-2 border-transparent hover:border-slate-700"
                    >
                      <div className="flex items-center gap-4">
                        {/* Profile Image */}
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-700 border-2 flex-shrink-0"
                             style={{ borderColor: '#BFFF0B' }}>
                          <img
                            src={contestant.imageUrl}
                            alt={contestant.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-left">
                          <p className="mb-1">{contestant.name}</p>
                          <p className="text-sm text-slate-400">
                            {contestant.age} • {contestant.occupation}
                          </p>
                          <p className="text-xs text-slate-500">{contestant.hometown}</p>
                        </div>

                        {/* Status Badge */}
                        <div className="px-3 py-1 rounded-full text-xs flex-shrink-0"
                             style={{ backgroundColor: 'rgba(191, 255, 11, 0.2)', color: '#BFFF0B' }}>
                          Active
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Unavailable Contestants */}
            {unavailableContestants.length > 0 && (
              <div>
                <h3 className="text-sm text-slate-400 mb-3">UNAVAILABLE CONTESTANTS</h3>
                <div className="space-y-2">
                  {unavailableContestants.map((contestant) => (
                    <div
                      key={contestant.id}
                      className="w-full bg-slate-800/30 rounded-lg p-4 opacity-50 cursor-not-allowed"
                    >
                      <div className="flex items-center gap-4">
                        {/* Profile Image - Grayed Out */}
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-700 border-2 border-slate-700 flex-shrink-0 grayscale">
                          <img
                            src={contestant.imageUrl}
                            alt={contestant.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-left">
                          <p className="text-slate-500 mb-1">{contestant.name}</p>
                          <p className="text-sm text-slate-600">
                            {contestant.age} • {contestant.occupation}
                          </p>
                          <p className="text-xs text-slate-700">{contestant.hometown}</p>
                        </div>

                        {/* Status Badge */}
                        <div className="px-3 py-1 rounded-full text-xs bg-slate-700 text-slate-500 flex-shrink-0">
                          {contestant.status === 'eliminated' && 'Eliminated'}
                          {contestant.status === 'jury' && `Jury (Wk ${contestant.eliminatedWeek})`}
                          {contestant.status === 'final3' && 'Final 3'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availableContestants.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">No available contestants</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
