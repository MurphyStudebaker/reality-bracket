import { X } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Contestant } from "../../models/types";
import { tribeColors } from "../../models/constants";

interface Bottom1PickCardProps {
  pick: Contestant;
  onDraftReplacement: () => void;
}

export const Bottom1PickCard = ({
  pick,
  onDraftReplacement,
}: Bottom1PickCardProps) => {
  return (
    <div className="relative">
      <Card
        className={`p-4 backdrop-blur-sm rounded-xl ${
          pick.status === "eliminated"
            ? "bg-slate-900/40 border-red-900/30"
            : "bg-slate-900/80 border-red-900/50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar
              className={`w-16 h-16 border-2 ${
                pick.status === "eliminated"
                  ? "border-red-400/30"
                  : "border-red-400/30"
              }`}
            >
              <AvatarImage
                src={pick.image || ""}
                alt={pick.name}
                className={
                  pick.status === "eliminated" ? "grayscale" : ""
                }
              />
              <AvatarFallback>
                {pick.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {pick.status === "eliminated" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <X className="w-8 h-8 text-red-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3
              className={`font-bold ${
                pick.status === "eliminated"
                  ? "text-slate-500"
                  : "text-white"
              }`}
            >
              {pick.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {pick.tribe && (
                <Badge
                  className={`${tribeColors[pick.tribe]} text-white text-xs font-semibold`}
                >
                  {pick.tribe}
                </Badge>
              )}
              {pick.status === "eliminated" && (
                <Badge
                  variant="destructive"
                  className="text-xs bg-red-900 text-red-200 font-semibold"
                >
                  Eliminated - Ep {pick.eliminatedEpisode}
                </Badge>
              )}
            </div>
            <p
              className={`text-xs mt-1 ${
                pick.status === "eliminated"
                  ? "text-slate-600"
                  : "text-slate-500"
              }`}
            >
              Earn points when this player is eliminated early
            </p>
          </div>
          <div className="text-right">
            <span
              className={`text-xl font-bold ${
                pick.status === "eliminated"
                  ? "text-slate-600"
                  : "text-[#BFFF0B]"
              }`}
            >
              {pick.points}
            </span>
            <p className="text-xs text-slate-500">points</p>
          </div>
        </div>
      </Card>

      {/* Draft Replacement Overlay */}
      {pick.status === "eliminated" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-xl">
          <div className="text-center space-y-2 px-4">
            <div>
              <h3 className="text-white font-bold text-sm">
                Player Eliminated
              </h3>
            </div>
            <Button
              onClick={onDraftReplacement}
              className="bg-[#BFFF0B] hover:bg-[#a8e609] text-black font-bold h-9 text-sm"
            >
              Draft Replacement
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
