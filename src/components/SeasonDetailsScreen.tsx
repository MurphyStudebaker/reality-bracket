import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface Contestant {
  id: number;
  name: string;
  age: number;
  occupation: string;
  tribe: string;
  image: string;
  status: 'active' | 'eliminated';
  eliminatedEpisode?: number;
}

interface Season {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  status: string;
}

const season47Contestants: Contestant[] = [
  {
    id: 1,
    name: 'Rachel LaMont',
    age: 34,
    occupation: 'Graphic Designer',
    tribe: 'Gata',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    status: 'active'
  },
  {
    id: 2,
    name: 'Sam Phalen',
    age: 24,
    occupation: 'Sports Reporter',
    tribe: 'Lavo',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    status: 'active'
  },
  {
    id: 3,
    name: 'Genevieve Mushaluk',
    age: 33,
    occupation: 'Corporate Lawyer',
    tribe: 'Tuku',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    status: 'active'
  },
  {
    id: 4,
    name: 'Teeny Chirichillo',
    age: 24,
    occupation: 'Freelance Writer',
    tribe: 'Lavo',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    status: 'active'
  },
  {
    id: 5,
    name: 'Sue Smey',
    age: 59,
    occupation: 'Flight Attendant',
    tribe: 'Tuku',
    image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200&h=200&fit=crop',
    status: 'active'
  },
  {
    id: 6,
    name: 'Kyle Ostwald',
    age: 31,
    occupation: 'Construction Worker',
    tribe: 'Tuku',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    status: 'eliminated',
    eliminatedEpisode: 8
  },
  {
    id: 7,
    name: 'Gabe Ortis',
    age: 26,
    occupation: 'Radio Host',
    tribe: 'Tuku',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
    status: 'eliminated',
    eliminatedEpisode: 7
  },
  {
    id: 8,
    name: 'Caroline Vidmar',
    age: 27,
    occupation: 'Strategy Consultant',
    tribe: 'Lavo',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
    status: 'eliminated',
    eliminatedEpisode: 6
  },
  {
    id: 9,
    name: 'Sol Yi',
    age: 43,
    occupation: 'Medical Device Sales',
    tribe: 'Gata',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    status: 'eliminated',
    eliminatedEpisode: 5
  },
  {
    id: 10,
    name: 'Tiyana Hallums',
    age: 27,
    occupation: 'Flight Attendant',
    tribe: 'Lavo',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop',
    status: 'eliminated',
    eliminatedEpisode: 4
  }
];

const season46Contestants: Contestant[] = [
  {
    id: 1,
    name: 'Kenzie Petty',
    age: 29,
    occupation: 'Salon Owner',
    tribe: 'Yanu',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
    status: 'eliminated',
    eliminatedEpisode: 14
  },
  {
    id: 2,
    name: 'Charlie Davis',
    age: 26,
    occupation: 'Law Student',
    tribe: 'Siga',
    image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop',
    status: 'eliminated',
    eliminatedEpisode: 14
  },
  {
    id: 3,
    name: 'Ben Katzman',
    age: 31,
    occupation: 'Musician',
    tribe: 'Yanu',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop',
    status: 'eliminated',
    eliminatedEpisode: 13
  },
  {
    id: 4,
    name: 'Maria Gonzalez',
    age: 48,
    occupation: 'Parent Coach',
    tribe: 'Siga',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop',
    status: 'eliminated',
    eliminatedEpisode: 12
  },
  {
    id: 5,
    name: 'Liz Wilcox',
    age: 35,
    occupation: 'Marketing Strategist',
    tribe: 'Nami',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
    status: 'eliminated',
    eliminatedEpisode: 11
  },
  {
    id: 6,
    name: 'Q Burdette',
    age: 31,
    occupation: 'Real Estate Agent',
    tribe: 'Yanu',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop',
    status: 'eliminated',
    eliminatedEpisode: 10
  }
];

const season45Contestants: Contestant[] = [
  {
    id: 1,
    name: 'Dee Valladares',
    age: 26,
    occupation: 'Entrepreneur',
    tribe: 'Reba',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    status: 'eliminated',
    eliminatedEpisode: 14
  },
  {
    id: 2,
    name: 'Austin Li Coon',
    age: 26,
    occupation: 'Brand Manager',
    tribe: 'Reba',
    image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&h=200&fit=crop',
    status: 'eliminated',
    eliminatedEpisode: 14
  },
  {
    id: 3,
    name: 'Jake OKane',
    age: 26,
    occupation: 'Competitive Eater',
    tribe: 'Belo',
    image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&h=200&fit=crop',
    status: 'eliminated',
    eliminatedEpisode: 13
  },
  {
    id: 4,
    name: 'Katurah Topps',
    age: 35,
    occupation: 'Attorney',
    tribe: 'Lulu',
    image: 'https://images.unsplash.com/photo-1551843073-4a9a5b6fcd5f?w=200&h=200&fit=crop',
    status: 'eliminated',
    eliminatedEpisode: 12
  },
  {
    id: 5,
    name: 'Julie Alley',
    age: 47,
    occupation: 'Lawyer',
    tribe: 'Belo',
    image: 'https://images.unsplash.com/photo-1546539782-6fc531453083?w=200&h=200&fit=crop',
    status: 'eliminated',
    eliminatedEpisode: 11
  }
];

const contestantsBySeason: Record<number, Contestant[]> = {
  47: season47Contestants,
  46: season46Contestants,
  45: season45Contestants
};

const tribeColors: Record<string, string> = {
  'Gata': 'bg-yellow-500',
  'Lavo': 'bg-purple-500',
  'Tuku': 'bg-blue-500',
  'Yanu': 'bg-red-500',
  'Siga': 'bg-green-500',
  'Nami': 'bg-cyan-500',
  'Reba': 'bg-orange-500',
  'Belo': 'bg-pink-500',
  'Lulu': 'bg-indigo-500'
};

interface SeasonDetailsScreenProps {
  season: Season;
  onBack: () => void;
}

export default function SeasonDetailsScreen({ season, onBack }: SeasonDetailsScreenProps) {
  const contestants = contestantsBySeason[season.id] || [];
  const activeContestants = contestants.filter(c => c.status === 'active');
  const eliminatedContestants = contestants.filter(c => c.status === 'eliminated').sort((a, b) => 
    (b.eliminatedEpisode || 0) - (a.eliminatedEpisode || 0)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-slate-900 via-slate-900 to-transparent pb-4 pt-4 px-4">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-white hover:bg-slate-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-start gap-4">
          <img
            src={season.image}
            alt={season.title}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-white">{season.title}</h1>
              {season.status === 'live' && (
                <Badge className="bg-lime-400 text-slate-900 text-xs">LIVE</Badge>
              )}
            </div>
            <p className="text-slate-400 text-sm">{season.subtitle}</p>
            <div className="flex gap-4 mt-3 text-sm">
              <div>
                <span className="text-lime-400">{activeContestants.length}</span>
                <span className="text-slate-400"> remaining</span>
              </div>
              <div>
                <span className="text-slate-400">{eliminatedContestants.length}</span>
                <span className="text-slate-500"> eliminated</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-8 pb-6">
        {/* Active Contestants */}
        {activeContestants.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white">Still in the Game</h2>
              <Badge className="bg-lime-400/20 text-lime-400 border border-lime-400/30">
                {activeContestants.length} Active
              </Badge>
            </div>
            <div className="space-y-3">
              {activeContestants.map((contestant) => (
                <Card key={contestant.id} className="p-4 bg-slate-900/80 border-slate-800 hover:bg-slate-900 hover:border-slate-700 transition-all backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-14 h-14 border-2 border-lime-400/30">
                      <AvatarImage src={contestant.image} alt={contestant.name} />
                      <AvatarFallback>{contestant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-white">{contestant.name}</h3>
                      <p className="text-sm text-slate-400">{contestant.age} • {contestant.occupation}</p>
                      <Badge className={`${tribeColors[contestant.tribe]} text-white text-xs mt-1`}>
                        {contestant.tribe}
                      </Badge>
                    </div>
                    <Badge className="bg-lime-400 text-slate-900 text-xs">
                      Active
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Eliminated Contestants */}
        {eliminatedContestants.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white">Eliminated</h2>
              <Badge variant="outline" className="border-slate-700 text-slate-400">
                {eliminatedContestants.length} Voted Out
              </Badge>
            </div>
            <div className="space-y-3">
              {eliminatedContestants.map((contestant) => (
                <Card key={contestant.id} className="p-4 bg-slate-900/50 border-slate-800 backdrop-blur-sm opacity-75">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-14 h-14 border-2 border-slate-700 grayscale opacity-60">
                      <AvatarImage src={contestant.image} alt={contestant.name} />
                      <AvatarFallback>{contestant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-slate-300">{contestant.name}</h3>
                      <p className="text-sm text-slate-500">{contestant.age} • {contestant.occupation}</p>
                      <Badge className={`${tribeColors[contestant.tribe]} text-white text-xs mt-1 opacity-60`}>
                        {contestant.tribe}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="border-slate-700 text-slate-500 text-xs">
                      Ep {contestant.eliminatedEpisode}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
