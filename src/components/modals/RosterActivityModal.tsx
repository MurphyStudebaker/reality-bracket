import { X } from 'lucide-react';
import RosterActivityContent from '../roster/RosterActivityContent';
import type { RosterSlot } from '../../models';

interface RosterActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  roster: RosterSlot[];
  seasonId: string | null;
  userId: string | null;
  leagueId: string | null;
}

export default function RosterActivityModal({
  isOpen,
  onClose,
  roster,
  seasonId,
  userId,
  leagueId,
}: RosterActivityModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />

      {/* Mobile: Bottom Drawer, Desktop: Center Panel */}
      <div className="fixed inset-x-0 bottom-0 lg:inset-0 lg:flex lg:items-center lg:justify-center z-50 pointer-events-none">
        <div
          className="bg-slate-900 rounded-t-2xl lg:rounded-2xl border-t lg:border border-slate-800 w-full lg:w-[600px] max-h-[90vh] lg:max-h-[700px] flex flex-col pointer-events-auto animate-slide-in-bottom lg:animate-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <h2 className="text-xl font-semibold text-white">Roster Activity</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <RosterActivityContent
              roster={roster}
              seasonId={seasonId}
              userId={userId}
              leagueId={leagueId}
            />
          </div>
        </div>
      </div>
    </>
  );
}

