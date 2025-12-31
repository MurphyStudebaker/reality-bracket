// Survivor Season 47 Contestants
export interface Contestant {
  id: string;
  name: string;
  age: number;
  occupation: string;
  hometown: string;
  imageUrl: string;
  status: 'active' | 'eliminated' | 'jury' | 'final3';
  eliminatedWeek?: number;
}

export interface League {
  id: string;
  name: string;
  season: string;
  memberCount: number;
  inviteCode: string;
}

export interface RosterSlot {
  type: 'final3' | 'boot';
  contestant: Contestant | null;
}

export interface LeagueStanding {
  rank: number;
  userId: string;
  username: string;
  points: number;
  change: number;
}

export interface ActivityItem {
  userId: string;
  username: string;
  contestantName: string;
  points: number;
  type: 'final3' | 'boot';
  week: number;
}

export const contestants: Contestant[] = [
  {
    id: '1',
    name: 'Rachel LaMont',
    age: 34,
    occupation: 'Graphic Designer',
    hometown: 'Southfield, MI',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    status: 'final3',
  },
  {
    id: '2',
    name: 'Sam Phalen',
    age: 24,
    occupation: 'Sports Reporter',
    hometown: 'Schaumburg, IL',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    status: 'final3',
  },
  {
    id: '3',
    name: 'Sue Smey',
    age: 59,
    occupation: 'Flight Attendant',
    hometown: 'Putnam Valley, NY',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    status: 'final3',
  },
  {
    id: '4',
    name: 'Teeny Chirichillo',
    age: 24,
    occupation: 'Freelance Writer',
    hometown: 'Manahawkin, NJ',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    status: 'jury',
    eliminatedWeek: 13,
  },
  {
    id: '5',
    name: 'Caroline Vidmar',
    age: 27,
    occupation: 'Strategy Consultant',
    hometown: 'Palos Verdes, CA',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    status: 'jury',
    eliminatedWeek: 12,
  },
  {
    id: '6',
    name: 'Genevieve Mushaluk',
    age: 33,
    occupation: 'Corporate Lawyer',
    hometown: 'Winnipeg, Manitoba',
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
    status: 'jury',
    eliminatedWeek: 11,
  },
  {
    id: '7',
    name: 'Kyle Ostwald',
    age: 31,
    occupation: 'Construction Worker',
    hometown: 'Cheboygan, MI',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    status: 'jury',
    eliminatedWeek: 10,
  },
  {
    id: '8',
    name: 'Gabe Ortis',
    age: 26,
    occupation: 'Radio Show Host',
    hometown: 'Baltimore, MD',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    status: 'jury',
    eliminatedWeek: 9,
  },
  {
    id: '9',
    name: 'Sierra Wright',
    age: 27,
    occupation: 'Nurse',
    hometown: 'Phoenixville, PA',
    imageUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
    status: 'active',
  },
  {
    id: '10',
    name: 'Andy Rueda',
    age: 31,
    occupation: 'AI Research Assistant',
    hometown: 'Buffalo, NY',
    imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400',
    status: 'active',
  },
  {
    id: '11',
    name: 'Anika Dhar',
    age: 26,
    occupation: 'Marketing Manager',
    hometown: 'Los Angeles, CA',
    imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
    status: 'eliminated',
    eliminatedWeek: 8,
  },
  {
    id: '12',
    name: 'Rome Cooney',
    age: 30,
    occupation: 'E-Bike Salesman',
    hometown: 'Phoenix, AZ',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
    status: 'eliminated',
    eliminatedWeek: 7,
  },
];

export const myLeagues: League[] = [
  {
    id: '1',
    name: 'Survivor Superfans',
    season: 'Season 47',
    memberCount: 12,
    inviteCode: 'SURF47',
  },
  {
    id: '2',
    name: 'Family League',
    season: 'Season 47',
    memberCount: 6,
    inviteCode: 'FAM123',
  },
];

export const availableSeasons = [
  { id: 's47', name: 'Season 47', status: 'active' as const },
  { id: 's46', name: 'Season 46', status: 'completed' as const },
  { id: 's45', name: 'Season 45', status: 'completed' as const },
];

export const myRoster: RosterSlot[] = [
  { type: 'final3', contestant: contestants[0] },
  { type: 'final3', contestant: null },
  { type: 'final3', contestant: contestants[2] },
  { type: 'boot', contestant: null },
];

export const leagueStandings: LeagueStanding[] = [
  { rank: 1, userId: '1', username: 'SurvivorFan2024', points: 125, change: 2 },
  { rank: 2, userId: '2', username: 'OutwitOutplay', points: 118, change: -1 },
  { rank: 3, userId: '3', username: 'JeffProbstFan', points: 112, change: 1 },
  { rank: 4, userId: '4', username: 'TribalCouncil', points: 105, change: -2 },
  { rank: 5, userId: '5', username: 'ImmunityIdol', points: 98, change: 0 },
  { rank: 6, userId: '6', username: 'TorchSnuffer', points: 92, change: 1 },
  { rank: 7, userId: '7', username: 'MergeBuffs', points: 87, change: -1 },
  { rank: 8, userId: '8', username: 'HiddenImmunity', points: 81, change: 0 },
];

export const latestActivity: ActivityItem[] = [
  // Final 3 eliminations (users lost points)
  { userId: '2', username: 'OutwitOutplay', contestantName: 'Teeny Chirichillo', points: -15, type: 'final3', week: 13 },
  { userId: '4', username: 'TribalCouncil', contestantName: 'Caroline Vidmar', points: -20, type: 'final3', week: 12 },
  
  // Next Boot correct predictions (users won points)
  { userId: '1', username: 'SurvivorFan2024', contestantName: 'Teeny Chirichillo', points: 15, type: 'boot', week: 13 },
  { userId: '3', username: 'JeffProbstFan', contestantName: 'Teeny Chirichillo', points: 15, type: 'boot', week: 13 },
  { userId: '6', username: 'TorchSnuffer', contestantName: 'Caroline Vidmar', points: 15, type: 'boot', week: 12 },
];