import { X } from 'lucide-react';
import { latestActivity } from '../../data/mockData';

interface LatestActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LatestActivityDrawer({ isOpen, onClose }: LatestActivityDrawerProps) {
  if (!isOpen) return null;

  const final3Activity = latestActivity.filter(item => item.type === 'final3');
  const bootActivity = latestActivity.filter(item => item.type === 'boot');

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
          className="bg-slate-900 border-slate-800 flex flex-col max-h-[85vh] lg:max-h-[600px] w-full lg:w-[480px] rounded-t-2xl lg:rounded-2xl border-t lg:border pointer-events-auto animate-slide-in-bottom lg:animate-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-slate-800">
            <h2 className="text-xl">Latest Activity</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            {/* Final 3 Eliminations */}
            {final3Activity.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm text-slate-400 mb-3">FINAL 3 ELIMINATIONS</h3>
                <div className="space-y-3">
                  {final3Activity.map((item, index) => (
                    <div
                      key={index}
                      className="bg-slate-800/50 rounded-lg p-4 border-2 border-red-900/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="mb-1">{item.username}</p>
                          <p className="text-sm text-slate-400">lost {item.contestantName}</p>
                        </div>
                        <span className="text-red-500 shrink-0 ml-2">
                          {item.points}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Week {item.week}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Boot Correct Predictions */}
            {bootActivity.length > 0 && (
              <div>
                <h3 className="text-sm text-slate-400 mb-3">NEXT BOOT WINNERS</h3>
                <div className="space-y-3">
                  {bootActivity.map((item, index) => (
                    <div
                      key={index}
                      className="bg-slate-800/50 rounded-lg p-4 border-2 border-emerald-900/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="mb-1">{item.username}</p>
                          <p className="text-sm text-slate-400">predicted {item.contestantName}</p>
                        </div>
                        <span className="shrink-0 ml-2" style={{ color: '#BFFF0B' }}>
                          +{item.points}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Week {item.week}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {latestActivity.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}