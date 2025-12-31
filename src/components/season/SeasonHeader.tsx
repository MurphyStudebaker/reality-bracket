import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Season } from "../../models/types";

interface SeasonHeaderProps {
  season: Season;
  remainingCount: number;
  eliminatedCount: number;
  onBack: () => void;
}

export const SeasonHeader = ({
  season,
  remainingCount,
  eliminatedCount,
  onBack,
}: SeasonHeaderProps) => {
  return (
    <div className="sticky top-0 z-10 bg-gradient-to-b from-slate-900 via-slate-900 to-transparent pb-4 pt-4 px-4">
      <Button
        onClick={onBack}
        variant="ghost"
        className="text-white hover:bg-slate-800 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="flex items-start gap-4">
        <img
          src={season.image}
          alt={season.title}
          className="w-24 h-24 object-cover rounded-lg"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-white">{season.title}</h1>
            {season.status === "live" && (
              <Badge className="bg-lime-400 text-slate-900 text-xs">
                LIVE
              </Badge>
            )}
          </div>
          <p className="text-slate-400 text-sm">{season.subtitle}</p>
          <div className="flex gap-4 mt-3 text-sm">
            <div>
              <span className="text-lime-400">{remainingCount}</span>
              <span className="text-slate-400"> remaining</span>
            </div>
            <div>
              <span className="text-red-400">{eliminatedCount}</span>
              <span className="text-slate-400"> eliminated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
