// Centralized model exports for the Reality Bracket app

export interface Contestant {
  id: string;
  name: string;
  age: number;
  occupation: string;
  hometown: string;
  imageUrl: string;
  status: 'active' | 'eliminated' | 'jury' | 'final3';
  eliminatedWeek?: number;
  seasonId: string;
}

export interface League {
  id: string;
  name: string;
  seasonId: string;
  createdById: string;
  inviteCode: string;
  createdAt: string;
  draftDate?: string;
  status?: 'not_started' | 'draft_open' | 'draft_closed' | 'completed';
}

export interface LeagueMember {
  id: string;
  leagueId: string;
  userId: string;
  joinedAt: string;
  totalPoints: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface RosterPick {
  id: string;
  userId: string;
  leagueId: string;
  contestantId: string;
  pickType: 'final3' | 'boot';
  weekNumber?: number;
  final3Position?: number;
  activeFromWeek?: number;
  activeThroughWeek?: number;
  pickedAt: string;
}

export interface RosterPickWithContestant extends RosterPick {
  contestant: Contestant | null;
}

export interface Season {
  id: string;
  name: string;
  number: number;
  status: 'active' | 'completed' | 'upcoming';
  startDate: string;
  endDate?: string;
}

export interface LeagueStanding {
  rank: number;
  userId: string;
  username: string;
  points: number;
  change: number;
  leagueId: string;
}

export interface ActivityItem {
  id: string;
  userId: string;
  username: string;
  contestantName: string;
  points: number;
  type: 'immunity' | 'jury' | 'final3' | 'boot' | 'predicted_order';
  week: number;
  leagueId: string;
  createdAt: string;
}

export interface ContestantScore {
  id: string;
  contestantId: string;
  leagueId: string;
  week: number;
  scoreType: 'immunity' | 'jury' | 'final3' | 'boot' | 'predicted_order';
  points: number;
  createdAt: string;
}

// UI-specific types
export interface RosterSlot {
  type: 'final3' | 'boot';
  contestant: Contestant | null;
  points?: number;
  pickId?: string;
  weekNumber?: number;
}
