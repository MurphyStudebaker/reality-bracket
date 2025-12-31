import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Standing } from "../../models/types";

interface StandingCardProps {
  standing: Standing;
}

export const StandingCard = ({ standing }: StandingCardProps) => {
  const rankChange = standing.previousRank - standing.rank;

  return (
    <Card
      className={`p-4 ${
        standing.isCurrentUser
          ? "bg-slate-800/80 border-lime-400/40 border-2 shadow-[0_2px_12px_rgba(163,230,53,0.15)] rounded-xl"
          : "bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.4)] rounded-xl"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Rank */}
        <div className="w-8 text-center">
          <span
            className={`${standing.rank <= 3 ? "text-lime-400" : "text-slate-400"}`}
          >
            {standing.rank}
          </span>
        </div>

        {/* Rank Change Indicator */}
        <div className="w-5">
          {rankChange > 0 ? (
            <TrendingUp className="w-4 h-4 text-lime-400" />
          ) : rankChange < 0 ? (
            <TrendingDown className="w-4 h-4 text-red-400" />
          ) : (
            <div className="w-4 h-0.5 bg-slate-700" />
          )}
        </div>

        {/* Avatar and Name */}
        <Avatar className="w-10 h-10">
          <AvatarImage src={standing.avatar} alt={standing.name} />
          <AvatarFallback>{standing.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-white">{standing.name}</p>
          <p className="text-xs text-slate-500">
            +{standing.weeklyPoints} this week
          </p>
        </div>

        {/* Points */}
        <div className="text-right">
          <p className="text-lime-400">{standing.points}</p>
          <p className="text-xs text-slate-500">pts</p>
        </div>
      </div>
    </Card>
  );
};
