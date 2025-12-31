import { Card } from "../ui/card";

interface LeagueStatsProps {
  highestScore: number;
  averageScore: number;
}

export const LeagueStats = ({
  highestScore,
  averageScore,
}: LeagueStatsProps) => {
  return (
    <Card className="p-4 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <h3 className="text-white mb-3">League Stats</h3>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-2xl text-lime-400">{highestScore}</p>
          <p className="text-xs text-slate-400">Highest Score</p>
        </div>
        <div>
          <p className="text-2xl text-lime-400">{averageScore}</p>
          <p className="text-xs text-slate-400">Average Score</p>
        </div>
      </div>
    </Card>
  );
};
