import { useState } from "react";
import { Home, Users, Trophy } from "lucide-react";
import HomeScreen from "./components/HomeScreen";
import RosterScreen from "./components/RosterScreen";
import LeagueScreen from "./components/LeagueScreen";

type Screen = "home" | "roster" | "league";

export default function App() {
  const [activeScreen, setActiveScreen] =
    useState<Screen>("home");
  const [selectedLeagueId, setSelectedLeagueId] =
    useState<number>(1);

  const handleLeagueClick = (leagueId: number) => {
    setSelectedLeagueId(leagueId);
    setActiveScreen("league");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 dark">
      {/* Header */}
      <header className="bg-black text-white p-4 sticky top-0 z-10 shadow-lg border-b border-neutral-800">
        <h1 className="text-left font-bold">
          Reality Bracket
        </h1>
      </header>

      {/* Screen Content */}
      <main className="max-w-md mx-auto">
        {activeScreen === "home" && (
          <HomeScreen onLeagueClick={handleLeagueClick} />
        )}
        {activeScreen === "roster" && <RosterScreen />}
        {activeScreen === "league" && (
          <LeagueScreen initialLeagueId={selectedLeagueId} />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-neutral-800 shadow-[0_-4px_16px_rgba(0,0,0,0.8)]">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => setActiveScreen("home")}
            className={`flex-1 flex flex-col items-center py-3 px-4 transition-colors ${
              activeScreen === "home"
                ? "text-[#BFFF0B]"
                : "text-neutral-500 hover:text-neutral-400"
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1 font-semibold">
              Home
            </span>
          </button>
          <button
            onClick={() => setActiveScreen("roster")}
            className={`flex-1 flex flex-col items-center py-3 px-4 transition-colors ${
              activeScreen === "roster"
                ? "text-[#BFFF0B]"
                : "text-neutral-500 hover:text-neutral-400"
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1 font-semibold">
              Rosters
            </span>
          </button>
          <button
            onClick={() => setActiveScreen("league")}
            className={`flex-1 flex flex-col items-center py-3 px-4 transition-colors ${
              activeScreen === "league"
                ? "text-[#BFFF0B]"
                : "text-neutral-500 hover:text-neutral-400"
            }`}
          >
            <Trophy className="w-6 h-6" />
            <span className="text-xs mt-1 font-semibold">
              Leagues
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}