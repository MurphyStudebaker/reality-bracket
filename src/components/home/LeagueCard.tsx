import { ChevronRight, Users as UsersIcon, Trophy } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { League } from "../../models/types";

interface LeagueCardProps {
  league: League;
  onClick: (leagueId: number) => void;
}

export const LeagueCard = ({ league, onClick }: LeagueCardProps) => {
  return (
    <Card
      onClick={() => onClick(league.id)}
      className="p-4 bg-[#1a1a1a] border-neutral-800 hover:bg-[#222] hover:border-neutral-700 transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.6)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.8)] rounded-xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-bold">{league.name}</h3>
            {league.rank === 1 && (
              <Trophy className="w-4 h-4 text-[#BFFF0B]" />
            )}
          </div>
          <p className="text-sm text-neutral-400">{league.season}</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-sm text-neutral-400">
              <UsersIcon className="w-4 h-4" />
              <span>{league.members}</span>
            </div>
            <Badge
              variant="outline"
              className="text-xs border-neutral-600 text-neutral-300 rounded-full font-semibold"
            >
              Rank #{league.rank}
            </Badge>
            <span className="text-sm text-[#BFFF0B] font-semibold">
              {league.points} pts
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-neutral-600" />
      </div>
    </Card>
  );
};
