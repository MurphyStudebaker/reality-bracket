import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import BaseModal from './BaseModal';

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

  const footer = (
    <div className="flex gap-3">
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
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Join League"
      sizeClassName="lg:w-full lg:max-w-md"
      bodyClassName="space-y-4"
      footer={footer}
    >
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
    </BaseModal>
  );
}
