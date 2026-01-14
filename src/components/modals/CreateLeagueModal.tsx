import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import type { Season } from '../../models/types';
import { getRandomLeagueNamePun } from '../../models/constants';

interface CreateLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  seasons: Season[];
  isLoadingSeasons: boolean;
  leagueName: string;
  selectedSeason: number | null;
  isCreating: boolean;
  error: string | null;
  onLeagueNameChange: (name: string) => void;
  onSeasonSelect: (seasonId: number) => void;
  onCreate: () => void;
  onClearError: () => void;
}

export default function CreateLeagueModal({
  isOpen,
  onClose,
  seasons,
  isLoadingSeasons,
  leagueName,
  selectedSeason,
  isCreating,
  error,
  onLeagueNameChange,
  onSeasonSelect,
  onCreate,
  onClearError,
}: CreateLeagueModalProps) {
  const [placeholderText, setPlaceholderText] = useState(getRandomLeagueNamePun());

  // Generate new random placeholder when modal opens
  useEffect(() => {
    if (isOpen) {
      setPlaceholderText(getRandomLeagueNamePun());
    }
  }, [isOpen]);

  // Clear error when modal closes
  useEffect(() => {
    if (!isOpen && error) {
      onClearError();
    }
  }, [isOpen, error, onClearError]);


  if (!isOpen) return null;


  const handleClose = () => {
    if (!isCreating) {
      onClose();
    }
  };

  const isValid = leagueName.length >= 3 && selectedSeason !== null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50"
        onClick={handleClose}
      />

      {/* Mobile: Bottom Drawer, Desktop: Center Panel */}
      <div className="fixed inset-x-0 bottom-0 lg:inset-0 lg:flex lg:items-center lg:justify-center z-50 pointer-events-none">
        <div
          className="bg-slate-900 rounded-t-2xl lg:rounded-2xl border-t lg:border border-slate-800 w-full lg:w-full lg:max-w-md max-h-[90vh] lg:max-h-[600px] flex flex-col pointer-events-auto animate-slide-in-bottom lg:animate-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <h2 className="text-xl">Create League</h2>
            <button
              onClick={handleClose}
              disabled={isCreating}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="bg-red-950/50 border-red-800">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* League Name */}
            <div>
              <label className="block mb-2 text-sm text-slate-400">
                League Name
              </label>
              <input
                type="text"
                value={leagueName}
                onChange={(e) => onLeagueNameChange(e.target.value)}
                placeholder={`e.g., ${placeholderText}`}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-teal-600 transition-colors text-white"
                maxLength={50}
                disabled={isCreating}
              />
            </div>

            {/* Season Selection */}
            <div>
              <label className="block mb-2 text-sm text-slate-400">
                Select Season
              </label>
              {isLoadingSeasons ? (
                <div className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-400">
                  Loading seasons...
                </div>
              ) : !seasons || seasons.length === 0 ? (
                <div className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-400">
                  No seasons available
                </div>
              ) : (
                <select
                  value={selectedSeason?.toString() || ''}
                  onChange={(e) => onSeasonSelect(parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-teal-600 transition-colors text-white"
                  disabled={isCreating}
                >
                  <option value="">Choose a season</option>
                  {seasons.map((season) => (
                    <option key={season.id} value={season.id}>
                      {season.title} {season.status === 'live' && '(Active)'}
                    </option>
                  ))}
                </select>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-slate-800">
            <button
              onClick={handleClose}
              disabled={isCreating}
              className="flex-1 px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              disabled={!isValid || isCreating}
              className="flex-1 px-4 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              style={{ 
                backgroundColor: (isValid && !isCreating) ? '#BFFF0B' : '#334155',
                color: (isValid && !isCreating) ? '#0f172a' : '#64748b'
              }}
            >
              {isCreating ? 'Creating...' : 'Create League'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
