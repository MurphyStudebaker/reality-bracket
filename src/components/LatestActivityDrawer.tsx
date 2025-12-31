import { Activity } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { LeagueUser, Contestant } from "../models/types";
import { useLatestActivityViewModel } from "../viewmodels/useLatestActivityViewModel";
import { ActivityContestantCard } from "./activity/ActivityContestantCard";

interface LatestActivityDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  weekNumber?: number;
  weeklyActivity: Contestant[];
  leagueUsers: LeagueUser[];
  buttonVariant?: "outline" | "default";
  buttonClassName?: string;
}

export default function LatestActivityDrawer({
  isOpen,
  onOpenChange,
  weekNumber,
  weeklyActivity,
  leagueUsers,
  buttonVariant = "outline",
  buttonClassName = "w-full border-slate-700 hover:bg-slate-800 text-slate-300",
}: LatestActivityDrawerProps) {
  const viewModel = useLatestActivityViewModel(weeklyActivity, leagueUsers);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant={buttonVariant} className={buttonClassName}>
          <Activity className="w-4 h-4 mr-2" />
          <span className="font-semibold">Latest Activity</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="bg-slate-900 border-slate-800 max-h-[85vh] overflow-y-auto px-4 py-2"
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="text-white text-4xl font-bold">
            {viewModel.hasEliminatedPlayers
              ? "The Tribe Has Spoken"
              : `Week ${weekNumber || ""} Activity`}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-3 pb-6">
          {viewModel.weeklyActivity.map((contestant) => (
            <ActivityContestantCard
              key={contestant.id}
              contestant={contestant}
              leagueUsers={viewModel.leagueUsers}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}