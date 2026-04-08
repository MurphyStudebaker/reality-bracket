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
    <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '1rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingTop: '2rem', paddingBottom: '3rem' }}>
        <div style={{ width: 'clamp(12rem, 18vw, 16rem)', height: 'clamp(12rem, 18vw, 16rem)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src={logo3D} 
            alt="Reality Bracket Logo" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginTop: '1rem' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: 700 }}>Tribal Bracket:</h1>
          <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: 700, marginTop: '-0.5rem' }}>
            Outwit, Outplay, Out<span style={{ color: '#BFFF0B', fontStyle: 'italic' }}>draft</span>
          </h2>
          <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '32rem' }}>
            100% free app for playing Survivor Fantasy Leagues with your tribe.
          </p>
          <button
            onClick={onSignInClick}
            style={{ 
              width: '100%',
              maxWidth: '28rem',
              padding: '1rem 1.5rem',
              borderRadius: '0.75rem',
              border: '2px solid #BFFF0B',
              backgroundColor: 'rgba(191, 255, 11, 0.1)',
              color: '#BFFF0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              marginTop: '0.5rem',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
          >
            <LogIn style={{ width: '1.25rem', height: '1.25rem' }} />
            <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>Create Account to Play</span>
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '3rem 0', borderTop: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '2.5rem' }}>How It Works</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {/* Feature 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.5rem', borderRadius: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid #1e293b' }}>
            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', backgroundColor: 'rgba(191, 255, 11, 0.15)' }}>
              <Users style={{ width: '1.75rem', height: '1.75rem', color: '#BFFF0B' }} />
            </div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Play With Your Tribe</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Create or join a league with up to 12 friends. Compete throughout live Survivor seasons to see who has the best strategy.
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.5rem', borderRadius: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid #1e293b' }}>
            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', backgroundColor: 'rgba(191, 255, 11, 0.15)' }}>
              <Target style={{ width: '1.75rem', height: '1.75rem', color: '#BFFF0B' }} />
            </div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Draft Your Final 3</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Before the season starts, draft the three contestants you think will make it to the end. Choose wisely - your picks are locked in!
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.5rem', borderRadius: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid #1e293b' }}>
            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', backgroundColor: 'rgba(191, 255, 11, 0.15)' }}>
              <Calendar style={{ width: '1.75rem', height: '1.75rem', color: '#BFFF0B' }} />
            </div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Predict Weekly Eliminations</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Each week, predict who will be voted out. Earn bonus points for correct predictions and climb the leaderboard all season long.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '3rem 0', borderTop: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>Frequently Asked Questions</h3>
        <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
          <Accordion type="single" collapsible style={{ width: '100%' }}>
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} style={{ borderColor: '#1e293b' }}>
                <AccordionTrigger style={{ textAlign: 'left', padding: '1.25rem 0' }}>
                  <span style={{ fontWeight: 500 }}>{item.question}</span>
                </AccordionTrigger>
                <AccordionContent style={{ color: '#94a3b8', lineHeight: 1.6 }}>
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '3rem 0', borderTop: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
          <Trophy style={{ width: '2.5rem', height: '2.5rem', color: '#BFFF0B' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Ready to Outwit Your Friends?</h3>
          <p style={{ color: '#94a3b8', maxWidth: '28rem' }}>
            Join thousands of Survivor fans already competing in fantasy leagues. Create your free account and start drafting today.
          </p>
          <button
            onClick={onSignInClick}
            style={{ 
              padding: '0.75rem 2rem',
              borderRadius: '0.75rem',
              border: '2px solid #BFFF0B',
              backgroundColor: 'rgba(191, 255, 11, 0.1)',
              color: '#BFFF0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              marginTop: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Get Started Free
          </button>
        </div>
      </section>

      <footer style={{ padding: '1.5rem 0', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontSize: '0.875rem', color: '#94a3b8', borderTop: '1px solid #1e293b' }}>
        <a href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>
          Privacy Policy
        </a>
        <span style={{ color: '#475569' }}>|</span>
        <a href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>
          Terms of Service
        </a>
      </footer>
    </div>
  );
}

