import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ChevronLeft, Users, Check } from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

// All Season 47 contestants
const allContestants = [
  {
    id: 1,
    name: "Rachel LaMont",
    tribe: "Gata",
    image: null,
    isEliminated: false,
  },
  {
    id: 2,
    name: "Sam Phalen",
    tribe: "Gata",
    image: null,
    isEliminated: false,
  },
  {
    id: 3,
    name: "Genevieve Mushaluk",
    tribe: "Lavo",
    image: null,
    isEliminated: false,
  },
  {
    id: 4,
    name: "Kyle Ostwald",
    tribe: "Tuku",
    image: null,
    isEliminated: true,
  },
  {
    id: 5,
    name: "Andy (Andrew) Rueda",
    tribe: "Gata",
    image: null,
    isEliminated: true,
  },
  {
    id: 6,
    name: "Sue (Susan) Smey",
    tribe: "Tuku",
    image: null,
    isEliminated: false,
  },
  {
    id: 7,
    name: "Caroline Vidmar",
    tribe: "Lavo",
    image: null,
    isEliminated: false,
  },
  {
    id: 8,
    name: "Teeny Chirichillo",
    tribe: "Gata",
    image: "https://ew.com/thmb/H_1fNv-0CUxNdSSoPqO04OK7RzE%3D/2000x0/filters%3Ano_upscale%28%29%3Amax_bytes%28150000%29%3Astrip_icc%28%29%3Aformat%28webp%29/TEENY-CHIRICHILLO-083024-2be8b99322974d05b537dd59405867d4.jpg",
    isEliminated: false,
  },
  {
    id: 9,
    name: "Gabriel \"Gabe\" Ortis",
    tribe: "Lavo",
    image: null,
    isEliminated: false,
  },
  {
    id: 10,
    name: "Jon Lovett",
    tribe: "Gata",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Jon_Lovett_2024_%28cropped%29.jpg/250px-Jon_Lovett_2024_%28cropped%29.jpg",
    isEliminated: false,
  },
  {
    id: 11,
    name: "Kishan Patel",
    tribe: "Tuku",
    image: "https://ew.com/thmb/KRFMjGLAZz82YBY7lWZpEkxULcU%3D/2000x0/filters%3Ano_upscale%28%29%3Amax_bytes%28150000%29%3Astrip_icc%28%29%3Aformat%28webp%29/KISHAN-PATEL-083024-2904e13b57174cc1a4b025ab5f66e891.jpg",
    isEliminated: false,
  },
  {
    id: 12,
    name: "Anika Dhar",
    tribe: "Lavo",
    image: "https://ew.com/thmb/QxMDmpBbjIId52LLxOxNPf4a-JY%3D/2000x0/filters%3Ano_upscale%28%29%3Amax_bytes%28150000%29%3Astrip_icc%28%29%3Aformat%28webp%29/ANIKA-DHAR-083024-65b2e810b5ba4d39a870f3b56f30d1ec.jpg",
    isEliminated: false,
  },
  {
    id: 13,
    name: "Rome Cooney",
    tribe: "Lavo",
    image: "https://ew.com/thmb/4UAowy826RWxHCQAakvrTob3UAs%3D/2000x0/filters%3Ano_upscale%28%29%3Amax_bytes%28150000%29%3Astrip_icc%28%29%3Aformat%28webp%29/ROME-COONEY-083024-a4bc9220498e4c3a9195c9f7a426a86d.jpg",
    isEliminated: false,
  },
  {
    id: 14,
    name: "Sierra Wright",
    tribe: "Tuku",
    image: "https://ew.com/thmb/GZKx9IlWlHEshIjo8gRI_diJydY%3D/2000x0/filters%3Ano_upscale%28%29%3Amax_bytes%28150000%29%3Astrip_icc%28%29%3Aformat%28webp%29/SIERRA-WRIGHT-083024-f5f6363d0c8241da91518cc8f71a3b3b.jpg",
    isEliminated: false,
  },
  {
    id: 15,
    name: "Solomon \"Sol\" Yi",
    tribe: "Lavo",
    image: null,
    isEliminated: false,
  },
];

// League users data
const leagueUsers = [
  {
    id: 1,
    name: "You",
    initials: "ME",
    color: "bg-[#BFFF0B]",
  },
  {
    id: 2,
    name: "Sarah J",
    initials: "SJ",
    color: "bg-blue-500",
  },
  {
    id: 3,
    name: "Mike T",
    initials: "MT",
    color: "bg-purple-500",
  },
  {
    id: 4,
    name: "Alex K",
    initials: "AK",
    color: "bg-orange-500",
  },
  {
    id: 5,
    name: "Emma L",
    initials: "EL",
    color: "bg-pink-500",
  },
  {
    id: 6,
    name: "Jordan P",
    initials: "JP",
    color: "bg-teal-500",
  },
];

interface DraftScreenProps {
  onBack: () => void;
  spotType: "final3" | "bottom1"; // Which spot they're drafting for
  spotIndex?: number; // Which position in Final 3 (0, 1, or 2)
  leagueName: string;
  onDraftComplete: (contestantId: number) => void;
  // Map of contestant IDs to arrays of user IDs who have picked them in this spot
  takenContestants: { [key: number]: number[] };
  // Current user's roster contestant IDs (to gray out contestants already on their roster)
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
  const [selectedContestant, setSelectedContestant] = useState<number | null>(
    null
  );

  // Filter available contestants
  const availableContestants = allContestants.filter((c) => !c.isEliminated);

  const handleDraftConfirm = () => {
    if (selectedContestant) {
      onDraftComplete(selectedContestant);
    }
  };

  // Sort contestants: eligible first, ineligible at the end
  const sortedContestants = [...availableContestants].sort((a, b) => {
    const aIsOnRoster = userRosterIds.includes(a.id);
    const bIsOnRoster = userRosterIds.includes(b.id);
    
    if (aIsOnRoster && !bIsOnRoster) return 1; // a goes after b
    if (!aIsOnRoster && bIsOnRoster) return -1; // a goes before b
    return 0; // maintain original order
  });

  const spotTitle =
    spotType === "final3"
      ? `Final 3 - Position ${(spotIndex || 0) + 1}`
      : "Next Boot Pick";

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
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

      {/* Available Contestants */}
      <div className="p-4 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Available Contestants</h2>
          <Badge className="bg-slate-800 text-slate-300 border border-slate-700">
            {availableContestants.length} available
          </Badge>
        </div>

        <div className="space-y-2">
          {sortedContestants.map((contestant) => {
            const pickedByUsers = takenContestants[contestant.id] || [];
            const isAvailable = pickedByUsers.length === 0;
            const isSelected = selectedContestant === contestant.id;
            const isOnRoster = userRosterIds.includes(contestant.id);

            return (
              <Card
                key={contestant.id}
                onClick={() => !isOnRoster && setSelectedContestant(contestant.id)}
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
                    <Avatar className={`w-14 h-14 border-2 ${isOnRoster ? "border-slate-800" : "border-slate-700"}`}>
                      {contestant.image ? (
                        <AvatarImage src={contestant.image} className={isOnRoster ? "grayscale" : ""} />
                      ) : (
                        <AvatarFallback className={`${isOnRoster ? "bg-slate-800/50 text-slate-600" : "bg-slate-800 text-white"}`}>
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
                    <h3 className={`font-semibold ${isOnRoster ? "text-slate-600" : "text-white"}`}>
                      {contestant.name}
                    </h3>
                    <p className={`text-sm ${isOnRoster ? "text-slate-700" : "text-slate-400"}`}>{contestant.tribe}</p>
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
          })}
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent border-t border-slate-800">
        <Button
          onClick={handleDraftConfirm}
          disabled={!selectedContestant}
          className="w-full bg-[#BFFF0B] hover:bg-[#a8e609] text-black h-12 shadow-lg shadow-[#BFFF0B]/25 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {selectedContestant
            ? `Draft ${
                availableContestants.find((c) => c.id === selectedContestant)
                  ?.name
              }`
            : "Select a Contestant"}
        </Button>
      </div>
    </div>
  );
}