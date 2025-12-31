import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { League } from "../../models/types";

interface LeagueSelectorProps {
  leagues: League[];
  selectedLeague: string;
  currentLeague?: League;
  onLeagueChange: (leagueId: string) => void;
}

export const LeagueSelector = ({
  leagues,
  selectedLeague,
  currentLeague,
  onLeagueChange,
}: LeagueSelectorProps) => {
  return (
    <div className="space-y-2">
      <Select value={selectedLeague} onValueChange={onLeagueChange}>
        <SelectTrigger className="w-full bg-transparent border-none text-white p-0 h-auto hover:bg-transparent [&>svg]:hidden">
          <div className="flex items-center gap-2">
            <h1 className="text-white font-bold">
              {currentLeague?.name}
            </h1>
            <ChevronDown className="w-6 h-6 text-slate-400" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          {leagues.map((league) => (
            <SelectItem
              key={league.id}
              value={league.id.toString()}
              className="text-white focus:bg-slate-700 focus:text-white"
            >
              <div className="flex items-center justify-between w-full">
                <span>{league.name}</span>
                <Badge className="ml-2 bg-[#BFFF0B] text-black font-semibold">
                  {league.season}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-slate-400">{currentLeague?.season}</p>
    </div>
  );
};
