import { ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";

interface DraftHeaderProps {
  leagueName: string;
  spotTitle: string;
  onBack: () => void;
}

export const DraftHeader = ({
  leagueName,
  spotTitle,
  onBack,
}: DraftHeaderProps) => {
  return (
    <div className="sticky top-0 z-10 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 px-4 py-4">
      <div className="flex items-center gap-3 mb-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-white font-bold">Draft Replacement</h1>
          <p className="text-sm text-slate-400">{leagueName}</p>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-[#BFFF0B]"></div>
          <span className="text-[#BFFF0B] font-semibold">{spotTitle}</span>
        </div>
        <p className="text-sm text-slate-300">
          Select a contestant to replace your eliminated player. Contestants
          already picked by others in this spot cannot be drafted.
        </p>
      </div>
    </div>
  );
};
