// Season contestant data - separated for clarity
// In a real app, this would come from an API

import { Contestant } from "./types";

export const season47Contestants: Contestant[] = [
  {
    id: 1,
    name: "Rachel LaMont",
    age: 34,
    occupation: "Graphic Designer",
    tribe: "Gata",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    status: "active",
  },
  {
    id: 2,
    name: "Sam Phalen",
    age: 24,
    occupation: "Sports Reporter",
    tribe: "Lavo",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    status: "active",
  },
  {
    id: 3,
    name: "Genevieve Mushaluk",
    age: 33,
    occupation: "Corporate Lawyer",
    tribe: "Tuku",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    status: "active",
  },
  {
    id: 4,
    name: "Kyle Ostwald",
    age: 31,
    occupation: "Construction Worker",
    tribe: "Tuku",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    status: "eliminated",
    eliminatedEpisode: 9,
  },
  {
    id: 5,
    name: "Andy Rueda",
    age: 31,
    occupation: "AI Researcher",
    tribe: "Gata",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    status: "eliminated",
    eliminatedEpisode: 8,
  },
];

export const season46Contestants: Contestant[] = [
  {
    id: 1,
    name: "Kenzie Petty",
    age: 29,
    occupation: "Salon Owner",
    tribe: "Nami",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    status: "active",
  },
  {
    id: 2,
    name: "Charlie Davis",
    age: 26,
    occupation: "Law Student",
    tribe: "Siga",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    status: "active",
  },
  {
    id: 3,
    name: "Ben Katzman",
    age: 31,
    occupation: "Musician",
    tribe: "Nami",
    image:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop",
    status: "eliminated",
    eliminatedEpisode: 12,
  },
];

export const season45Contestants: Contestant[] = [
  {
    id: 1,
    name: "Dee Valladares",
    age: 26,
    occupation: "Entrepreneur",
    tribe: "Reba",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop",
    status: "active",
  },
  {
    id: 2,
    name: "Austin Li Coon",
    age: 26,
    occupation: "Grad Student",
    tribe: "Belo",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    status: "active",
  },
  {
    id: 3,
    name: "Jake O'Kane",
    age: 26,
    occupation: "Attorney",
    tribe: "Lulu",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    status: "eliminated",
    eliminatedEpisode: 11,
  },
];

export const contestantsBySeason: Record<number, Contestant[]> = {
  47: season47Contestants,
  46: season46Contestants,
  45: season45Contestants,
};
