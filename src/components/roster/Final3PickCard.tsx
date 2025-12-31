import { Crown, TrendingUp, TrendingDown, X } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Contestant } from "../../models/types";

interface Final3PickCardProps {
  pick: Contestant;
  index: number;
  onDraftReplacement: (index: number) => void;
}

export const Final3PickCard = ({
  pick,
  index,
  onDraftReplacement,
}: Final3PickCardProps) => {
  return (
    <div className="relative">
      <Card
        className={`p-4 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.4)] rounded-xl ${
          pick.isEliminated
            ? "bg-slate-900/40 border-slate-800/50 grayscale"
            : "bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600 hover:shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar
              className={`w-16 h-16 border-2 ${
                pick.isEliminated
                  ? "border-red-400/30"
                  : "border-[#BFFF0B]/30"
              }`}
            >
              <AvatarImage
                src={pick.image || ""}
                alt={pick.name}
                className={pick.isEliminated ? "grayscale" : ""}
              />
              <AvatarFallback>
                {pick.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {index === 0 && !pick.isEliminated && (
              <div className="absolute -top-1 -right-1 bg-[#BFFF0B] rounded-full p-1">
                <Crown className="w-3 h-3 text-slate-900" />
              </div>
            )}
            {pick.isEliminated && (
              <div className="absolute inset-0 flex items-center justify-center">
                <X className="w-8 h-8 text-red-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3
              className={`font-bold ${
                pick.isEliminated ? "text-slate-500" : "text-white"
              }`}
            >
              {pick.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {pick.isEliminated ? (
                <Badge
                  variant="destructive"
                  className="text-xs bg-red-900 text-red-200 font-semibold"
                >
                  Eliminated
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-xs border-slate-700 text-slate-300 font-semibold"
                >
                  Safe
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <span
                className={`text-xl font-bold ${
                  pick.isEliminated ? "text-slate-600" : "text-[#BFFF0B]"
                }`}
              >
                {pick.totalPoints}
              </span>
              {!pick.isEliminated &&
                ((pick.totalPoints || 0) > 10 ? (
                  <TrendingUp className="w-4 h-4 text-[#BFFF0B]" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                ))}
            </div>
            <p className="text-xs text-slate-500">points</p>
          </div>
        </div>
      </Card>

      {/* Draft Replacement Overlay */}
      {pick.isEliminated && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-xl">
          <div className="text-center space-y-2 px-4">
            <div>
              <h3 className="text-white font-bold text-sm">
                Player Eliminated
              </h3>
            </div>
            <Button
              onClick={() => onDraftReplacement(index)}
              className="bg-[#BFFF0B] hover:bg-[#a8e609] text-black font-bold h-9 text-sm"
            >
              Draft a Replacement
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
