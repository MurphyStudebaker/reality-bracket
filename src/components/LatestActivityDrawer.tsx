import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Trophy, X, Activity } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';

// Types
interface LeagueUser {
  id: number;
  name: string;
  initials: string;
  color: string;
  image: string;
}

interface ContestantEvent {
  type: string;
  label: string;
  points: number;
}

interface Contestant {
  id: number;
  name: string;
  image: string;
  events: ContestantEvent[];
  totalPoints: number;
  isEliminated?: boolean;
  selectedBy: {
    final3: number[];
    bottom1: number[];
  };
}

interface LatestActivityDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  weekNumber?: number;
  weeklyActivity: Contestant[];
  leagueUsers: LeagueUser[];
  buttonVariant?: 'outline' | 'default';
  buttonClassName?: string;
}

const eventColors: Record<string, string> = {
  immunity: 'text-blue-400',
  strategic: 'text-purple-400',
  reward: 'text-[#BFFF0B]',
  eliminated: 'text-red-400',
};

export default function LatestActivityDrawer({
  isOpen,
  onOpenChange,
  weekNumber,
  weeklyActivity,
  leagueUsers,
  buttonVariant = 'outline',
  buttonClassName = 'w-full border-slate-700 hover:bg-slate-800 text-slate-300'
}: LatestActivityDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant={buttonVariant} className={buttonClassName}>
          <Activity className="w-4 h-4 mr-2" />
          <span className="font-semibold">Latest Activity</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="bg-slate-900 border-slate-800 max-h-[85vh] overflow-y-auto px-4 py-2"
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="text-white text-4xl font-bold">
            The Tribe Has Spoken
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4 pb-6">
          {weeklyActivity.map((contestant) => (
            <Card
              key={contestant.id}
              className={`p-4 ${
                contestant.isEliminated
                  ? 'bg-red-950/30 border-red-900/50'
                  : 'bg-slate-800/60 border-slate-700/50'
              } rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.4)]`}
            >
              <div className="space-y-3">
                {/* Contestant Header */}
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar
                      className={`w-12 h-12 border-2 ${
                        contestant.isEliminated
                          ? 'border-red-900 opacity-60'
                          : 'border-slate-700'
                      }`}
                    >
                      <AvatarImage src={contestant.image} alt={contestant.name} />
                      <AvatarFallback>
                        {contestant.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    {contestant.isEliminated && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <X className="w-6 h-6 text-red-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{contestant.name}</h4>
                    <div className="space-y-1 mt-2">
                      {contestant.events.map((event, idx) => (
                        <div key={idx} className="text-sm">
                          <span className={eventColors[event.type]}>{event.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={`${
                        contestant.isEliminated
                          ? 'bg-red-900 text-red-200'
                          : 'bg-[#BFFF0B] text-black'
                      } font-bold`}
                    >
                      {contestant.isEliminated ? 'ELIMINATED' : `+${contestant.totalPoints}`}
                    </Badge>
                  </div>
                </div>

                {/* User Selections */}
                <div className="space-y-2 pt-2 border-t border-slate-700/50">
                  {/* Final 3 Selections */}
                  {contestant.selectedBy.final3.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 min-w-[80px]">
                        <Trophy className="w-3 h-3 text-[#BFFF0B]" />
                        <span className="text-xs text-slate-400 font-semibold">Final 3</span>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {contestant.selectedBy.final3.map((userId) => {
                          const user = leagueUsers.find((u) => u.id === userId);
                          return user ? (
                            <div key={userId} className="relative group">
                              <Avatar
                                className={`w-6 h-6 border ${
                                  contestant.isEliminated
                                    ? 'border-red-500'
                                    : 'border-[#BFFF0B]'
                                }`}
                              >
                                <AvatarImage src={user.image} alt={user.name} />
                                <AvatarFallback
                                  className={`text-[10px] ${user.color} text-white`}
                                >
                                  {user.initials}
                                </AvatarFallback>
                              </Avatar>
                              {/* Tooltip on hover */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                                {user.name}
                              </div>
                            </div>
                          ) : null;
                        })}
                        {contestant.isEliminated && (
                          <span className="text-xs text-red-400 ml-1">Lost points</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bottom 1 Selections */}
                  {contestant.selectedBy.bottom1.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 min-w-[80px]">
                        <X className="w-3 h-3 text-red-400" />
                        <span className="text-xs text-slate-400 font-semibold">Next Boot</span>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {contestant.selectedBy.bottom1.map((userId) => {
                          const user = leagueUsers.find((u) => u.id === userId);
                          return user ? (
                            <div key={userId} className="relative group">
                              <Avatar className="w-6 h-6 border border-[#BFFF0B]">
                                <AvatarImage src={user.image} alt={user.name} />
                                <AvatarFallback
                                  className={`text-[10px] ${user.color} text-white`}
                                >
                                  {user.initials}
                                </AvatarFallback>
                              </Avatar>
                              {/* Tooltip on hover */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                                {user.name}
                              </div>
                            </div>
                          ) : null;
                        })}
                        {contestant.isEliminated && (
                          <span className="text-xs text-[#BFFF0B] ml-1">Earned points</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
