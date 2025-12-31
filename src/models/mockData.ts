// Mock data for the Reality Bracket app
// In a real app, this would come from an API

import { League, LeagueUser, Contestant, Season, Standing } from "./types";
import { season47Contestants } from "./seasonContestants";

// Export season 47 contestants as allContestants for draft screen
export const allContestants = season47Contestants;

export const leagues: League[] = [
  {
    id: 1,
    name: "Office League",
    season: "Season 47",
    members: 8,
    rank: 2,
    points: 145,
    weekNumber: 9,
  },
  {
    id: 2,
    name: "Family Showdown",
    season: "Season 46",
    members: 6,
    rank: 1,
    points: 203,
    weekNumber: 12,
  },
];

export const leagueUsers: LeagueUser[] = [
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

// User's Final 3 picks for roster screen
export const final3Picks: Contestant[] = [
  {
    id: 1,
    name: "Rachel LaMont",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    tribe: "Gata",
    points: 45,
    status: "active",
  },
  {
    id: 2,
    name: "Sam Phalen",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    tribe: "Lavo",
    points: 32,
    status: "active",
  },
  {
    id: 3,
    name: "Genevieve Mushaluk",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    tribe: "Tuku",
    points: 38,
    status: "active",
  },
];

export const weeklyActivity: Contestant[] = [
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
      final3: [1, 2, 4, 5],
      bottom1: [],
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
  {
    id: 5,
    name: "Andy Rueda",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    events: [
      {
        type: "eliminated",
        label: "Eliminated Episode 9",
        points: 0,
      },
    ],
    totalPoints: 0,
    isEliminated: true,
    selectedBy: {
      final3: [3, 6], // These users had Andy in Final 3 (lost points)
      bottom1: [2, 4], // These users had Andy as Next Boot (won points!)
    },
  },
];

export const bottom1Pick: Contestant = {
  id: 4,
  name: "Kyle Ostwald",
  tribe: "Tuku",
  image:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
  points: 23,
  status: "eliminated",
  eliminatedEpisode: 8,
};

export const takenContestants: { [key: number]: number[] } = {
  1: [2, 3, 4], // Rachel picked by users 2, 3, 4
  2: [1, 3, 6], // Sam picked by users 1, 3, 6
  3: [1, 2, 3, 5, 6], // Genevieve picked by users 1, 2, 3, 5, 6
};

export const seasons: Season[] = [
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

export const standings: Standing[] = [
  {
    id: 1,
    rank: 1,
    previousRank: 2,
    name: "Sarah M.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    points: 198,
    weeklyPoints: 28,
    isCurrentUser: false,
  },
  {
    id: 2,
    rank: 2,
    previousRank: 1,
    name: "You",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    points: 187,
    weeklyPoints: 15,
    isCurrentUser: true,
  },
  {
    id: 3,
    rank: 3,
    previousRank: 3,
    name: "Mike T.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    points: 176,
    weeklyPoints: 22,
    isCurrentUser: false,
  },
  {
    id: 4,
    rank: 4,
    previousRank: 5,
    name: "Jessica L.",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    points: 164,
    weeklyPoints: 31,
    isCurrentUser: false,
  },
  {
    id: 5,
    rank: 5,
    previousRank: 4,
    name: "David K.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    points: 159,
    weeklyPoints: 12,
    isCurrentUser: false,
  },
  {
    id: 6,
    rank: 6,
    previousRank: 6,
    name: "Emma R.",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    points: 143,
    weeklyPoints: 18,
    isCurrentUser: false,
  },
  {
    id: 7,
    rank: 7,
    previousRank: 7,
    name: "Chris P.",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    points: 128,
    weeklyPoints: 9,
    isCurrentUser: false,
  },
  {
    id: 8,
    rank: 8,
    previousRank: 8,
    name: "Lisa W.",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop",
    points: 102,
    weeklyPoints: 14,
    isCurrentUser: false,
  },
];

export const leagueNameSuggestions = [
  "Snuff My Torch, Daddy Probst!",
  "Russelmania",
  "Outwin, Outplay, Outwine",
  "Showmance Society",
  "The Rob-Fathers",
  "Blindsides & Bad Decisions",
  "Honor Alliance from Hell",
  "Go Draw Rocks",
  "Can I Have Your Jacket?",
  "The Rice Negotiators",
  "Tony's Spy Shack",
  "Cops R Us",
  "Bottoms Up Alliance",
  "Operation Italy",
];