import { Users, Check } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Contestant, LeagueUser } from "../../models/types";

interface ContestantCardProps {
  contestant: Contestant;
  isSelected: boolean;
  isAvailable: boolean;
  isOnRoster: boolean;
  pickedByUsers: number[];
  leagueUsers: LeagueUser[];
  onSelect: (contestantId: number, isOnRoster: boolean) => void;
}

export const ContestantCard = ({
  contestant,
  isSelected,
  isAvailable,
  isOnRoster,
  pickedByUsers,
  leagueUsers,
  onSelect,
}: ContestantCardProps) => {
  return (
    <Card
      onClick={() => onSelect(contestant.id, isOnRoster)}
      className={`p-4 transition-all ${
        isOnRoster
          ? "bg-slate-900/30 border-slate-800/50 opacity-40 cursor-not-allowed"
          : isSelected
          ? "bg-[#BFFF0B]/10 border-[#BFFF0B] shadow-lg shadow-[#BFFF0B]/20 cursor-pointer"
          : "bg-slate-900/50 border-slate-800 hover:bg-slate-900 hover:border-slate-700 cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Contestant Avatar */}
        <div className="relative">
          <Avatar
            className={`w-14 h-14 border-2 ${isOnRoster ? "border-slate-800" : "border-slate-700"}`}
          >
            {contestant.image ? (
              <AvatarImage
                src={contestant.image}
                className={isOnRoster ? "grayscale" : ""}
              />
            ) : (
              <AvatarFallback
                className={`${isOnRoster ? "bg-slate-800/50 text-slate-600" : "bg-slate-800 text-white"}`}
              >
                {contestant.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            )}
          </Avatar>
          {isSelected && !isOnRoster && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#BFFF0B] flex items-center justify-center">
              <Check className="w-4 h-4 text-black" />
            </div>
          )}
        </div>

        {/* Contestant Info */}
        <div className="flex-1">
          <h3
            className={`font-semibold ${isOnRoster ? "text-slate-600" : "text-white"}`}
          >
            {contestant.name}
          </h3>
          <p
            className={`text-sm ${isOnRoster ? "text-slate-700" : "text-slate-400"}`}
          >
            {contestant.tribe}
          </p>
        </div>

        {/* Availability Status */}
        <div className="flex flex-col items-end gap-2">
          {isOnRoster ? (
            <Badge className="bg-slate-800/50 text-slate-600 border border-slate-700/50">
              On Roster
            </Badge>
          ) : isAvailable ? (
            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
              Available
            </Badge>
          ) : (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-400">
                Picked by {pickedByUsers.length}
              </span>
            </div>
          )}

          {/* Show users who picked this contestant */}
          {!isAvailable && !isOnRoster && (
            <div className="flex -space-x-2">
              {pickedByUsers.slice(0, 3).map((userId) => {
                const user = leagueUsers.find((u) => u.id === userId);
                if (!user) return null;
                return (
                  <div
                    key={userId}
                    className={`w-6 h-6 rounded-full ${user.color} border-2 border-slate-900 flex items-center justify-center text-xs text-black font-semibold`}
                    title={user.name}
                  >
                    {user.initials}
                  </div>
                );
              })}
              {pickedByUsers.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs text-white">
                  +{pickedByUsers.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
