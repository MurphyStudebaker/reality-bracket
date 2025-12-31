// Core data types for the Reality Bracket app

export interface League {
  id: number;
  name: string;
  season: string;
  members?: number;
  rank?: number;
  points?: number;
  weekNumber?: number;
}

export interface LeagueUser {
  id: number;
  name: string;
  initials: string;
  color: string;
  image: string;
}

export interface ContestantEvent {
  type: string;
  label: string;
  points: number;
}

export interface SelectedBy {
  final3: number[];
  bottom1: number[];
}

export interface Contestant {
  id: number;
  name: string;
  tribe?: string;
  image: string | null;
  isEliminated?: boolean;
  totalPoints?: number;
  events?: ContestantEvent[];
  selectedBy?: SelectedBy;
  points?: number;
  status?: string;
  eliminatedEpisode?: number;
}

export interface Season {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  status: "live" | "completed" | "archived";
  leagues: number;
}

export interface Standing {
  id: number;
  rank: number;
  previousRank: number;
  name: string;
  avatar: string;
  points: number;
  weeklyPoints: number;
  isCurrentUser: boolean;
}

export type SpotType = "final3" | "bottom1";