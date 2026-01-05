import { useState } from 'react';
import { Home, Users, Trophy, Bell, UserCircle, LogIn } from 'lucide-react';
import HomePage from './components/pages/HomePage';
import RosterPage from './components/pages/RosterPage';
import LeaguePage from './components/pages/LeaguePage';
import LatestActivityDrawer from './components/drawers/LatestActivityDrawer';
import ProfileDrawer from './components/drawers/ProfileDrawer';
import { useAuthViewModel } from './viewmodels/auth.viewmodel';

type ScreenType = 'home' | 'roster' | 'league';
type League = { id: string; name: string; season: string; memberCount: number; inviteCode: string };

export default function App() {
  // Initialize auth at app level to restore session on page load
  const auth = useAuthViewModel();
  
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);

  const navItems = [
    { id: 'home' as ScreenType, label: 'Home', icon: Home },
    { id: 'roster' as ScreenType, label: 'Rosters', icon: Users },
    { id: 'league' as ScreenType, label: 'Leagues', icon: Trophy },
  ];

  const handleNavigation = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
        {/* Title - Far Left on Desktop */}
        <h1 className="text-xl lg:text-2xl whitespace-nowrap" style={{ color: '#BFFF0B' }}>Reality Bracket</h1>
        
        {/* Desktop Navigation - Center */}
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
        
        {/* Right Side Buttons */}
        <div className="flex items-center gap-2">
          {/* <button
            onClick={() => setIsActivityDrawerOpen(true)}
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
              onClick={() => setIsProfileDrawerOpen(true)}
              className="p-2 rounded-lg border-2 border-slate-700 transition-all hover:bg-slate-800 text-slate-400 hover:text-slate-300"
              aria-label="Account settings"
            >
              <UserCircle className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setIsProfileDrawerOpen(true)}
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden pb-16 md:pb-20 lg:pb-0">
        <div className="flex-1 overflow-y-auto">
          {currentScreen === 'home' && (
            <HomePage 
              isAuthenticated={auth.isAuthenticated}
              onLeagueClick={(league) => {
                setSelectedLeague(league);
                setCurrentScreen('league');
              }}
              onSignInClick={() => setIsProfileDrawerOpen(true)}
            />
          )}
          {currentScreen === 'roster' && <RosterPage />}
          {currentScreen === 'league' && <LeaguePage initialLeague={selectedLeague} />}
        </div>
      </main>

      {/* Bottom Navigation Tabs - Mobile/Tablet Only */}
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

      {/* Latest Activity Drawer */}
      <LatestActivityDrawer 
        isOpen={isActivityDrawerOpen}
        onClose={() => setIsActivityDrawerOpen(false)}
      />

      {/* Profile Drawer */}
      <ProfileDrawer 
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
      />
    </div>
  );
}