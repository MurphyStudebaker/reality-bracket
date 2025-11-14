import {
  Plus,
  ChevronRight,
  Users as UsersIcon,
  Trophy,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import SeasonDetailsScreen from "./SeasonDetailsScreen";
import logo from "figma:asset/5e41f5472fd718170d569caca90dd28328e9a3c6.png";

const myLeagues = [
  {
    id: 1,
    name: "Office League",
    season: "Season 47",
    members: 8,
    rank: 2,
    points: 145,
  },
  {
    id: 2,
    name: "Family Showdown",
    season: "Season 46",
    members: 6,
    rank: 1,
    points: 203,
  },
];

const seasons = [
  {
    id: 47,
    title: "Season 47",
    subtitle: "Current Season",
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=240&fit=crop",
    status: "live",
    leagues: 12,
  },
  {
    id: 46,
    title: "Season 46",
    subtitle: "Recently Completed",
    image:
      "https://images.unsplash.com/photo-1537551121640-bc1d80e5d0a0?w=400&h=240&fit=crop",
    status: "completed",
    leagues: 8,
  },
  {
    id: 45,
    title: "Season 45",
    subtitle: "Archive",
    image:
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400&h=240&fit=crop",
    status: "archived",
    leagues: 5,
  },
];

interface HomeScreenProps {
  onLeagueClick: (leagueId: number) => void;
}

export default function HomeScreen({
  onLeagueClick,
}: HomeScreenProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [leagueName, setLeagueName] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<
    number | null
  >(null);
  const [draftDate, setDraftDate] = useState<Date>(
    new Date(2026, 1, 14),
  ); // February 14, 2026
  const [viewingSeason, setViewingSeason] = useState<
    (typeof seasons)[0] | null
  >(null);

  if (viewingSeason) {
    return (
      <SeasonDetailsScreen
        season={viewingSeason}
        onBack={() => setViewingSeason(null)}
      />
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Create/Join League Button */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button className="w-full bg-[#BFFF0B] hover:bg-[#a8e609] text-black h-12 shadow-lg shadow-[#BFFF0B]/25 rounded-xl font-bold">
            <Plus className="w-5 h-5 mr-2" />
            Join or Create League
          </Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="bg-slate-900 border-slate-800 max-h-[90vh] overflow-y-auto px-4 py-2"
        >
          <SheetHeader className="pb-6">
            <SheetTitle className="text-white text-4xl">
              Come on In, Guys
            </SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="join" className="mt-6">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-slate-700 h-12">
              <TabsTrigger
                value="join"
                className="data-[state=active]:bg-[#BFFF0B] data-[state=active]:text-black text-slate-300 font-semibold"
              >
                Join League
              </TabsTrigger>
              <TabsTrigger
                value="create"
                className="data-[state=active]:bg-[#BFFF0B] data-[state=active]:text-black text-slate-300 font-semibold"
              >
                Create League
              </TabsTrigger>
            </TabsList>

            {/* Join League Tab */}
            <TabsContent
              value="join"
              className="space-y-6 mt-8 pb-6 px-1 min-h-[500px]"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="inviteCode"
                    className="text-white text-sm"
                  >
                    Invite Code
                  </Label>
                  <Input
                    id="inviteCode"
                    placeholder="Enter 6-digit code"
                    value={inviteCode}
                    onChange={(e) =>
                      setInviteCode(e.target.value)
                    }
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-12 text-center tracking-widest text-lg"
                    maxLength={6}
                  />
                  <p className="text-xs text-slate-500">
                    Ask your league commissioner for the invite
                    code
                  </p>
                </div>
              </div>
              <Button
                className="w-full bg-[#BFFF0B] hover:bg-[#a8e609] text-black h-12 shadow-lg shadow-[#BFFF0B]/20 font-bold"
                disabled={!inviteCode || inviteCode.length < 6}
              >
                Join League
              </Button>
            </TabsContent>

            {/* Create League Tab */}
            <TabsContent
              value="create"
              className="space-y-6 mt-8 pb-6 px-1 min-h-[500px]"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="leagueName"
                  className="text-white text-sm"
                >
                  League Name
                </Label>
                <Input
                  id="leagueName"
                  placeholder="e.g., Office League"
                  value={leagueName}
                  onChange={(e) =>
                    setLeagueName(e.target.value)
                  }
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-12"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-white text-sm">
                  Select Season
                </Label>
                <Select
                  value={selectedSeason?.toString()}
                  onValueChange={(value) =>
                    setSelectedSeason(parseInt(value))
                  }
                >
                  <SelectTrigger className="h-12 bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Choose a season" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {seasons.map((season) => (
                      <SelectItem
                        key={season.id}
                        value={season.id.toString()}
                        className="text-white focus:bg-slate-700 focus:text-white"
                      >
                        <div className="flex items-center gap-2">
                          <span>{season.title}</span>
                          {season.status === "live" && (
                            <Badge className="bg-[#BFFF0B] text-black text-xs px-2 py-0 font-semibold">
                              LIVE
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-white text-sm">
                  Draft Date
                </Label>
                <div className="relative">
                  <Card className="bg-slate-800/30 border-slate-700 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white">
                          {draftDate.toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Tap to change date
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </Card>
                  <input
                    type="date"
                    value={
                      draftDate.toISOString().split("T")[0]
                    }
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => {
                      if (e.target.value) {
                        setDraftDate(new Date(e.target.value));
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <Button
                className="w-full bg-[#BFFF0B] hover:bg-[#a8e609] text-black h-12 shadow-lg shadow-[#BFFF0B]/20 font-bold"
                disabled={
                  !leagueName || !selectedSeason || !draftDate
                }
              >
                Create League
              </Button>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* My Leagues Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold">My Leagues</h2>
          <Badge
            variant="secondary"
            className="bg-neutral-800 text-[#BFFF0B] border border-[#BFFF0B]/30 font-semibold"
          >
            {myLeagues.length} Active
          </Badge>
        </div>
        <div className="space-y-3">
          {myLeagues.map((league) => (
            <Card
              key={league.id}
              onClick={() => onLeagueClick(league.id)}
              className="p-4 bg-[#1a1a1a] border-neutral-800 hover:bg-[#222] hover:border-neutral-700 transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.6)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.8)] rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold">
                      {league.name}
                    </h3>
                    {league.rank === 1 && (
                      <Trophy className="w-4 h-4 text-[#BFFF0B]" />
                    )}
                  </div>
                  <p className="text-sm text-neutral-400">
                    {league.season}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm text-neutral-400">
                      <UsersIcon className="w-4 h-4" />
                      <span>{league.members}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs border-neutral-600 text-neutral-300 rounded-full font-semibold"
                    >
                      Rank #{league.rank}
                    </Badge>
                    <span className="text-sm text-[#BFFF0B] font-semibold">
                      {league.points} pts
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-600" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Logo Section */}
      <section className="flex justify-center py-8">
        <img src={logo} alt="Reality Bracket Logo" className="w-32 h-32" />
      </section>
    </div>
  );
}