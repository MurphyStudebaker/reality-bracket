import React, { useState, useEffect } from 'react';
import { Home, Users, Trophy, Bell, UserCircle, LogIn } from 'lucide-react';
import HomePage from './components/pages/HomePage';
import RosterPage from './components/pages/RosterPage';
import LeaguePage from './components/pages/LeaguePage';
import MagicLinkPage from './components/pages/MagicLinkPage';
import PasswordResetPage from './components/pages/PasswordResetPage';
import PrivacyPage from './components/pages/PrivacyPage';
import TermsPage from './components/pages/TermsPage';
import LatestActivityModal from './components/modals/LatestActivityModal';
import ProfileModal from './components/modals/ProfileModal';
import { useAuthViewModel } from './viewmodels/auth.viewmodel';
import logoImage from './assets/icon.png';

type ScreenType = 'home' | 'roster' | 'league';
type League = { 
  id: string; 
  name: string; 
  season: string; 
  seasonNumber?: number;
  seasonName?: string;
  memberCount: number; 
  inviteCode: string 
};

export default function App() {
  // Initialize auth at app level to restore session on page load
  const auth = useAuthViewModel();

  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [isLatestActivityModalOpen, setIsLatestActivityModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);

  // Check for special routes (magic link, password reset, legal)
  const getCurrentRoute = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const hashParams = hash ? new URLSearchParams(hash.substring(1)) : new URLSearchParams();

    if (path === '/privacy') {
      return 'privacy';
    }

    if (path === '/terms') {
      return 'terms';
    }

    // Check for password reset first (more specific)
    if (path === '/reset-password' || hashParams.get('type') === 'recovery') {
      return 'password-reset';
    }

    // Check for magic link authentication
    if (path === '/auth/callback' || hashParams.has('access_token')) {
      return 'magic-link';
    }

    return 'app';
  };

  const currentRoute = getCurrentRoute();

  const navItems = [
    { id: 'home' as ScreenType, label: 'Home', icon: Home },
    { id: 'roster' as ScreenType, label: 'Rosters', icon: Users },
    { id: 'league' as ScreenType, label: 'Leagues', icon: Trophy },
  ];

  // Keep user on home page when not authenticated
  useEffect(() => {
    if (!auth.isAuthenticated && currentScreen !== 'home') {
      setCurrentScreen('home');
    }
  }, [auth.isAuthenticated, currentScreen]);

  const handleNavigation = (screen: ScreenType) => {
    // Only allow navigation if authenticated
    if (auth.isAuthenticated) {
      setCurrentScreen(screen);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header - Only show for main app */}
      {currentRoute === 'app' && (
        <header className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
          {/* Title - Far Left on Desktop */}
          <div className="flex items-center gap-2 ">
            <div className="w-12 h-12">
            <img
              src={logoImage}
              alt="Reality Bracket Logo"
              className="w-12 h-12 object-contain"
            />
            </div>
            <h1 className="hidden sm:block text-xl lg:text-2xl whitespace-nowrap" style={{ color: '#BFFF0B' }}>Reality Bracket</h1>
          </div>

          {/* Desktop Navigation - Center */}
          {auth.isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                    style={isActive ? { color: '#BFFF0B' } : {}}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Side Buttons */}
          <div className="flex items-center gap-2">
            {/* <button
              onClick={() => setIsLatestActivityModalOpen(true)}
              className="p-2 rounded-lg border-2 transition-all hover:bg-slate-800"
              style={{
                borderColor: '#BFFF0B',
                color: '#BFFF0B'
              }}
              aria-label="View latest activity"
            >
              <Bell className="w-5 h-5" />
            </button> */}

            {auth.isAuthenticated ? (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="p-2 rounded-lg border-2 border-slate-700 transition-all hover:bg-slate-800 text-slate-400 hover:text-slate-300"
                aria-label="Account settings"
              >
                <UserCircle className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="px-4 py-2 rounded-lg border-2 transition-all hover:bg-slate-800 flex items-center gap-2"
                style={{
                  borderColor: '#BFFF0B',
                  color: '#BFFF0B'
                }}
                aria-label="Sign in"
              >
                Sign In
                {/* <LogIn className="w-5 h-5" />
                <span className="hidden sm:inline">Sign In</span> */}
              </button>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden pb-16 md:pb-20 lg:pb-0">
        <div className="flex-1 overflow-y-auto">
          {currentRoute === 'password-reset' && (
            <PasswordResetPage />
          )}
          {currentRoute === 'magic-link' && (
            <MagicLinkPage />
          )}
          {currentRoute === 'privacy' && (
            <PrivacyPage />
          )}
          {currentRoute === 'terms' && (
            <TermsPage />
          )}
          {currentRoute === 'app' && (
            <>
              {currentScreen === 'home' && (
                <HomePage
                  isAuthenticated={auth.isAuthenticated}
                  onLeagueClick={(league) => {
                    setSelectedLeague(league);
                    setCurrentScreen('league');
                  }}
                  onSignInClick={() => setIsProfileModalOpen(true)}
                />
              )}
              {auth.isAuthenticated && currentScreen === 'roster' && (
                <RosterPage
                  selectedLeague={selectedLeague}
                  onLeagueChange={setSelectedLeague}
                />
              )}
              {auth.isAuthenticated && currentScreen === 'league' && (
                <LeaguePage
                  selectedLeague={selectedLeague}
                  onLeagueChange={setSelectedLeague}
                  onNavigateToRoster={() => setCurrentScreen('roster')}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Bottom Navigation Tabs - Mobile/Tablet Only */}
      {currentRoute === 'app' && auth.isAuthenticated && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm z-30">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className="flex-1 flex flex-col items-center gap-1 py-3 md:py-4 transition-all"
                style={{
                  color: isActive ? '#BFFF0B' : '#94a3b8'
                }}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Latest Activity Drawer - Only show for main app */}
      {currentRoute === 'app' && (
        <LatestActivityModal
          isOpen={isLatestActivityModalOpen}
          onClose={() => setIsLatestActivityModalOpen(false)}
        />
      )}

      {/* Profile Modal - Only show for main app */}
      {currentRoute === 'app' && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </div>
  );
}