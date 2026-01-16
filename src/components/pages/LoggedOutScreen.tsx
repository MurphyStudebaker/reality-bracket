import { LogIn, UserPlus, Trophy } from 'lucide-react';
import logoImage from '../../assets/icon.png';
import logo3D from '../../assets/tribal_bracket_icon_3d.png';
import mockup from '../../assets/mockup.png';
import { CountdownTimer } from "../ui/countdown-timer"


interface LoggedOutScreenProps {
  onSignInClick: () => void;
}

const launchDate = new Date('2026-02-25');

export default function LoggedOutScreen({ onSignInClick }: LoggedOutScreenProps) {
  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center justify-center">
      <section className="flex flex-col justify-center items-center">
      <div className="max-w-md rounded-full flex items-center justify-center" style={{ width: 'clamp(15rem, 20vw, 20rem)', height: 'clamp(15rem, 20vw, 20rem)' }}>
          <img 
            src={logo3D} 
            alt="Reality Bracket Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col gap-4 items-center justify-center text-center">
        <h2 className="text-6xl font-bold" style={{ fontSize: 'clamp(3rem, 7vw, 4rem)' }}>Outwit, Outplay, Out<span style={{ color: '#BFFF0B', fontStyle: 'italic'   }}>draft</span></h2>
          <p className="text-lg text-slate-400" style={{ fontSize: '1.25rem'}}>
            100% free app for playing Survivor Fantasy Leagues with your tribe.
          </p>
          <button
            onClick={onSignInClick}
            className="w-full max-w-md px-6 py-4 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            style={{ 
              borderColor: '#BFFF0B',
              backgroundColor: 'rgba(191, 255, 11, 0.1)',
              color: '#BFFF0B'
            }}
          >
            <LogIn className="w-5 h-5" />
            <span className="text-lg font-semibold">Create Account to Play</span>
          </button>
        </div>
      </section>
{/* 
      <section>
        <div className="container mx-auto px-4 text-center max-w-md">
          <img src={mockup} alt="Mockup" className="w-full h-full object-contain" />
        </div>
      </section>


        <section id="countdown" className="py-20 border-y border-border bg-card/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-8">Countdown to Survivor 50</h2>
          <CountdownTimer targetDate={launchDate} />
        </div>
      </section> */}
</div>
    </div>
  );
}

