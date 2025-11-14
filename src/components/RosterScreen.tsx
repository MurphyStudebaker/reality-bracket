import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Crown,
  X,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import LatestActivityDrawer from "./LatestActivityDrawer";
import DraftScreen from "./DraftScreen";

const leagues = [
  {
    id: 1,
    name: "Office League",
    season: "Season 47",
  },
  {
    id: 2,
    name: "Home League",
    season: "Season 46",
  },
];

// League users
const leagueUsers = [
  {
    id: 1,
    name: "You",
    initials: "ME",
    color: "bg-[#BFFF0B]",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  },
  {
    id: 2,
    name: "Sarah J",
    initials: "SJ",
    color: "bg-blue-500",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: 3,
    name: "Mike T",
    initials: "MT",
    color: "bg-purple-500",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
  {
    id: 4,
    name: "Alex K",
    initials: "AK",
    color: "bg-orange-500",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    id: 5,
    name: "Emma L",
    initials: "EL",
    color: "bg-pink-500",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    id: 6,
    name: "Jordan P",
    initials: "JP",
    color: "bg-teal-500",
    image:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop",
  },
];

const weeklyActivity = [
  {
    id: 1,
    name: "Rachel LaMont",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    events: [
      {
        type: "immunity",
        label: "Won Individual Immunity",
        points: 10,
      },
      {
        type: "reward",
        label: "Won Reward Challenge",
        points: 5,
      },
    ],
    totalPoints: 15,
    selectedBy: {
      final3: [1, 2, 4, 5], // User IDs who have this player in Final 3
      bottom1: [], // User IDs who have this player in Bottom 1
    },
  },
  {
    id: 2,
    name: "Sam Phalen",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    events: [
      { type: "strategic", label: "Strategic Move", points: 5 },
    ],
    totalPoints: 5,
    selectedBy: {
      final3: [1, 3, 6],
      bottom1: [],
    },
  },
  {
    id: 3,
    name: "Genevieve Mushaluk",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    events: [
      {
        type: "immunity",
        label: "Won Individual Immunity",
        points: 10,
      },
    ],
    totalPoints: 10,
    selectedBy: {
      final3: [1, 2, 3, 5, 6],
      bottom1: [],
    },
  },
];

const tribeColors: Record<string, string> = {
  Gata: "bg-yellow-500",
  Lavo: "bg-purple-500",
  Tuku: "bg-blue-500",
};

const bottom1Pick = {
  id: 4,
  name: "Kyle Ostwald",
  tribe: "Tuku",
  image:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
  points: 23,
  status: "eliminated",
  eliminatedEpisode: 8,
};

const eventColors: Record<string, string> = {
  immunity: "text-blue-400",
  strategic: "text-purple-400",
  reward: "text-[#BFFF0B]",
  eliminated: "text-red-400",
};

export default function RosterScreen() {
  const [selectedLeague, setSelectedLeague] = useState("1");
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftSpotType, setDraftSpotType] = useState<
    "final3" | "bottom1"
  >("final3");
  const [draftSpotIndex, setDraftSpotIndex] =
    useState<number>(0);

  const currentLeague = leagues.find(
    (l) => l.id === parseInt(selectedLeague),
  );

  // Check if there's an eliminated player in Final 3
  const eliminatedInFinal3Index = weeklyActivity.findIndex(
    (pick) => pick.isEliminated,
  );
  const hasEliminatedInFinal3 = eliminatedInFinal3Index !== -1;

  // Get current user's roster contestant IDs (excluding the one being replaced)
  const getUserRosterIds = () => {
    const rosterIds: number[] = [];

    // Add all Final 3 picks except the one being replaced
    weeklyActivity.forEach((pick, index) => {
      if (!pick.isEliminated || index !== draftSpotIndex) {
        rosterIds.push(pick.id);
      }
    });

    return rosterIds;
  };

  // Build taken contestants map for draft screen
  // This would normally come from the league data
  const takenContestants: { [key: number]: number[] } = {
    1: [2, 3, 4], // Rachel picked by users 2, 3, 4
    2: [1, 3, 6], // Sam picked by users 1, 3, 6
    3: [1, 2, 3, 5, 6], // Genevieve picked by users 1, 2, 3, 5, 6
  };

  const handleStartDraft = (
    spotType: "final3" | "bottom1",
    spotIndex?: number,
  ) => {
    setDraftSpotType(spotType);
    setDraftSpotIndex(spotIndex || 0);
    setIsDrafting(true);
  };

  const handleDraftComplete = (contestantId: number) => {
    // In a real app, this would update the roster via API
    console.log(
      `Drafted contestant ${contestantId} for ${draftSpotType} spot ${draftSpotIndex}`,
    );
    setIsDrafting(false);
  };

  if (isDrafting) {
    return (
      <DraftScreen
        onBack={() => setIsDrafting(false)}
        spotType={draftSpotType}
        spotIndex={draftSpotIndex}
        leagueName={currentLeague?.name || ""}
        onDraftComplete={handleDraftComplete}
        takenContestants={takenContestants}
        userRosterIds={getUserRosterIds()}
      />
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* League Selector */}
      <div className="space-y-2">
        <Select
          value={selectedLeague}
          onValueChange={setSelectedLeague}
        >
          <SelectTrigger className="w-full bg-transparent border-none text-white p-0 h-auto hover:bg-transparent [&>svg]:hidden">
            <div className="flex items-center gap-2">
              <h1 className="text-white font-bold">
                {currentLeague?.name}
              </h1>
              <ChevronDown className="w-6 h-6 text-slate-400" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {leagues.map((league) => (
              <SelectItem
                key={league.id}
                value={league.id.toString()}
                className="text-white focus:bg-slate-700 focus:text-white"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{league.name}</span>
                  <Badge className="ml-2 bg-[#BFFF0B] text-black font-semibold">
                    {league.season}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-400">
          {currentLeague?.season}
        </p>
      </div>

      {/* Total Points */}
      <div className="text-center">
        <p className="text-slate-400 font-semibold">
          Total Points
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-4xl text-[#BFFF0B] font-bold">
            {weeklyActivity.reduce(
              (sum, pick) => sum + pick.totalPoints,
              0,
            )}
          </span>
          <TrendingUp className="w-6 h-6 text-[#BFFF0B]" />
        </div>
      </div>

      {/* Latest Activity Button */}
      <LatestActivityDrawer
        isOpen={isActivityOpen}
        onOpenChange={setIsActivityOpen}
        weeklyActivity={weeklyActivity}
        leagueUsers={leagueUsers}
      />

      {/* Final 3 Picks */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-[#BFFF0B]" />
          <h2 className="text-white font-bold">
            Final 3 Picks
          </h2>
        </div>
        <div className="space-y-3">
          {weeklyActivity.map((pick, index) => (
            <div key={pick.id} className="relative">
              <Card
                className={`p-4 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.4)] rounded-xl ${
                  pick.isEliminated
                    ? "bg-slate-900/40 border-slate-800/50 grayscale"
                    : "bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600 hover:shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar
                      className={`w-16 h-16 border-2 ${pick.isEliminated ? "border-red-400/30" : "border-[#BFFF0B]/30"}`}
                    >
                      <AvatarImage
                        src={pick.image}
                        alt={pick.name}
                        className={
                          pick.isEliminated ? "grayscale" : ""
                        }
                      />
                      <AvatarFallback>
                        {pick.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {index === 0 && !pick.isEliminated && (
                      <div className="absolute -top-1 -right-1 bg-[#BFFF0B] rounded-full p-1">
                        <Crown className="w-3 h-3 text-slate-900" />
                      </div>
                    )}
                    {pick.isEliminated && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <X className="w-8 h-8 text-red-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-bold ${pick.isEliminated ? "text-slate-500" : "text-white"}`}
                    >
                      {pick.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {pick.isEliminated ? (
                        <Badge
                          variant="destructive"
                          className="text-xs bg-red-900 text-red-200 font-semibold"
                        >
                          Eliminated
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs border-slate-700 text-slate-300 font-semibold"
                        >
                          Safe
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-xl font-bold ${pick.isEliminated ? "text-slate-600" : "text-[#BFFF0B]"}`}
                      >
                        {pick.totalPoints}
                      </span>
                      {!pick.isEliminated &&
                        (pick.totalPoints > 10 ? (
                          <TrendingUp className="w-4 h-4 text-[#BFFF0B]" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        ))}
                    </div>
                    <p className="text-xs text-slate-500">
                      points
                    </p>
                  </div>
                </div>
              </Card>

              {/* Draft Replacement Overlay */}
              {pick.isEliminated && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-xl">
                  <div className="text-center space-y-2 px-4">
                    <div>
                      <h3 className="text-white font-bold text-sm">
                        Player Eliminated
                      </h3>
                    </div>
                    <Button
                      onClick={() =>
                        handleStartDraft("final3", index)
                      }
                      className="bg-[#BFFF0B] hover:bg-[#a8e609] text-black font-bold h-9 text-sm"
                    >
                      Draft a Replacement
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom 1 Pick */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <X className="w-5 h-5 text-red-400" />
          <h2 className="text-white font-bold">Next Boot</h2>
        </div>
        <div className="relative">
          <Card
            className={`p-4 backdrop-blur-sm rounded-xl ${
              bottom1Pick.status === "eliminated"
                ? "bg-slate-900/40 border-red-900/30"
                : "bg-slate-900/80 border-red-900/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar
                  className={`w-16 h-16 border-2 ${bottom1Pick.status === "eliminated" ? "border-red-400/30" : "border-red-400/30"}`}
                >
                  <AvatarImage
                    src={bottom1Pick.image}
                    alt={bottom1Pick.name}
                    className={
                      bottom1Pick.status === "eliminated"
                        ? "grayscale"
                        : ""
                    }
                  />
                  <AvatarFallback>
                    {bottom1Pick.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {bottom1Pick.status === "eliminated" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <X className="w-8 h-8 text-red-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3
                  className={`font-bold ${bottom1Pick.status === "eliminated" ? "text-slate-500" : "text-white"}`}
                >
                  {bottom1Pick.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    className={`${tribeColors[bottom1Pick.tribe]} text-white text-xs font-semibold`}
                  >
                    {bottom1Pick.tribe}
                  </Badge>
                  {bottom1Pick.status === "eliminated" && (
                    <Badge
                      variant="destructive"
                      className="text-xs bg-red-900 text-red-200 font-semibold"
                    >
                      Eliminated - Ep{" "}
                      {bottom1Pick.eliminatedEpisode}
                    </Badge>
                  )}
                </div>
                <p
                  className={`text-xs mt-1 ${bottom1Pick.status === "eliminated" ? "text-slate-600" : "text-slate-500"}`}
                >
                  Earn points when this player is eliminated
                  early
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`text-xl font-bold ${bottom1Pick.status === "eliminated" ? "text-slate-600" : "text-[#BFFF0B]"}`}
                >
                  {bottom1Pick.points}
                </span>
                <p className="text-xs text-slate-500">points</p>
              </div>
            </div>
          </Card>

          {/* Draft Replacement Overlay */}
          {bottom1Pick.status === "eliminated" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-xl">
              <div className="text-center space-y-2 px-4">
                <div>
                  <h3 className="text-white font-bold text-sm">
                    Player Eliminated
                  </h3>
                </div>
                <Button
                  onClick={() => handleStartDraft("bottom1")}
                  className="bg-[#BFFF0B] hover:bg-[#a8e609] text-black font-bold h-9 text-sm"
                >
                  Draft Replacement
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Points Breakdown */}
      <Card className="p-4 bg-slate-900/50 border-slate-800 backdrop-blur-sm rounded-xl">
        <h3 className="text-white mb-3 font-bold">
          How Points Work
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">
              Player is Immune
            </span>
            <span className="text-[#BFFF0B] font-semibold">
              +10 pts
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">
              Player Makes Jury
            </span>
            <span className="text-[#BFFF0B] font-semibold">
              +5 pts
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Final 3</span>
            <span className="text-[#BFFF0B] font-semibold">
              +5 pts
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">
              Finishes in Predicted Order
            </span>
            <span className="text-[#BFFF0B] font-semibold">
              +10 pts
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">
              Correctly Predicted Boot
            </span>
            <span className="text-[#BFFF0B] font-semibold">
              +15 pts
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}