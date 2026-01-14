import { useMemo } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Season } from "../../models/types";
import { getRandomLeagueNamePun } from "../../models/constants";

interface CreateLeagueFormProps {
  leagueName: string;
  selectedSeason: number | null;
  seasons: Season[];
  onLeagueNameChange: (name: string) => void;
  onSeasonSelect: (seasonId: number) => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

export const CreateLeagueForm = ({
  leagueName,
  selectedSeason,
  seasons,
  onLeagueNameChange,
  onSeasonSelect,
  onSubmit,
  canSubmit,
}: CreateLeagueFormProps) => {
  const placeholderText = useMemo(() => getRandomLeagueNamePun(), []);

  return (
    <div className="space-y-6 mt-8 pb-6 px-1 min-h-[500px]">
      <div className="space-y-2">
        <Label htmlFor="leagueName" className="text-white text-sm">
          League Name
        </Label>
        <Input
          id="leagueName"
          placeholder={`e.g., ${placeholderText}`}
          value={leagueName}
          onChange={(e) => onLeagueNameChange(e.target.value)}
          className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-12"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-white text-sm">Select Season</Label>
        <Select
          value={selectedSeason?.toString()}
          onValueChange={(value) => onSeasonSelect(parseInt(value))}
        >
          <SelectTrigger className="h-12 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="Choose a season" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {seasons.map((season) => (
              <SelectItem
                key={season.id}
                value={season.id.toString()}
                className="text-white focus:bg-slate-700 focus:text-white"
              >
                <div className="flex items-center gap-2">
                  <span>{season.title}</span>
                  {season.status === "live" && (
                    <Badge className="bg-[#BFFF0B] text-black text-xs px-2 py-0 font-semibold">
                      LIVE
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      <Button
        className="w-full bg-[#BFFF0B] hover:bg-[#a8e609] text-black h-12 shadow-lg shadow-[#BFFF0B]/20 font-bold"
        disabled={!canSubmit}
        onClick={onSubmit}
      >
        Create League
      </Button>
    </div>
  );
};
