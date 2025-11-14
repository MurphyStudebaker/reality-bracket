import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Trophy, Medal, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import LatestActivityDrawer from './LatestActivityDrawer';

const leagues = [
  { id: 1, name: 'Office League', season: 'Season 47', members: 8, weekNumber: 9 },
  { id: 2, name: 'Family Showdown', season: 'Season 46', members: 6, weekNumber: 12 }
];

const tribeColors: Record<string, string> = {
  'Gata': 'bg-yellow-600',
  'Tuku': 'bg-red-600',
  'Lavo': 'bg-blue-600'
};

const eventColors: Record<string, string> = {
  'reward': 'text-lime-400',
  'immunity': 'text-blue-400',
  'negative': 'text-red-400'
};

// League users
const leagueUsers = [
  { id: 1, name: 'Sarah M.', initials: 'SM', color: 'bg-blue-500', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
  { id: 2, name: 'You', initials: 'ME', color: 'bg-[#BFFF0B]', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { id: 3, name: 'Mike T.', initials: 'MT', color: 'bg-purple-500', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
  { id: 4, name: 'Jessica L.', initials: 'JL', color: 'bg-pink-500', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop' },
  { id: 5, name: 'David K.', initials: 'DK', color: 'bg-orange-500', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop' },
  { id: 6, name: 'Emma R.', initials: 'ER', color: 'bg-teal-500', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop' },
  { id: 7, name: 'Chris P.', initials: 'CP', color: 'bg-indigo-500', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop' },
  { id: 8, name: 'Lisa W.', initials: 'LW', color: 'bg-red-500', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop' }
];

const weeklyActivity = [
  {
    id: 1,
    name: 'Kyle Ostwald',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    events: [
      { type: 'reward', label: 'Won Reward Challenge', points: 10 },
      { type: 'immunity', label: 'Safe at Tribal', points: 5 }
    ],
    totalPoints: 15,
    selectedBy: {
      final3: [2, 3, 5, 6],
      bottom1: []
    }
  },
  {
    id: 2,
    name: 'Caroline Vidmar',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    events: [
      { type: 'immunity', label: 'Won Individual Immunity', points: 12 }
    ],
    totalPoints: 12,
    selectedBy: {
      final3: [1, 2, 4, 7],
      bottom1: []
    }
  },
  {
    id: 3,
    name: 'Gabriel "Gabe" Ortis',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    events: [
      { type: 'reward', label: 'Participated in Reward', points: 5 },
      { type: 'immunity', label: 'Safe at Tribal', points: 3 }
    ],
    totalPoints: 8,
    selectedBy: {
      final3: [2, 5, 8],
      bottom1: []
    }
  },
  {
    id: 4,
    name: 'Sue (Susan) Smey',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    events: [
      { type: 'immunity', label: 'Safe at Tribal', points: 5 }
    ],
    totalPoints: 5,
    selectedBy: {
      final3: [3, 6],
      bottom1: []
    }
  },
  {
    id: 5,
    name: 'Andy (Andrew) Rueda',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    events: [
      { type: 'eliminated', label: 'Eliminated Episode 9', points: 0 }
    ],
    totalPoints: 0,
    isEliminated: true,
    selectedBy: {
      final3: [1, 4],
      bottom1: [2, 3, 5]
    }
  }
];

const standings = [
  {
    id: 1,
    rank: 1,
    previousRank: 2,
    name: 'Sarah M.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    points: 198,
    weeklyPoints: 28,
    isCurrentUser: false
  },
  {
    id: 2,
    rank: 2,
    previousRank: 1,
    name: 'You',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    points: 187,
    weeklyPoints: 15,
    isCurrentUser: true
  },
  {
    id: 3,
    rank: 3,
    previousRank: 3,
    name: 'Mike T.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    points: 176,
    weeklyPoints: 22,
    isCurrentUser: false
  },
  {
    id: 4,
    rank: 4,
    previousRank: 5,
    name: 'Jessica L.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    points: 164,
    weeklyPoints: 31,
    isCurrentUser: false
  },
  {
    id: 5,
    rank: 5,
    previousRank: 4,
    name: 'David K.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    points: 159,
    weeklyPoints: 12,
    isCurrentUser: false
  },
  {
    id: 6,
    rank: 6,
    previousRank: 6,
    name: 'Emma R.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
    points: 143,
    weeklyPoints: 18,
    isCurrentUser: false
  },
  {
    id: 7,
    rank: 7,
    previousRank: 7,
    name: 'Chris P.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
    points: 128,
    weeklyPoints: 9,
    isCurrentUser: false
  },
  {
    id: 8,
    rank: 8,
    previousRank: 8,
    name: 'Lisa W.',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop',
    points: 102,
    weeklyPoints: 14,
    isCurrentUser: false
  }
];

interface LeagueScreenProps {
  initialLeagueId?: number;
}

export default function LeagueScreen({ initialLeagueId = 1 }: LeagueScreenProps) {
  const [selectedLeague, setSelectedLeague] = useState(initialLeagueId.toString());
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const currentLeague = leagues.find(l => l.id === parseInt(selectedLeague));

  return (
    <div className="p-4 space-y-6">
      {/* League Header */}
      <div className="space-y-2">
        <Select value={selectedLeague} onValueChange={setSelectedLeague}>
          <SelectTrigger className="w-full bg-transparent border-none text-white p-0 h-auto hover:bg-transparent [&>svg]:hidden">
            <div className="flex items-center gap-2">
              <h1 className="text-white text-3xl">{currentLeague?.name}</h1>
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
                <div className="flex items-center justify-between w-full gap-3">
                  <span>{league.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-lime-400 text-slate-900 text-xs">{league.season}</Badge>
                    <span className="text-xs text-slate-400">Week {league.weekNumber}</span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-400">{currentLeague?.season}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Week {currentLeague?.weekNumber}</span>
        </div>
      </div>

      {/* Podium - Top 3 */}
      <div className="flex items-end justify-center gap-2 px-4">
        {/* 2nd Place */}
        <div className="flex-1 flex flex-col items-center">
          <Medal className="w-6 h-6 text-slate-400 mb-2" />
          <Avatar className="w-14 h-14 border-2 border-slate-600 mb-2">
            <AvatarImage src={leagueUsers[1].image} alt={leagueUsers[1].name} />
            <AvatarFallback>{leagueUsers[1].initials}</AvatarFallback>
          </Avatar>
          <p className="text-xs text-white">{leagueUsers[1].name}</p>
          <p className="text-sm text-lime-400">{weeklyActivity[1].totalPoints}</p>
          <div className="w-full bg-slate-700 rounded-t-lg h-20 mt-2 flex items-center justify-center text-white">
            <span className="text-2xl">2</span>
          </div>
        </div>

        {/* 1st Place */}
        <div className="flex-1 flex flex-col items-center">
          <Trophy className="w-8 h-8 text-lime-400 mb-2" />
          <Avatar className="w-16 h-16 border-2 border-lime-400 mb-2">
            <AvatarImage src={leagueUsers[0].image} alt={leagueUsers[0].name} />
            <AvatarFallback>{leagueUsers[0].initials}</AvatarFallback>
          </Avatar>
          <p className="text-xs text-white">{leagueUsers[0].name}</p>
          <p className="text-sm text-lime-400">{weeklyActivity[0].totalPoints}</p>
          <div className="w-full bg-gradient-to-t from-lime-500 to-lime-400 rounded-t-lg h-28 mt-2 flex items-center justify-center text-slate-900">
            <span className="text-3xl">1</span>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="flex-1 flex flex-col items-center">
          <Medal className="w-6 h-6 text-amber-700 mb-2" />
          <Avatar className="w-14 h-14 border-2 border-amber-700 mb-2">
            <AvatarImage src={leagueUsers[2].image} alt={leagueUsers[2].name} />
            <AvatarFallback>{leagueUsers[2].initials}</AvatarFallback>
          </Avatar>
          <p className="text-xs text-white">{leagueUsers[2].name}</p>
          <p className="text-sm text-lime-400">{weeklyActivity[2].totalPoints}</p>
          <div className="w-full bg-slate-700 rounded-t-lg h-16 mt-2 flex items-center justify-center text-white">
            <span className="text-2xl">3</span>
          </div>
        </div>
      </div>

      {/* Latest Activity Button */}
      <LatestActivityDrawer
        isOpen={isActivityOpen}
        onOpenChange={setIsActivityOpen}
        weeklyActivity={weeklyActivity}
        leagueUsers={leagueUsers}
        weekNumber={currentLeague?.weekNumber}
      />

      {/* Full Standings */}
      <section>
        <h2 className="text-white mb-3">Full Standings</h2>
        <div className="space-y-2">
          {standings.map((user) => {
            const rankChange = user.previousRank - user.rank;
            return (
              <Card
                key={user.id}
                className={`p-4 ${
                  user.isCurrentUser
                    ? 'bg-slate-800/80 border-lime-400/40 border-2 shadow-[0_2px_12px_rgba(163,230,53,0.15)] rounded-xl'
                    : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.4)] rounded-xl'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className="w-8 text-center">
                    <span className={`${user.rank <= 3 ? 'text-lime-400' : 'text-slate-400'}`}>
                      {user.rank}
                    </span>
                  </div>

                  {/* Rank Change Indicator */}
                  <div className="w-5">
                    {rankChange > 0 ? (
                      <TrendingUp className="w-4 h-4 text-lime-400" />
                    ) : rankChange < 0 ? (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    ) : (
                      <div className="w-4 h-0.5 bg-slate-700" />
                    )}
                  </div>

                  {/* Avatar and Name */}
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-white">{user.name}</p>
                    <p className="text-xs text-slate-500">
                      +{user.weeklyPoints} this week
                    </p>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <p className="text-lime-400">{user.points}</p>
                    <p className="text-xs text-slate-500">pts</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* League Stats */}
      <Card className="p-4 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <h3 className="text-white mb-3">League Stats</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl text-lime-400">{standings[0].points}</p>
            <p className="text-xs text-slate-400">Highest Score</p>
          </div>
          <div>
            <p className="text-2xl text-lime-400">
              {Math.round(standings.reduce((sum, u) => sum + u.points, 0) / standings.length)}
            </p>
            <p className="text-xs text-slate-400">Average Score</p>
          </div>
        </div>
      </Card>
    </div>
  );
}