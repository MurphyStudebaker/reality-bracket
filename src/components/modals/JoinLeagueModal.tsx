import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface JoinLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string;
  isJoining: boolean;
  error: string | null;
  onInviteCodeChange: (code: string) => void;
  onJoin: () => void;
  onClearError: () => void;
}

export default function JoinLeagueModal({
  isOpen,
  onClose,
  inviteCode,
  isJoining,
  error,
  onInviteCodeChange,
  onJoin,
  onClearError,
}: JoinLeagueModalProps) {
  // Clear error when modal closes
  useEffect(() => {
    if (!isOpen && error) {
      onClearError();
    }
  }, [isOpen, error, onClearError]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (!isJoining) {
      onClose();
    }
  };

  const isValid = inviteCode.length >= 6;

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
          className="bg-slate-900 rounded-t-2xl lg:rounded-2xl border-t lg:border border-slate-800 w-full lg:w-full lg:max-w-md pointer-events-auto animate-slide-in-bottom lg:animate-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <h2 className="text-xl">Join League</h2>
            <button
              onClick={handleClose}
              disabled={isJoining}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="bg-red-950/50 border-red-800">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div>
              <label className="block mb-2 text-sm text-slate-400">
                Enter Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => onInviteCodeChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="e.g. SURF47"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-teal-600 transition-colors text-white text-center tracking-widest text-lg"
                maxLength={10}
                disabled={isJoining}
              />
              <p className="text-xs text-slate-500 mt-2">
                Ask your league commissioner for the invite code
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-slate-800">
            <button
              onClick={handleClose}
              disabled={isJoining}
              className="flex-1 px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onJoin}
              disabled={!isValid || isJoining}
              className="flex-1 px-4 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              style={{ 
                backgroundColor: (isValid && !isJoining) ? '#BFFF0B' : '#334155',
                color: (isValid && !isJoining) ? '#0f172a' : '#64748b'
              }}
            >
              {isJoining ? 'Joining...' : 'Join League'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
