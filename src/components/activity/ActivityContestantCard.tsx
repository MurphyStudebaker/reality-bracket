import { Trophy, X } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Contestant, LeagueUser } from "../../models/types";
import { eventColors } from "../../models/constants";

interface ActivityContestantCardProps {
  contestant: Contestant;
  leagueUsers: LeagueUser[];
}

export const ActivityContestantCard = ({
  contestant,
  leagueUsers,
}: ActivityContestantCardProps) => {
  return (
    <Card
      className={`p-4 ${
        contestant.isEliminated
          ? "bg-red-950/30 border-red-900/50"
          : "bg-slate-800/60 border-slate-700/50"
      } rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.4)]`}
    >
      <div className="space-y-3">
        {/* Contestant Header */}
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar
              className={`w-12 h-12 border-2 ${
                contestant.isEliminated
                  ? "border-red-900 opacity-60"
                  : "border-slate-700"
              }`}
            >
              <AvatarImage src={contestant.image || ""} alt={contestant.name} className="object-cover" />
              <AvatarFallback>
                {contestant.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {contestant.isEliminated && (
              <div className="absolute inset-0 flex items-center justify-center">
                <X className="w-6 h-6 text-red-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white">{contestant.name}</h4>
            <div className="space-y-1 mt-2">
              {contestant.events?.map((event, idx) => (
                <div key={idx} className="text-sm">
                  <span className={eventColors[event.type]}>
                    {event.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-right">
            <Badge
              className={`${
                contestant.isEliminated
                  ? "bg-red-900 text-red-200"
                  : "bg-[#BFFF0B] text-black"
              } font-bold`}
            >
              {contestant.isEliminated
                ? "ELIMINATED"
                : `+${contestant.totalPoints}`}
            </Badge>
          </div>
        </div>

        {/* User Selections - Won/Lost Points */}
        {contestant.isEliminated && (
          <div className="space-y-2 pt-2 border-t border-slate-700/50">
            {/* Users who had them in Final 3 (lost points) */}
            {contestant.selectedBy?.final3 &&
              contestant.selectedBy.final3.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 min-w-[80px]">
                    <Trophy className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-slate-400 font-semibold">
                      Final 3
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {contestant.selectedBy.final3.map((userId) => {
                      const user = leagueUsers.find((u) => u.id === userId);
                      return user ? (
                        <div key={userId} className="relative group">
                          <Avatar className="w-6 h-6 border border-red-500 opacity-70">
                            <AvatarImage src={user.image} alt={user.name} className="object-cover" />
                            <AvatarFallback
                              className={`text-[10px] ${user.color} text-white`}
                            >
                              {user.initials}
                            </AvatarFallback>
                          </Avatar>
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                            {user.name}
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

            {/* Users who had them as Next Boot (won points!) */}
            {contestant.selectedBy?.bottom1 &&
              contestant.selectedBy.bottom1.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 min-w-[80px]">
                    <X className="w-3 h-3 text-[#BFFF0B]" />
                    <span className="text-xs text-slate-400 font-semibold">
                      Next Boot
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {contestant.selectedBy.bottom1.map((userId) => {
                      const user = leagueUsers.find((u) => u.id === userId);
                      return user ? (
                        <div key={userId} className="relative group">
                          <Avatar className="w-6 h-6 border-2 border-[#BFFF0B]">
                            <AvatarImage src={user.image} alt={user.name} className="object-cover" />
                            <AvatarFallback
                              className={`text-[10px] ${user.color} text-white`}
                            >
                              {user.initials}
                            </AvatarFallback>
                          </Avatar>
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                            {user.name}
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* User Selections - Active Players */}
        {!contestant.isEliminated && (
          <div className="space-y-2 pt-2 border-t border-slate-700/50">
            {/* Final 3 Selections */}
            {contestant.selectedBy?.final3 &&
              contestant.selectedBy.final3.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 min-w-[80px]">
                    <Trophy className="w-3 h-3 text-[#BFFF0B]" />
                    <span className="text-xs text-slate-400 font-semibold">
                      Final 3
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {contestant.selectedBy.final3.map((userId) => {
                      const user = leagueUsers.find((u) => u.id === userId);
                      return user ? (
                        <div key={userId} className="relative group">
                          <Avatar className="w-6 h-6 border border-[#BFFF0B]">
                            <AvatarImage src={user.image} alt={user.name} className="object-cover" />
                            <AvatarFallback
                              className={`text-[10px] ${user.color} text-white`}
                            >
                              {user.initials}
                            </AvatarFallback>
                          </Avatar>
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                            {user.name}
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

            {/* Bottom 1 Selections */}
            {contestant.selectedBy?.bottom1 &&
              contestant.selectedBy.bottom1.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 min-w-[80px]">
                    <X className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-slate-400 font-semibold">
                      Next Boot
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {contestant.selectedBy.bottom1.map((userId) => {
                      const user = leagueUsers.find((u) => u.id === userId);
                      return user ? (
                        <div key={userId} className="relative group">
                          <Avatar className="w-6 h-6 border border-red-400">
                            <AvatarImage src={user.image} alt={user.name} className="object-cover" />
                            <AvatarFallback
                              className={`text-[10px] ${user.color} text-white`}
                            >
                              {user.initials}
                            </AvatarFallback>
                          </Avatar>
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                            {user.name}
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </Card>
  );
};