import { LogIn, UserPlus, Trophy } from 'lucide-react';

interface LoggedOutScreenProps {
  onSignInClick: () => void;
}

export default function LoggedOutScreen({ onSignInClick }: LoggedOutScreenProps) {
  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-8 w-full max-w-md">
        {/* Icon/Illustration */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(191, 255, 11, 0.1)' }}>
            <LogIn className="w-12 h-12" style={{ color: '#BFFF0B' }} />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h2 className="text-3xl lg:text-4xl font-bold">Welcome to Reality Bracket</h2>
          <p className="text-lg text-slate-400">
            Create an account or sign in to start playing
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 text-slate-300">
          <p>
            Join leagues, draft your picks, and compete with friends to see who can predict the outcomes of your favorite reality shows.
          </p>
        </div>

        {/* Call to Action */}
        <div className="pt-4">
          <button
            onClick={onSignInClick}
            className="w-full px-6 py-4 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            style={{ 
              borderColor: '#BFFF0B',
              backgroundColor: 'rgba(191, 255, 11, 0.1)',
              color: '#BFFF0B'
            }}
          >
            <LogIn className="w-5 h-5" />
            <span className="text-lg font-semibold">Sign In or Create Account</span>
          </button>
        </div>

        {/* Features */}
        <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-slate-800">
                <UserPlus className="w-5 h-5" style={{ color: '#BFFF0B' }} />
              </div>
              <h3 className="font-semibold">Join Leagues</h3>
            </div>
            <p className="text-sm text-slate-400">
              Enter invite codes to join existing leagues with friends
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-slate-800">
                <Trophy className="w-5 h-5" style={{ color: '#BFFF0B' }} />
              </div>
              <h3 className="font-semibold">Track Points</h3>
            </div>
            <p className="text-sm text-slate-400">
              Watch your points accumulate as contestants are eliminated
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

