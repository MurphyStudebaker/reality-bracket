import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import SeasonDetailsScreen from "./SeasonDetailsScreen";
import { useHomeViewModel } from "../viewmodels/useHomeViewModel";
import { LeagueCard } from "./home/LeagueCard";
import { JoinLeagueForm } from "./home/JoinLeagueForm";
import { CreateLeagueForm } from "./home/CreateLeagueForm";
import logo from "figma:asset/5e41f5472fd718170d569caca90dd28328e9a3c6.png";

interface HomeScreenProps {
  onLeagueClick: (leagueId: number) => void;
}

export default function HomeScreen({ onLeagueClick }: HomeScreenProps) {
  const viewModel = useHomeViewModel();

  if (viewModel.viewingSeason) {
    return (
      <SeasonDetailsScreen
        season={viewModel.viewingSeason}
        onBack={viewModel.handleBackFromSeason}
      />
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Create/Join League Button */}
      <Sheet open={viewModel.isSheetOpen} onOpenChange={viewModel.setIsSheetOpen}>
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

          <Tabs
            defaultValue="join"
            value={viewModel.activeTab}
            onValueChange={viewModel.setActiveTab}
            className="mt-6"
          >
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
            <TabsContent value="join">
              <JoinLeagueForm
                inviteCode={viewModel.inviteCode}
                onInviteCodeChange={viewModel.setInviteCode}
                onSubmit={viewModel.handleJoinLeague}
                canSubmit={viewModel.canJoinLeague}
              />
            </TabsContent>

            {/* Create League Tab */}
            <TabsContent value="create">
              <CreateLeagueForm
                leagueName={viewModel.leagueName}
                selectedSeason={viewModel.selectedSeason}
                draftDate={viewModel.draftDate}
                seasons={viewModel.availableSeasonsForCreate}
                onLeagueNameChange={viewModel.setLeagueName}
                onSeasonSelect={viewModel.handleSeasonSelect}
                onDraftDateChange={viewModel.handleDraftDateChange}
                onSubmit={viewModel.handleCreateLeague}
                canSubmit={viewModel.canCreateLeague}
              />
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
            {viewModel.myLeagues.length} Active
          </Badge>
        </div>
        <div className="space-y-3">
          {viewModel.isLoadingLeagues ? (
            <div className="text-center text-neutral-400 py-8">Loading your leagues...</div>
          ) : viewModel.myLeagues.length === 0 ? (
            <div className="text-center text-neutral-400 py-8">
              You haven't joined any leagues yet. Create or join a league to get started!
            </div>
          ) : (
            viewModel.myLeagues.map((league) => (
              <LeagueCard
                key={league.id}
                league={league}
                onClick={onLeagueClick}
              />
            ))
          )}
        </div>
      </section>

      {/* Logo Section */}
      <section className="flex justify-center py-8">
        <img src={logo} alt="Reality Bracket Logo" className="w-32 h-32" />
      </section>
    </div>
  );
}
