import { Button } from "../ui/button";

interface DraftButtonProps {
  selectedContestantName: string | null;
  onConfirm: () => void;
}

export const DraftButton = ({
  selectedContestantName,
  onConfirm,
}: DraftButtonProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent border-t border-slate-800">
      <Button
        onClick={onConfirm}
        disabled={!selectedContestantName}
        className="w-full bg-[#BFFF0B] hover:bg-[#a8e609] text-black h-12 shadow-lg shadow-[#BFFF0B]/25 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {selectedContestantName
          ? `Draft ${selectedContestantName}`
          : "Select a Contestant"}
      </Button>
    </div>
  );
};
