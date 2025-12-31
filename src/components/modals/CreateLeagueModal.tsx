import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { availableSeasons } from '../../data/mockData';

interface CreateLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateLeagueModal({ isOpen, onClose }: CreateLeagueModalProps) {
  const [leagueName, setLeagueName] = useState('');
  const [selectedSeason, setSelectedSeason] = useState(availableSeasons[0].id);
  const [draftDate, setDraftDate] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    // Mock create logic
    console.log('Creating league:', { leagueName, selectedSeason, draftDate });
    setLeagueName('');
    setSelectedSeason(availableSeasons[0].id);
    setDraftDate('');
    onClose();
  };

  const isValid = leagueName.length >= 3 && draftDate;

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
          className="bg-slate-900 rounded-t-2xl lg:rounded-2xl border-t lg:border border-slate-800 w-full lg:w-full lg:max-w-md max-h-[90vh] lg:max-h-[600px] flex flex-col pointer-events-auto animate-slide-in-bottom lg:animate-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <h2 className="text-xl">Create League</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* League Name */}
            <div>
              <label className="block mb-2 text-sm text-slate-400">
                League Name
              </label>
              <input
                type="text"
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                placeholder="e.g. Survivor Superfans"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-teal-600 transition-colors"
                maxLength={30}
              />
            </div>

            {/* Season Selection */}
            <div>
              <label className="block mb-2 text-sm text-slate-400">
                Select Season
              </label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-teal-600 transition-colors"
              >
                {availableSeasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name} - {season.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Draft Date */}
            <div>
              <label className="block mb-2 text-sm text-slate-400">
                Draft Date
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={draftDate}
                  onChange={(e) => setDraftDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-teal-600 transition-colors"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-slate-800">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!isValid}
              className="flex-1 px-4 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: isValid ? '#BFFF0B' : '#334155',
                color: isValid ? '#0f172a' : '#64748b'
              }}
            >
              Create League
            </button>
          </div>
        </div>
      </div>
    </>
  );
}