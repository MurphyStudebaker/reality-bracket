import { latestActivity } from '../../data/mockData';
import BaseModal from './BaseModal';

interface LatestActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LatestActivityModal({ isOpen, onClose }: LatestActivityModalProps) {
  if (!isOpen) return null;

  const final3Activity = latestActivity.filter(item => item.type === 'final3');
  const bootActivity = latestActivity.filter(item => item.type === 'boot');

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Latest Activity"
      sizeClassName="lg:w-[480px]"
      bodyClassName="p-4 lg:p-6"
    >
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
    </BaseModal>
  );
}