// Supabase Service Layer
// This file handles all database operations with Supabase

import type {
  Contestant,
  League,
  LeagueMember,
  User,
  RosterPick,
  Season,
  LeagueStanding,
  ActivityItem,
  ContestantScore,
} from '../models';

// Supabase client will be initialized here
// import { createClient } from '@supabase/supabase-js'
// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export class SupabaseService {
  // USER OPERATIONS
  static async getCurrentUser(): Promise<User | null> {
    // TODO: Connect to Supabase
    // const { data: { user } } = await supabase.auth.getUser()
    // const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
    // return data
    return null;
  }

  static async signUp(email: string, password: string, username: string): Promise<User | null> {
    // TODO: Connect to Supabase
    // const { data: { user } } = await supabase.auth.signUp({ email, password })
    // await supabase.from('users').insert({ id: user.id, email, username })
    return null;
  }

  static async signIn(email: string, password: string): Promise<User | null> {
    // TODO: Connect to Supabase
    // const { data: { user } } = await supabase.auth.signInWithPassword({ email, password })
    return null;
  }

  static async signOut(): Promise<void> {
    // TODO: Connect to Supabase
    // await supabase.auth.signOut()
  }

  // LEAGUE OPERATIONS
  static async getLeaguesByUserId(userId: string): Promise<League[]> {
    // TODO: Connect to Supabase
    // const { data } = await supabase
    //   .from('league_members')
    //   .select('leagues(*)')
    //   .eq('user_id', userId)
    // return data
    return [];
  }

  static async createLeague(
    name: string,
    seasonId: string,
    userId: string,
    draftDate?: string
  ): Promise<League | null> {
    // TODO: Connect to Supabase
    // Generate invite code
    // const inviteCode = generateInviteCode()
    // const { data } = await supabase.from('leagues').insert({
    //   name,
    //   season_id: seasonId,
    //   created_by_id: userId,
    //   invite_code: inviteCode,
    //   draft_date: draftDate
    // }).select().single()
    // Add creator as member
    // await supabase.from('league_members').insert({
    //   league_id: data.id,
    //   user_id: userId
    // })
    return null;
  }

  static async joinLeagueByInviteCode(inviteCode: string, userId: string): Promise<League | null> {
    // TODO: Connect to Supabase
    // const { data: league } = await supabase
    //   .from('leagues')
    //   .select('*')
    //   .eq('invite_code', inviteCode)
    //   .single()
    // await supabase.from('league_members').insert({
    //   league_id: league.id,
    //   user_id: userId
    // })
    return null;
  }

  static async getLeagueMemberCount(leagueId: string): Promise<number> {
    // TODO: Connect to Supabase
    // const { count } = await supabase
    //   .from('league_members')
    //   .select('*', { count: 'exact', head: true })
    //   .eq('league_id', leagueId)
    // return count || 0
    return 0;
  }

  // SEASON OPERATIONS
  static async getSeasons(): Promise<Season[]> {
    // TODO: Connect to Supabase
    // const { data } = await supabase.from('seasons').select('*').order('number', { ascending: false })
    // return data
    return [];
  }

  static async getSeasonById(seasonId: string): Promise<Season | null> {
    // TODO: Connect to Supabase
    // const { data } = await supabase.from('seasons').select('*').eq('id', seasonId).single()
    // return data
    return null;
  }

  // CONTESTANT OPERATIONS
  static async getContestantsBySeason(seasonId: string): Promise<Contestant[]> {
    // TODO: Connect to Supabase
    // const { data } = await supabase
    //   .from('contestants')
    //   .select('*')
    //   .eq('season_id', seasonId)
    //   .order('name')
    // return data
    return [];
  }

  static async updateContestantStatus(
    contestantId: string,
    status: string,
    eliminatedWeek?: number
  ): Promise<void> {
    // TODO: Connect to Supabase
    // await supabase.from('contestants').update({
    //   status,
    //   eliminated_week: eliminatedWeek
    // }).eq('id', contestantId)
  }

  // ROSTER OPERATIONS
  static async getRosterByUserAndLeague(userId: string, leagueId: string): Promise<RosterPick[]> {
    // TODO: Connect to Supabase
    // const { data } = await supabase
    //   .from('roster_picks')
    //   .select('*, contestants(*)')
    //   .eq('user_id', userId)
    //   .eq('league_id', leagueId)
    // return data
    return [];
  }

  static async addRosterPick(
    userId: string,
    leagueId: string,
    contestantId: string,
    pickType: 'final3' | 'boot'
  ): Promise<RosterPick | null> {
    // TODO: Connect to Supabase
    // const { data } = await supabase.from('roster_picks').insert({
    //   user_id: userId,
    //   league_id: leagueId,
    //   contestant_id: contestantId,
    //   pick_type: pickType
    // }).select().single()
    // return data
    return null;
  }

  static async removeRosterPick(pickId: string): Promise<void> {
    // TODO: Connect to Supabase
    // await supabase.from('roster_picks').delete().eq('id', pickId)
  }

  static async updateRosterPick(pickId: string, contestantId: string): Promise<void> {
    // TODO: Connect to Supabase
    // await supabase.from('roster_picks').update({
    //   contestant_id: contestantId
    // }).eq('id', pickId)
  }

  // STANDINGS OPERATIONS
  static async getLeagueStandings(leagueId: string): Promise<LeagueStanding[]> {
    // TODO: Connect to Supabase
    // This would involve a complex query joining league_members, users, and calculating points
    // const { data } = await supabase
    //   .from('league_members')
    //   .select('*, users(username), roster_picks(contestants(contestant_scores(*)))')
    //   .eq('league_id', leagueId)
    // Calculate rankings and points
    return [];
  }

  // ACTIVITY OPERATIONS
  static async getLeagueActivity(leagueId: string, limit: number = 20): Promise<ActivityItem[]> {
    // TODO: Connect to Supabase
    // const { data } = await supabase
    //   .from('activity_items')
    //   .select('*, users(username), contestants(name)')
    //   .eq('league_id', leagueId)
    //   .order('created_at', { ascending: false })
    //   .limit(limit)
    // return data
    return [];
  }

  static async recordActivity(
    userId: string,
    leagueId: string,
    contestantId: string,
    points: number,
    type: string,
    week: number
  ): Promise<void> {
    // TODO: Connect to Supabase
    // await supabase.from('activity_items').insert({
    //   user_id: userId,
    //   league_id: leagueId,
    //   contestant_id: contestantId,
    //   points,
    //   type,
    //   week
    // })
  }

  // SCORING OPERATIONS
  static async recordContestantScore(
    contestantId: string,
    leagueId: string,
    week: number,
    scoreType: string,
    points: number
  ): Promise<void> {
    // TODO: Connect to Supabase
    // await supabase.from('contestant_scores').insert({
    //   contestant_id: contestantId,
    //   league_id: leagueId,
    //   week,
    //   score_type: scoreType,
    //   points
    // })
  }

  static async getContestantScores(contestantId: string, leagueId: string): Promise<ContestantScore[]> {
    // TODO: Connect to Supabase
    // const { data } = await supabase
    //   .from('contestant_scores')
    //   .select('*')
    //   .eq('contestant_id', contestantId)
    //   .eq('league_id', leagueId)
    // return data
    return [];
  }

  static async calculateUserPoints(userId: string, leagueId: string): Promise<number> {
    // TODO: Connect to Supabase
    // Complex calculation based on roster picks and contestant scores
    // const { data: picks } = await supabase
    //   .from('roster_picks')
    //   .select('*, contestants(contestant_scores(*))')
    //   .eq('user_id', userId)
    //   .eq('league_id', leagueId)
    // Calculate total points from all contestants
    return 0;
  }
}

// Helper function to generate invite codes
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
