import { X, Check } from 'lucide-react';
import { League } from '../../data/mockData';

interface LeagueSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  leagues: League[];
  selectedLeague: League;
  onSelectLeague: (league: League) => void;
}

export default function LeagueSelector({
  isOpen,
  onClose,
  leagues,
  selectedLeague,
  onSelectLeague,
}: LeagueSelectorProps) {
  if (!isOpen) return null;

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
          className="bg-slate-900 border-slate-800 flex flex-col max-h-[70vh] lg:max-h-[500px] w-full lg:w-[400px] rounded-t-2xl lg:rounded-2xl border-t lg:border pointer-events-auto animate-slide-in-bottom lg:animate-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-slate-800">
            <h2 className="text-lg">Select League</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* League List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {leagues.map((league) => {
                const isSelected = league.id === selectedLeague.id;
                return (
                  <button
                    key={league.id}
                    onClick={() => onSelectLeague(league)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600'
                        : 'bg-slate-800/50 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex-1 text-left">
                      <p className="mb-1">{league.name}</p>
                      <p className="text-sm text-slate-400">{league.memberCount} members</p>
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5" style={{ color: '#BFFF0B' }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}