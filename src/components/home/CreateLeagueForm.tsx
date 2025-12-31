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

interface CreateLeagueFormProps {
  leagueName: string;
  selectedSeason: number | null;
  draftDate: Date;
  seasons: Season[];
  onLeagueNameChange: (name: string) => void;
  onSeasonSelect: (seasonId: number) => void;
  onDraftDateChange: (date: Date) => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

export const CreateLeagueForm = ({
  leagueName,
  selectedSeason,
  draftDate,
  seasons,
  onLeagueNameChange,
  onSeasonSelect,
  onDraftDateChange,
  onSubmit,
  canSubmit,
}: CreateLeagueFormProps) => {
  return (
    <div className="space-y-6 mt-8 pb-6 px-1 min-h-[500px]">
      <div className="space-y-2">
        <Label htmlFor="leagueName" className="text-white text-sm">
          League Name
        </Label>
        <Input
          id="leagueName"
          placeholder="e.g., Office League"
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

      <div className="space-y-3">
        <Label className="text-white text-sm">Draft Date</Label>
        <div className="relative">
          <Card className="bg-slate-800/30 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white">
                  {draftDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Tap to change date
                </p>
              </div>
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </Card>
          <input
            type="date"
            value={draftDate.toISOString().split("T")[0]}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => {
              if (e.target.value) {
                onDraftDateChange(new Date(e.target.value));
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
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
