import React from 'react';
import { LogIn, Trophy } from 'lucide-react';
import logoImage from '../../assets/icon.png';
import logo3D from '../../assets/tribal_bracket_icon_3d.png';
import mockup from '../../assets/mockup.png';
import featureLeague from '../../assets/feature-league.png';
import featureDraft from '../../assets/feature-draft.png';
import featurePredictions from '../../assets/feature-predictions.png';
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
    answer: "League commissioners can begin the draft at any point before or during an upcoming season. All league members take turns selecting your Final 3 contestants - there is no time limit to complete the draft."
  },
  {
    question: "How does scoring work?",
    answer: "You earn points based on your Final 3 picks and weekly elimination predictions. Players win 5 points for earning tribal immunity, 10 points for finding an immunity idol, 15 points for earning individual immunity, and 15 points for a correctly predicted elimination. "
  },
  {
    question: "Can I change my picks during the season?",
    answer: "Your Final 3 picks are locked after the draft, but you make new elimination predictions each week before the episode airs. This keeps the competition exciting throughout the entire season. If one of your Final 3 is medevaced, you can select a replacement player from the remaining pool of active contestants."
  },
  {
    question: "Can multiple people draft the same contestant?",
    answer: "Only one person in the league can have a contestant in the same spot but multiple people can draft the same player in their final 3 at different spots. For example, if I draft Parvati as Sole Survivor, you can only draft her for Runner Up or Third Place. There is no restriction on multiple people in a league selecting the same contestant to be eliminated each week."
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
          {/* <h1 style={{ fontSize: 'clamp(1.5rem, 6vw, 3.5rem)', fontWeight: 400, color: '#94a3b8' }}>Tribal Bracket</h1> */}
          <h2 style={{ fontSize: 'clamp(2.5rem, 10vw, 6rem)', fontWeight: 700, marginTop: '-2rem', lineHeight: '1' }}>
            Outwit, Outplay, Out<span style={{ color: '#BFFF0B', fontStyle: 'italic' }}>draft</span>
          </h2>
          <div className="h-4"></div>
          <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '32rem' }}>
            Tribal Bracket is a 100% free app for playing Survivor Fantasy Leagues with your tribe.
          </p>
          {/* <button
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
          </button> */}
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '3rem 0', borderTop: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '2.5rem' }}>How It Works</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {/* Feature 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.5rem', borderRadius: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid #1e293b' }}>
            <div style={{ width: '100%', marginBottom: '1rem', borderRadius: '0.5rem', overflow: 'hidden' }}>
              <img 
                src={featureLeague} 
                alt="League leaderboard showing players and scores" 
                style={{ width: '100%', height: '10rem', objectFit: 'cover' }}
              />
            </div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Play With Your Tribe</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Create or join a league with up to 12 friends. Compete throughout live Survivor seasons to see who has the best strategy.
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.5rem', borderRadius: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid #1e293b' }}>
            <div style={{ width: '100%', marginBottom: '1rem', borderRadius: '0.5rem', overflow: 'hidden' }}>
              <img 
                src={featureDraft} 
                alt="Draft screen showing Final 3 contestant selection" 
                style={{ width: '100%', height: '10rem', objectFit: 'cover' }}
              />
            </div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Draft Your Final 3</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Before the season starts, draft the three contestants you think will make it to the end. Earn extra points when they win immunity and find idols. Choose wisely - your picks are locked in!
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.5rem', borderRadius: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid #1e293b' }}>
            <div style={{ width: '100%', marginBottom: '1rem', borderRadius: '0.5rem', overflow: 'hidden' }}>
              <img 
                src={featurePredictions} 
                alt="Weekly elimination prediction screen" 
                style={{ width: '100%', height: '10rem', objectFit: 'cover' }}
              />
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
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Survivors Ready?</h3>
          <p style={{ color: '#94a3b8', maxWidth: '28rem' }}>
            Join hundreds of Survivor fans already competing in fantasy leagues. Create your free account and start drafting today.
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
            Assemble Your Tribe
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

