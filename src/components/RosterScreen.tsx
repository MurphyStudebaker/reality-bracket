import { Trophy, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import LatestActivityDrawer from "./LatestActivityDrawer";
import DraftScreen from "./DraftScreen";
import { useRosterViewModel } from "../viewmodels/useRosterViewModel";
import { LeagueSelector } from "./roster/LeagueSelector";
import { TotalPointsDisplay } from "./roster/TotalPointsDisplay";
import { Final3PickCard } from "./roster/Final3PickCard";
import { Bottom1PickCard } from "./roster/Bottom1PickCard";
import { PointsBreakdown } from "./roster/PointsBreakdown";
import { leagueUsers } from "../models/mockData";

export default function RosterScreen() {
  const viewModel = useRosterViewModel();

  return (
    <div className="p-4 space-y-6">
      {/* League Selector */}
      <LeagueSelector
        leagues={viewModel.leagues}
        selectedLeague={viewModel.selectedLeague}
        currentLeague={viewModel.currentLeague}
        onLeagueChange={viewModel.handleLeagueChange}
      />

      {/* Total Points */}
      <TotalPointsDisplay totalPoints={viewModel.totalPoints} />

      {/* Latest Activity Button */}
      <LatestActivityDrawer
        isOpen={viewModel.isActivityOpen}
        onOpenChange={viewModel.setIsActivityOpen}
        weeklyActivity={viewModel.weeklyActivity}
        leagueUsers={leagueUsers}
      />

      {/* Final 3 Picks */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-[#BFFF0B]" />
          <h2 className="text-white font-bold">Final 3 Picks</h2>
        </div>
        <div className="space-y-3">
          {viewModel.final3Picks.map((pick, index) => (
            <Final3PickCard
              key={pick.id}
              pick={pick}
              index={index}
              onDraftReplacement={(idx) =>
                viewModel.handleStartDraft("final3", idx)
              }
            />
          ))}
        </div>
      </section>

      {/* Bottom 1 Pick */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <X className="w-5 h-5 text-red-400" />
          <h2 className="text-white font-bold">Next Boot</h2>
        </div>
        <Bottom1PickCard
          pick={viewModel.bottom1Pick}
          onDraftReplacement={() => viewModel.handleStartDraft("bottom1")}
        />
      </section>

      {/* Points Breakdown */}
      <PointsBreakdown />

      {/* Draft Replacement Drawer */}
      <Sheet open={viewModel.isDrafting} onOpenChange={viewModel.handleCloseDraft}>
        <SheetContent
          side="bottom"
          className="bg-slate-900 border-slate-800 h-[90vh] overflow-y-auto p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Draft Replacement Player</SheetTitle>
          </SheetHeader>
          <DraftScreen
            onBack={viewModel.handleCloseDraft}
            spotType={viewModel.draftSpotType}
            spotIndex={viewModel.draftSpotIndex}
            leagueName={viewModel.currentLeague?.name || ""}
            onDraftComplete={viewModel.handleDraftComplete}
            takenContestants={viewModel.takenContestants}
            userRosterIds={viewModel.getUserRosterIds()}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}