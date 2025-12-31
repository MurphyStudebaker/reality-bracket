import { Badge } from "./ui/badge";
import { SpotType } from "../models/types";
import { useDraftViewModel } from "../viewmodels/useDraftViewModel";
import { DraftHeader } from "./draft/DraftHeader";
import { ContestantCard } from "./draft/ContestantCard";
import { DraftButton } from "./draft/DraftButton";

interface DraftScreenProps {
  onBack: () => void;
  spotType: SpotType;
  spotIndex?: number;
  leagueName: string;
  onDraftComplete: (contestantId: number) => void;
  takenContestants: { [key: number]: number[] };
  userRosterIds: number[];
}

export default function DraftScreen({
  onBack,
  spotType,
  spotIndex,
  leagueName,
  onDraftComplete,
  takenContestants,
  userRosterIds,
}: DraftScreenProps) {
  const viewModel = useDraftViewModel({
    spotType,
    spotIndex,
    takenContestants,
    userRosterIds,
  });

  const handleDraftConfirm = () => {
    if (viewModel.selectedContestant) {
      onDraftComplete(viewModel.selectedContestant);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <DraftHeader
        leagueName={leagueName}
        spotTitle={viewModel.spotTitle}
        onBack={onBack}
      />

      {/* Available Contestants */}
      <div className="p-4 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Available Contestants</h2>
          <Badge className="bg-slate-800 text-slate-300 border border-slate-700">
            {viewModel.availableContestants.length} available
          </Badge>
        </div>

        <div className="space-y-2">
          {viewModel.sortedContestants.map((contestant) => {
            const availability = viewModel.getContestantAvailability(
              contestant.id
            );

            return (
              <ContestantCard
                key={contestant.id}
                contestant={contestant}
                isSelected={viewModel.selectedContestant === contestant.id}
                isAvailable={availability.isAvailable}
                isOnRoster={availability.isOnRoster}
                pickedByUsers={availability.pickedByUsers}
                leagueUsers={viewModel.leagueUsers}
                onSelect={viewModel.handleSelectContestant}
              />
            );
          })}
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <DraftButton
        selectedContestantName={viewModel.selectedContestantName}
        onConfirm={handleDraftConfirm}
      />
    </div>
  );
}
