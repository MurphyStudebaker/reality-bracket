import React from 'react';
import { LogIn, Users, Target, Calendar, Trophy } from 'lucide-react';
import logoImage from '../../assets/icon.png';
import logo3D from '../../assets/tribal_bracket_icon_3d.png';
import mockup from '../../assets/mockup.png';
import { CountdownTimer } from "../ui/countdown-timer"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"


interface LoggedOutScreenProps {
  onSignInClick: () => void;
}

const launchDate = new Date('2026-02-25');

const faqItems = [
  {
    question: "How do I create or join a league?",
    answer: "After creating an account, you can either create a new league and invite friends with a unique code, or join an existing league using a code shared by your league commissioner."
  },
  {
    question: "When does the draft happen?",
    answer: "League commissioners set the draft date before the season premiere. All league members join a live draft where you take turns selecting your Final 3 contestants."
  },
  {
    question: "How does scoring work?",
    answer: "You earn points based on your Final 3 picks and weekly elimination predictions. Points are awarded when your drafted contestants survive each episode, win challenges, and make it to the finale. Correct elimination predictions earn bonus points."
  },
  {
    question: "Can I change my picks during the season?",
    answer: "Your Final 3 picks are locked after the draft, but you make new elimination predictions each week before the episode airs. This keeps the competition exciting throughout the entire season."
  },
  {
    question: "Is Tribal Bracket really free?",
    answer: "Yes! Tribal Bracket is 100% free to use. There are no hidden fees, premium tiers, or pay-to-win features. Just create an account and start playing with your friends."
  },
  {
    question: "How many people can be in a league?",
    answer: "Each league can have up to 12 players, perfect for friend groups, families, or watch parties. The more players, the more competitive the draft becomes!"
  }
];

export default function LoggedOutScreen({ onSignInClick }: LoggedOutScreenProps) {
  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col justify-center items-center pt-8 pb-12">
        <div className="max-w-md rounded-full flex items-center justify-center" style={{ width: 'clamp(12rem, 18vw, 16rem)', height: 'clamp(12rem, 18vw, 16rem)' }}>
          <img 
            src={logo3D} 
            alt="Reality Bracket Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col gap-4 items-center justify-center text-center mt-4">
          <h1 className="text-5xl font-bold" style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)' }}>Tribal Bracket:</h1>
          <h2 className="text-5xl font-bold" style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', marginTop: '-0.5rem' }}>
            Outwit, Outplay, Out<span style={{ color: '#BFFF0B', fontStyle: 'italic' }}>draft</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-lg" style={{ fontSize: '1.25rem'}}>
            100% free app for playing Survivor Fantasy Leagues with your tribe.
          </p>
          <button
            onClick={onSignInClick}
            className="w-full max-w-md px-6 py-4 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 mt-2"
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

      {/* Features Section */}
      <section className="py-12 border-t border-slate-800">
        <h3 className="text-2xl font-bold text-center mb-10">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(191, 255, 11, 0.15)' }}>
              <Users className="w-7 h-7" style={{ color: '#BFFF0B' }} />
            </div>
            <h4 className="text-lg font-semibold mb-2">Play With Your Tribe</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Create or join a league with up to 12 friends. Compete throughout live Survivor seasons to see who has the best strategy.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(191, 255, 11, 0.15)' }}>
              <Target className="w-7 h-7" style={{ color: '#BFFF0B' }} />
            </div>
            <h4 className="text-lg font-semibold mb-2">Draft Your Final 3</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Before the season starts, draft the three contestants you think will make it to the end. Choose wisely - your picks are locked in!
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(191, 255, 11, 0.15)' }}>
              <Calendar className="w-7 h-7" style={{ color: '#BFFF0B' }} />
            </div>
            <h4 className="text-lg font-semibold mb-2">Predict Weekly Eliminations</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Each week, predict who will be voted out. Earn bonus points for correct predictions and climb the leaderboard all season long.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 border-t border-slate-800">
        <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-slate-800">
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="font-medium">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 border-t border-slate-800">
        <div className="flex flex-col items-center text-center gap-4">
          <Trophy className="w-10 h-10" style={{ color: '#BFFF0B' }} />
          <h3 className="text-2xl font-bold">Ready to Outwit Your Friends?</h3>
          <p className="text-slate-400 max-w-md">
            Join thousands of Survivor fans already competing in fantasy leagues. Create your free account and start drafting today.
          </p>
          <button
            onClick={onSignInClick}
            className="px-8 py-3 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 mt-2"
            style={{ 
              borderColor: '#BFFF0B',
              backgroundColor: 'rgba(191, 255, 11, 0.1)',
              color: '#BFFF0B'
            }}
          >
            <span className="font-semibold">Get Started Free</span>
          </button>
        </div>
      </section>

      <footer className="py-6 mt-auto flex items-center justify-center gap-4 text-sm text-slate-400 border-t border-slate-800">
        <a href="/privacy" className="hover:text-white transition-colors">
          Privacy Policy
        </a>
        <span className="text-slate-600">|</span>
        <a href="/terms" className="hover:text-white transition-colors">
          Terms of Service
        </a>
      </footer>
    </div>
  );
}

