import { LogIn, UserPlus, Trophy } from 'lucide-react';
import logoImage from '../../assets/icon.png';

interface LoggedOutScreenProps {
  onSignInClick: () => void;
}

export default function LoggedOutScreen({ onSignInClick }: LoggedOutScreenProps) {
  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 flex items-center justify-center min-h-[60vh]">
      <div className="text-center w-full max-w-md">
      <div className="h-6"></div>
        {/* Icon/Illustration */}
        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(191, 255, 11, 0.1)' }}>
          <img 
            src={logoImage} 
            alt="Reality Bracket Logo" 
            className="w-full h-full object-contain"
          />
          </div>
        </div>
        <div className="h-6"></div>

        {/* Heading */}
        <div className="space-y-6 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold">The Tribe Has Spoken</h2>
          <p className="text-lg text-slate-400">
            Welcome to Tribal Bracket, an app for Survivor Fantasy Leagues. Fan-built and 100% free!
          </p>
        </div>


        {/* Call to Action */}
        <div className="h-6"></div>
        <div>
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
            <span className="text-lg font-semibold">Sign In or Create Account to Play</span>
          </button>
        </div>
      </div>
    </div>
  );
}

