import { Trophy, Medal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Standing } from "../../models/types";

interface PodiumDisplayProps {
  topThree: Standing[];
}

export const PodiumDisplay = ({ topThree }: PodiumDisplayProps) => {
  if (topThree.length < 3) return null;

  const [first, second, third] = topThree;

  return (
    <div className="flex items-end justify-center gap-2 px-4">
      {/* 2nd Place */}
      <div className="flex-1 flex flex-col items-center">
        <Medal className="w-6 h-6 text-slate-400 mb-2" />
        <Avatar className="w-14 h-14 border-2 border-slate-600 mb-2">
          <AvatarImage src={second.avatar} alt={second.name} className="object-cover" />
          <AvatarFallback>{second.name[0]}</AvatarFallback>
        </Avatar>
        <p className="text-xs text-white">{second.name}</p>
        <p className="text-sm text-lime-400">{second.points}</p>
        <div className="w-full bg-slate-700 rounded-t-lg h-20 mt-2 flex items-center justify-center text-white">
          <span className="text-2xl">2</span>
        </div>
      </div>

      {/* 1st Place */}
      <div className="flex-1 flex flex-col items-center">
        <Trophy className="w-8 h-8 text-lime-400 mb-2" />
        <Avatar className="w-16 h-16 border-2 border-lime-400 mb-2">
          <AvatarImage src={first.avatar} alt={first.name} className="object-cover" />
          <AvatarFallback>{first.name[0]}</AvatarFallback>
        </Avatar>
        <p className="text-xs text-white">{first.name}</p>
        <p className="text-sm text-lime-400">{first.points}</p>
        <div className="w-full bg-gradient-to-t from-lime-500 to-lime-400 rounded-t-lg h-28 mt-2 flex items-center justify-center text-slate-900">
          <span className="text-3xl">1</span>
        </div>
      </div>

      {/* 3rd Place */}
      <div className="flex-1 flex flex-col items-center">
        <Medal className="w-6 h-6 text-amber-700 mb-2" />
        <Avatar className="w-14 h-14 border-2 border-amber-700 mb-2">
          <AvatarImage src={third.avatar} alt={third.name} className="object-cover" />
          <AvatarFallback>{third.name[0]}</AvatarFallback>
        </Avatar>
        <p className="text-xs text-white">{third.name}</p>
        <p className="text-sm text-lime-400">{third.points}</p>
        <div className="w-full bg-slate-700 rounded-t-lg h-16 mt-2 flex items-center justify-center text-white">
          <span className="text-2xl">3</span>
        </div>
      </div>
    </div>
  );
};
