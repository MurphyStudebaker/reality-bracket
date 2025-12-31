import { ChevronDown } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "./ui/select";
import LatestActivityDrawer from "./LatestActivityDrawer";
import { useLeagueViewModel } from "../viewmodels/useLeagueViewModel";
import { PodiumDisplay } from "./league/PodiumDisplay";
import { StandingCard } from "./league/StandingCard";
import { LeagueStats } from "./league/LeagueStats";

interface LeagueScreenProps {
  initialLeagueId?: number;
}

export default function LeagueScreen({
  initialLeagueId = 1,
}: LeagueScreenProps) {
  const viewModel = useLeagueViewModel(initialLeagueId);

  return (
    <div className="p-4 space-y-6">
      {/* League Header */}
      <div className="space-y-2">
        <Select
          value={viewModel.selectedLeague}
          onValueChange={viewModel.handleLeagueChange}
        >
          <SelectTrigger className="w-full bg-transparent border-none text-white p-0 h-auto hover:bg-transparent [&>svg]:hidden">
            <div className="flex items-center gap-2">
              <h1 className="text-white text-3xl">
                {viewModel.currentLeague?.name}
              </h1>
              <ChevronDown className="w-6 h-6 text-slate-400" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {viewModel.leagues.map((league) => (
              <SelectItem
                key={league.id}
                value={league.id.toString()}
                className="text-white focus:bg-slate-700 focus:text-white"
              >
                <div className="flex items-center justify-between w-full gap-3">
                  <span>{league.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-lime-400 text-slate-900 text-xs">
                      {league.season}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      Week {league.weekNumber}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-400">
            {viewModel.currentLeague?.season}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">
            Week {viewModel.currentLeague?.weekNumber}
          </span>
        </div>
      </div>

      {/* Podium - Top 3 */}
      <PodiumDisplay topThree={viewModel.topThreeStandings} />

      {/* Latest Activity Button */}
      <LatestActivityDrawer
        isOpen={viewModel.isActivityOpen}
        onOpenChange={viewModel.setIsActivityOpen}
        weeklyActivity={viewModel.weeklyActivity}
        leagueUsers={viewModel.leagueUsers}
        weekNumber={viewModel.currentLeague?.weekNumber}
      />

      {/* Full Standings */}
      <section>
        <h2 className="text-white mb-3">Full Standings</h2>
        <div className="space-y-2">
          {viewModel.standings.map((standing) => (
            <StandingCard key={standing.id} standing={standing} />
          ))}
        </div>
      </section>

      {/* League Stats */}
      <LeagueStats
        highestScore={viewModel.leagueStats.highestScore}
        averageScore={viewModel.leagueStats.averageScore}
      />
    </div>
  );
}
