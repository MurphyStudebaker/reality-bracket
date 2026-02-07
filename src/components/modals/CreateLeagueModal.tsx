import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import BaseModal from './BaseModal';
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
  const formatSeasonLabel = (season: Season) => {
    const title = season.title.trim();
    if (/^season\s+\d+/i.test(title)) {
      return title;
    }
    return `Season ${season.id}: ${title}`;
  };

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

  const footer = (
    <div className="flex gap-3">
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
          color: (isValid && !isCreating) ? '#0f172a' : '#64748b',
        }}
      >
        {isCreating ? 'Creating...' : 'Create League'}
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create League"
      sizeClassName="lg:w-full lg:max-w-md"
      bodyClassName="space-y-4"
      footer={footer}
    >
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="bg-red-950/50 border-red-800">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>
      )}

      {/* League Name */}
      <div>
        <label className="block mb-2 text-sm text-slate-400">League Name</label>
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
        <label className="block mb-2 text-sm text-slate-400">Select Season</label>
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
                {formatSeasonLabel(season)} {season.status === 'live' && '(Active)'}
              </option>
            ))}
          </select>
        )}
      </div>
    </BaseModal>
  );
}
