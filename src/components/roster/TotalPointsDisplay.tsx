import { TrendingUp } from "lucide-react";

interface TotalPointsDisplayProps {
  totalPoints: number;
}

export const TotalPointsDisplay = ({
  totalPoints,
}: TotalPointsDisplayProps) => {
  return (
    <div className="text-center">
      <p className="text-slate-400 font-semibold">Total Points</p>
      <div className="flex items-center justify-center gap-2">
        <span className="text-4xl text-[#BFFF0B] font-bold">
          {totalPoints}
        </span>
        <TrendingUp className="w-6 h-6 text-[#BFFF0B]" />
      </div>
    </div>
  );
};
