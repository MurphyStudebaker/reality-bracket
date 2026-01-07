// Supabase Service Layer
// This file handles all database operations with Supabase

import { createClient } from '@supabase/supabase-js';
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
import type { League as UILeague } from '../models/types';
import { generateSurvivorUsername } from '../models/constants';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL and/or key not found in environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Configure Supabase client with localStorage for session persistence
// This ensures sessions persist across page refreshes
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export class SupabaseService {
  // Get the Supabase client instance
  static getClient() {
    return supabase;
  }

  // USER OPERATIONS
  static async getCurrentUser(): Promise<User | null> {
    try {
      // Get the current user - Supabase handles session management automatically
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        // If getUser fails, try to get session and refresh if needed
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session && !sessionError && session.refresh_token) {
          // Try to refresh the session
          const { data: { session: refreshedSession }, error: refreshError } = 
            await supabase.auth.refreshSession(session);
          
          if (!refreshError && refreshedSession?.user) {
            const username = refreshedSession.user.user_metadata?.username || 
                             refreshedSession.user.email?.split('@')[0] || 
                             'user';
            
            return {
              id: refreshedSession.user.id,
              email: refreshedSession.user.email || '',
              username: username,
              createdAt: refreshedSession.user.created_at || new Date().toISOString(),
            };
          }
        }
        return null;
      }

      // Get username from user_metadata, fallback to email prefix
      const username = authUser.user_metadata?.username || 
                       authUser.email?.split('@')[0] || 
                       'user';

      return {
        id: authUser.id,
        email: authUser.email || '',
        username: username,
        createdAt: authUser.created_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async signUp(email: string, password: string, username: string): Promise<User | null> {
    try {
      // Sign up with Supabase Auth, passing username in user_metadata
      const { data: { user: authUser }, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });

      if (authError || !authUser) {
        console.error('Error signing up:', authError);
        throw authError || new Error('Failed to sign up');
      }

      // Return user directly from auth.users
      return {
        id: authUser.id,
        email: authUser.email || email,
        username: authUser.user_metadata?.username || username,
        createdAt: authUser.created_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  }

  static async signIn(email: string, password: string): Promise<User | null> {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authUser) {
        console.error('Error signing in:', authError);
        throw authError || new Error('Failed to sign in');
      }

      // Get username from user_metadata, fallback to email prefix
      const username = authUser.user_metadata?.username || 
                       authUser.email?.split('@')[0] || 
                       'user';

      return {
        id: authUser.id,
        email: authUser.email || email,
        username: username,
        createdAt: authUser.created_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in signIn:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  }

  static async resetPasswordForEmail(email: string, redirectTo?: string): Promise<void> {
    try {
      // Use the current origin - Supabase will automatically append the access_token
      // and type=recovery to the hash fragment when redirecting
      // The redirectTo should be the base URL without hash fragments
      const resetUrl = redirectTo || `${window.location.origin}${window.location.pathname}`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl,
      });
      if (error) {
        console.error('Error resetting password:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in resetPasswordForEmail:', error);
      throw error;
    }
  }

  static async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        console.error('Error updating password:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updatePassword:', error);
      throw error;
    }
  }

  // OAuth sign-in methods
  static async signInWithOAuth(provider: 'google' | 'apple', redirectTo?: string): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo || window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) {
        console.error(`Error signing in with ${provider}:`, error);
        throw error;
      }
    } catch (error) {
      console.error(`Error in signInWithOAuth (${provider}):`, error);
      throw error;
    }
  }

  // LEAGUE OPERATIONS
  static async getLeaguesByUserId(userId: string): Promise<League[]> {
    try {
      // Get all leagues where user is a member, with league and season details
      const { data: memberData, error: memberError } = await supabase
        .from('league_members')
        .select(`
          league_id,
          total_points,
          leagues!inner(
            id,
            name,
            season_id,
            invite_code,
            created_at,
            draft_date,
            status,
            seasons!inner(
              id,
              name,
              number
            )
          )
        `)
        .eq('user_id', userId)
        .order('total_points', { ascending: false });

      if (memberError) {
        console.error('Error fetching user leagues:', memberError);
        return [];
      }

      if (!memberData || memberData.length === 0) {
        return [];
      }

      // Transform to database League format
      const leagues: League[] = memberData.map((member: any) => {
        const league = member.leagues;
        return {
          id: league.id,
          name: league.name,
          seasonId: league.season_id,
          createdById: league.created_by_id || '',
          inviteCode: league.invite_code,
          createdAt: league.created_at,
          draftDate: league.draft_date || undefined,
          status: league.status as 'not_started' | 'draft_open' | 'draft_closed' | 'completed' | undefined,
        };
      });

      return leagues;
    } catch (error) {
      console.error('Error in getLeaguesByUserId:', error);
      return [];
    }
  }

  // Get UI-formatted leagues for a user (includes season name, member count, rank, points)
  static async getUILeaguesByUserId(userId: string): Promise<Array<{
    league: League;
    seasonName: string;
    memberCount: number;
    userRank: number;
    userPoints: number;
  }>> {
    try {
      // Get all leagues where user is a member, with league and season details
      const { data: memberData, error: memberError } = await supabase
        .from('league_members')
        .select(`
          league_id,
          leagues!inner(
            id,
            name,
            season_id,
            invite_code,
            created_at,
            draft_date,
            status,
            seasons!inner(
              id,
              name,
              number
            )
          )
        `)
        .eq('user_id', userId);

      if (memberError) {
        console.error('Error fetching user leagues:', memberError);
        return [];
      }

      if (!memberData || memberData.length === 0) {
        return [];
      }

      // For each league, get member count, calculate points, and calculate user's rank
      const result = await Promise.all(
        memberData.map(async (member: any) => {
          const league = member.leagues;
          const season = league.seasons;
          
          // Get member count for this league
          const { count } = await supabase
            .from('league_members')
            .select('*', { count: 'exact', head: true })
            .eq('league_id', league.id);

          const memberCount = count || 0;

          // Calculate user's points dynamically based on activity events
          const userPoints = await this.calculateUserPoints(userId, league.id);

          // Get all members and calculate their points to determine rank
          const { data: allMembers } = await supabase
            .from('league_members')
            .select('user_id')
            .eq('league_id', league.id);

          // Calculate points for all members to determine ranking
          const membersWithPoints = await Promise.all(
            (allMembers || []).map(async (m: any) => {
              const points = await this.calculateUserPoints(m.user_id, league.id);
              return {
                userId: m.user_id,
                points,
              };
            })
          );

          // Sort by points (descending) and find user's rank
          membersWithPoints.sort((a, b) => b.points - a.points);
          const rankIndex = membersWithPoints.findIndex((m) => m.userId === userId);
          const userRank = rankIndex >= 0 ? rankIndex + 1 : memberCount;

          return {
            league: {
              id: league.id,
              name: league.name,
              seasonId: league.season_id,
              createdById: league.created_by_id || '',
              inviteCode: league.invite_code,
              createdAt: league.created_at,
              draftDate: league.draft_date || undefined,
              status: league.status as 'not_started' | 'draft_open' | 'draft_closed' | 'completed' | undefined,
            },
            seasonName: season.name || `Season ${season.number}`,
            memberCount,
            userRank,
            userPoints,
          };
        })
      );

      // Sort results by points (descending) for consistent ordering
      result.sort((a, b) => b.userPoints - a.userPoints);

      return result;
    } catch (error) {
      console.error('Error in getUILeaguesByUserId:', error);
      return [];
    }
  }

  // Get leagues for selector component - filtered by active/upcoming seasons
  static async getLeaguesForSelector(userId: string): Promise<Array<{
    id: string;
    name: string;
    season: string;
    seasonNumber: number;
    seasonName: string;
    memberCount: number;
    inviteCode: string;
    createdById: string;
  }>> {
    try {
      // First, get all leagues where user is a member, with league and season details
      const { data: memberData, error: memberError } = await supabase
        .from('league_members')
        .select(`
          league_id,
          leagues!inner(
            id,
            name,
            invite_code,
            season_id,
            created_by_id,
            seasons!inner(
              id,
              name,
              number,
              status
            )
          )
        `)
        .eq('user_id', userId);

      if (memberError) {
        console.error('Error fetching user leagues for selector:', memberError);
        return [];
      }

      if (!memberData || memberData.length === 0) {
        return [];
      }

      // Filter by season status: 'active' or 'upcoming'
      const filteredMembers = memberData.filter((member: any) => {
        const season = member.leagues.seasons;
        return season.status === 'active' || season.status === 'upcoming';
      });

      // For each league, get member count
      const result = await Promise.all(
        filteredMembers.map(async (member: any) => {
          const league = member.leagues;
          const season = league.seasons;
          
          // Get member count for this league
          const { count } = await supabase
            .from('league_members')
            .select('*', { count: 'exact', head: true })
            .eq('league_id', league.id);

          const memberCount = count || 0;

          return {
            id: league.id,
            name: league.name,
            season: season.name || `Season ${season.number}`,
            seasonNumber: season.number,
            seasonName: season.name || `Season ${season.number}`,
            memberCount,
            inviteCode: league.invite_code,
            createdById: league.created_by_id || '',
          };
        })
      );

      return result;
    } catch (error) {
      console.error('Error in getLeaguesForSelector:', error);
      return [];
    }
  }

  static async createLeague(
    name: string,
    seasonId: string,
    userId: string,
    draftDate?: string
  ): Promise<League | null> {
    try {
      // Generate unique invite code
      let inviteCode: string = '';
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!isUnique && attempts < maxAttempts) {
        inviteCode = generateInviteCode();
        // Check if code already exists
        const { data: existing } = await supabase
          .from('leagues')
          .select('id')
          .eq('invite_code', inviteCode)
          .single();

        if (!existing) {
          isUnique = true;
        } else {
          attempts++;
        }
      }

      if (!isUnique || !inviteCode) {
        throw new Error('Failed to generate unique invite code');
      }

      // Insert league
      const { data: league, error: leagueError } = await supabase
        .from('leagues')
        .insert({
          name,
          season_id: seasonId,
          created_by_id: userId,
          invite_code: inviteCode,
          draft_date: draftDate || null,
          status: 'not_started',
        })
        .select()
        .single();
      if (leagueError || !league) {
        console.error('Error creating league:', leagueError);
        throw leagueError || new Error('Failed to create league');
      }

      // Get user's username from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', userId)
        .single();

      let displayName: string;
      if (userError || !userData || !userData.username) {
        // Generate a Survivor-themed username if user doesn't have one
        // Try up to 5 times to ensure uniqueness
        let attempts = 0;
        let updateError = null;
        do {
          displayName = generateSurvivorUsername();
          
          // Update the users table with the generated username
          const { error } = await supabase
            .from('users')
            .update({ username: displayName })
            .eq('id', userId);
          
          updateError = error;
          attempts++;
        } while (updateError && updateError.code === '23505' && attempts < 5); // 23505 is unique violation
        
        if (updateError && updateError.code !== '23505') {
          console.error('Error updating username:', updateError);
          // Continue anyway with the generated username for display_name
        }
      } else {
        displayName = userData.username;
      }

      // Add creator as member with display_name set to username
      const { error: memberError } = await supabase
        .from('league_members')
        .insert({
          league_id: league.id,
          user_id: userId,
          display_name: displayName,
        });
      if (memberError) {
        console.error('Error adding creator as member:', memberError);
        // Try to clean up the league if member insertion fails
        await supabase.from('leagues').delete().eq('id', league.id);
        throw memberError;
      }

      // Transform database columns to TypeScript interface
      return {
        id: league.id,
        name: league.name,
        seasonId: league.season_id,
        createdById: league.created_by_id,
        inviteCode: league.invite_code,
        createdAt: league.created_at,
        draftDate: league.draft_date || undefined,
        status: league.status as 'not_started' | 'draft_open' | 'draft_closed' | 'completed' | undefined,
      };
    } catch (error) {
      console.error('Error in createLeague:', error);
      throw error;
    }
  }

  static async joinLeagueByInviteCode(inviteCode: string, userId: string): Promise<League | null> {
    try {
      // Find league by invite code
      const { data: league, error: leagueError } = await supabase
        .from('leagues')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (leagueError || !league) {
        if (leagueError?.code === 'PGRST116') {
          throw new Error('Invalid invite code. Please check and try again.');
        }
        throw leagueError || new Error('League not found');
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('league_members')
        .select('id')
        .eq('league_id', league.id)
        .eq('user_id', userId)
        .single();

      if (existingMember) {
        throw new Error('You are already a member of this league');
      }

      // Add user as member
      const { error: memberError } = await supabase
        .from('league_members')
        .insert({
          league_id: league.id,
          user_id: userId,
        });

      if (memberError) {
        console.error('Error joining league:', memberError);
        throw memberError;
      }

      // Transform database columns to TypeScript interface
      return {
        id: league.id,
        name: league.name,
        seasonId: league.season_id,
        createdById: league.created_by_id,
        inviteCode: league.invite_code,
        createdAt: league.created_at,
        draftDate: league.draft_date || undefined,
        status: league.status as 'not_started' | 'draft_open' | 'draft_closed' | 'completed' | undefined,
      };
    } catch (error) {
      console.error('Error in joinLeagueByInviteCode:', error);
      throw error;
    }
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
    try {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .order('number', { ascending: false });


      if (error) {
        console.error('Error fetching seasons:', error);
        return [];
      }

      // Transform database columns (snake_case) to TypeScript interface (camelCase)
      return (data || []).map((season) => ({
        id: season.id,
        name: season.name,
        number: season.number,
        status: season.status as 'active' | 'completed' | 'upcoming',
        startDate: season.start_date,
        endDate: season.end_date || undefined,
      }));
    } catch (error) {
      console.error('Error fetching seasons:', error);
      return [];
    }
  }

  static async getSeasonById(seasonId: string): Promise<Season | null> {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('id', seasonId)
        .single();

      if (error) {
        console.error('Error fetching season:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      // Transform database columns to TypeScript interface
      return {
        id: data.id,
        name: data.name,
        number: data.number,
        status: data.status as 'active' | 'completed' | 'upcoming',
        startDate: data.start_date,
        endDate: data.end_date || undefined,
      };
    } catch (error) {
      console.error('Error in getSeasonById:', error);
      return null;
    }
  }

  // CONTESTANT OPERATIONS
  static async getContestantsBySeason(seasonId: string): Promise<Contestant[]> {
    try {
      const { data, error } = await supabase
        .from('contestants')
        .select('*')
        .eq('season_id', seasonId)
        .order('name');

      if (error) {
        console.error('Error fetching contestants:', error);
        return [];
      }

      // Transform database columns (snake_case) to TypeScript interface (camelCase)
      return (data || []).map((contestant) => ({
        id: contestant.id,
        name: contestant.name,
        age: contestant.age || 0,
        occupation: contestant.occupation || '',
        hometown: contestant.hometown || '',
        imageUrl: contestant.image_url || '',
        status: contestant.status as 'active' | 'eliminated' | 'jury' | 'final3',
        eliminatedWeek: contestant.eliminated_week || undefined,
        seasonId: contestant.season_id,
      }));
    } catch (error) {
      console.error('Error in getContestantsBySeason:', error);
      return [];
    }
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
  static async getRosterByUserAndLeague(userId: string, leagueId: string): Promise<Array<RosterPick & { contestant: Contestant }>> {
    try {
      const { data, error } = await supabase
        .from('roster_picks')
        .select(`
          *,
          contestants (
            id,
            name,
            age,
            occupation,
            hometown,
            image_url,
            status,
            eliminated_week,
            season_id
          )
        `)
        .eq('user_id', userId)
        .eq('league_id', leagueId)
        .order('picked_at', { ascending: true });

      if (error) {
        console.error('Error fetching roster picks:', error);
        return [];
      }

      // Transform database columns to TypeScript interface
      return (data || []).map((pick: any) => ({
        id: pick.id,
        userId: pick.user_id,
        leagueId: pick.league_id,
        contestantId: pick.contestant_id,
        pickType: pick.pick_type as 'final3' | 'boot',
        pickedAt: pick.picked_at,
        contestant: pick.contestants ? {
          id: pick.contestants.id,
          name: pick.contestants.name,
          age: pick.contestants.age || 0,
          occupation: pick.contestants.occupation || '',
          hometown: pick.contestants.hometown || '',
          imageUrl: pick.contestants.image_url || '',
          status: pick.contestants.status as 'active' | 'eliminated' | 'jury' | 'final3',
          eliminatedWeek: pick.contestants.eliminated_week || undefined,
          seasonId: pick.contestants.season_id,
        } : null as any,
      })).filter((pick: any) => pick.contestant !== null);
    } catch (error) {
      console.error('Error in getRosterByUserAndLeague:', error);
      return [];
    }
  }

  static async addRosterPick(
    userId: string,
    leagueId: string,
    contestantId: string,
    pickType: 'final3' | 'boot'
  ): Promise<RosterPick | null> {
    try {
      const { data, error } = await supabase
        .from('roster_picks')
        .insert({
          user_id: userId,
          league_id: leagueId,
          contestant_id: contestantId,
          pick_type: pickType,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding roster pick:', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      // Transform database columns to TypeScript interface
      return {
        id: data.id,
        userId: data.user_id,
        leagueId: data.league_id,
        contestantId: data.contestant_id,
        pickType: data.pick_type as 'final3' | 'boot',
        pickedAt: data.picked_at,
      };
    } catch (error) {
      console.error('Error in addRosterPick:', error);
      throw error;
    }
  }

  static async removeRosterPick(pickId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('roster_picks')
        .delete()
        .eq('id', pickId);

      if (error) {
        console.error('Error removing roster pick:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in removeRosterPick:', error);
      throw error;
    }
  }

  static async updateRosterPick(pickId: string, contestantId: string): Promise<void> {
    // TODO: Connect to Supabase
    // await supabase.from('roster_picks').update({
    //   contestant_id: contestantId
    // }).eq('id', pickId)
  }

  // STANDINGS OPERATIONS
  static async getLeagueStandings(leagueId: string): Promise<LeagueStanding[]> {
    try {
      // Get league to find season_id
      const { data: league, error: leagueError } = await supabase
        .from('leagues')
        .select('season_id')
        .eq('id', leagueId)
        .single();

      if (leagueError || !league) {
        console.error('Error fetching league:', leagueError);
        return [];
      }

      const seasonId = league.season_id;
      if (!seasonId) {
        return [];
      }

      // Get current week and previous week
      const currentWeek = await this.getCurrentWeek(seasonId);
      const previousWeek = Math.max(0, currentWeek - 1);

      // Only query league_members table - no joins with users table
      const { data: memberData, error: memberError } = await supabase
        .from('league_members')
        .select('user_id, display_name')
        .eq('league_id', leagueId);

      if (memberError || !memberData || memberData.length === 0) {
        if (memberError) {
          console.error('Error fetching league members:', memberError);
        } else {
          console.log('No league members found for league:', leagueId);
        }
        return [];
      }

      // Calculate points for each member
      const standingsWithPoints = await Promise.all(
        memberData.map(async (member: any) => {
          // Calculate current total points
          const currentPoints = await this.calculateUserPoints(member.user_id, leagueId);
          
          // Calculate previous week points
          const previousPoints = previousWeek > 0
            ? await this.calculateUserPointsForWeek(member.user_id, leagueId, previousWeek)
            : 0;

          // Calculate change (current - previous)
          const change = currentPoints - previousPoints;

          // Use display_name if set, otherwise show "Player" with first 8 chars of user_id
          const displayName = member.display_name || `Player ${member.user_id.substring(0, 8)}`;

          return {
            userId: member.user_id,
            username: displayName,
            points: currentPoints,
            change: change,
            leagueId: leagueId,
          };
        })
      );

      // Sort by points (descending) and assign ranks
      standingsWithPoints.sort((a, b) => b.points - a.points);
      const standings: LeagueStanding[] = standingsWithPoints.map((standing, index) => ({
        ...standing,
        rank: index + 1,
      }));

      console.log('Standings:', standings);
      return standings;
    } catch (error) {
      console.error('Error in getLeagueStandings:', error);
      return [];
    }
  }

  // Get display names for user's leagues
  static async getLeagueDisplayNames(userId: string): Promise<Record<string, string>> {
    try {
      const { data: memberData, error } = await supabase
        .from('league_members')
        .select('league_id, display_name')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching display names:', error);
        return {};
      }

      const displayNames: Record<string, string> = {};
      if (memberData) {
        memberData.forEach((member: any) => {
          if (member.display_name) {
            displayNames[member.league_id] = member.display_name;
          }
        });
      }

      return displayNames;
    } catch (error) {
      console.error('Error in getLeagueDisplayNames:', error);
      return {};
    }
  }

  // Update display name for a league
  static async updateLeagueDisplayName(
    userId: string,
    leagueId: string,
    displayName: string
  ): Promise<boolean> {
    try {
      const trimmedName = displayName.trim();
      console.log('Updating display name in Supabase:', {
        userId,
        leagueId,
        displayName: trimmedName || null
      });

      const { data, error } = await supabase
        .from('league_members')
        .update({ display_name: trimmedName || null })
        .eq('user_id', userId)
        .eq('league_id', leagueId)
        .select();

      if (error) {
        console.error('Error updating display name:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return false;
      }

      // Check if any rows were updated
      if (!data || data.length === 0) {
        console.error('Update returned no rows - RLS policy may be blocking the update or row does not exist');
        console.error('Query params:', { userId, leagueId, displayName: trimmedName });
        return false;
      }

      console.log('Display name updated successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in updateLeagueDisplayName:', error);
      return false;
    }
  }

  // Get league members with usernames for draft order
  static async getLeagueMembersForDraftOrder(leagueId: string): Promise<Array<{
    id: string;
    userId: string;
    username: string;
    displayName: string | null;
    draftOrder: number | null;
    joinedAt: string;
  }>> {
    try {
      // First, get league members
      const { data: memberData, error: memberError } = await supabase
        .from('league_members')
        .select('id, user_id, display_name, draft_order, joined_at')
        .eq('league_id', leagueId)
        .order('draft_order', { ascending: true, nullsFirst: false })
        .order('joined_at', { ascending: true });

      if (memberError) {
        console.error('Error fetching league members:', memberError);
        return [];
      }

      if (!memberData || memberData.length === 0) {
        return [];
      }

      // Get user IDs and fetch usernames
      const userIds = memberData.map((m: any) => m.user_id);
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, username')
        .in('id', userIds);

      if (usersError) {
        console.error('Error fetching users:', usersError);
      }

      // Create a map of user_id to username
      const usersMap = new Map<string, string>();
      if (usersData) {
        usersData.forEach((user: any) => {
          usersMap.set(user.id, user.username);
        });
      }

      // Transform the data
      return memberData.map((member: any) => {
        const username = usersMap.get(member.user_id) || 'Unknown';
        const displayName = member.display_name || username || `Player ${member.user_id.substring(0, 8)}`;
        return {
          id: member.id,
          userId: member.user_id,
          username: username,
          displayName: member.display_name,
          draftOrder: member.draft_order,
          joinedAt: member.joined_at,
        };
      });
    } catch (error) {
      console.error('Error in getLeagueMembersForDraftOrder:', error);
      return [];
    }
  }

  // Start the draft - set status to draft_open and initialize draft order if needed
  static async startDraft(leagueId: string): Promise<boolean> {
    try {
      // First, check if draft order is set for all members
      const { data: members, error: membersError } = await supabase
        .from('league_members')
        .select('id, draft_order')
        .eq('league_id', leagueId);

      if (membersError || !members) {
        console.error('Error fetching league members:', membersError);
        return false;
      }

      // If no members have draft_order set, initialize it based on joined_at
      const needsOrderInit = members.some(m => m.draft_order === null);
      if (needsOrderInit && members.length > 0) {
        // Get all members sorted by joined_at
        const { data: orderedMembers, error: orderedError } = await supabase
          .from('league_members')
          .select('id')
          .eq('league_id', leagueId)
          .order('joined_at', { ascending: true });

        if (orderedError || !orderedMembers) {
          console.error('Error fetching ordered members:', orderedError);
          return false;
        }

        // Set draft_order based on join order
        const orderUpdates = orderedMembers.map((member, index) => ({
          id: member.id,
          draftOrder: index + 1,
        }));

        for (const update of orderUpdates) {
          const { error: updateError } = await supabase
            .from('league_members')
            .update({ draft_order: update.draftOrder })
            .eq('id', update.id)
            .eq('league_id', leagueId);

          if (updateError) {
            console.error('Error updating draft order:', updateError);
            return false;
          }
        }
      }

      // Update league status to draft_open
      const { data: updatedLeague, error: statusError } = await supabase
        .from('leagues')
        .update({ status: 'draft_open' })
        .eq('id', leagueId)
        .select('id, status')
        .single();

      if (statusError) {
        console.error('Error updating league status:', statusError);
        return false;
      }

      if (!updatedLeague || updatedLeague.status !== 'draft_open') {
        console.error('League status was not updated correctly');
        return false;
      }

      console.log('Draft started successfully for league:', leagueId);
      return true;
    } catch (error) {
      console.error('Error in startDraft:', error);
      return false;
    }
  }

  // Get current draft turn information
  static async getCurrentDraftTurn(leagueId: string): Promise<{
    currentPlayerId: string | null;
    currentPlayerName: string | null;
    position: number | null; // 1, 2, or 3 for Final 3 positions
    pickNumber: number | null; // Which pick in the position (1-based)
  } | null> {
    try {
      // Get all league members with draft order
      const { data: members, error: membersError } = await supabase
        .from('league_members')
        .select('id, user_id, draft_order, display_name')
        .eq('league_id', leagueId)
        .not('draft_order', 'is', null)
        .order('draft_order', { ascending: true });

      if (membersError || !members || members.length === 0) {
        return null;
      }

      // Get all roster picks for Final 3 positions
      const { data: picks, error: picksError } = await supabase
        .from('roster_picks')
        .select('user_id, pick_type')
        .eq('league_id', leagueId)
        .eq('pick_type', 'final3')
        .order('picked_at', { ascending: true });

      if (picksError) {
        console.error('Error fetching roster picks:', picksError);
        return null;
      }

      // Count picks per position
      const picksByUser = new Map<string, number>();
      picks?.forEach(pick => {
        const count = picksByUser.get(pick.user_id) || 0;
        picksByUser.set(pick.user_id, count + 1);
      });

      // Determine which position we're on and whose turn it is
      // Snake draft: Position 1 forward, Position 2 reversed, Position 3 forward
      const totalPicks = picks?.length || 0;
      const numPlayers = members.length;
      const picksPerPosition = numPlayers;

      // Check if all positions are filled for all players
      const picksByPosition = new Map<number, Set<string>>();
      picks?.forEach(pick => {
        // Count how many picks each user has made
        const userPicks = picks.filter(p => p.user_id === pick.user_id).length;
        const position = userPicks; // 1, 2, or 3
        
        if (!picksByPosition.has(position)) {
          picksByPosition.set(position, new Set());
        }
        picksByPosition.get(position)!.add(pick.user_id);
      });

      // Check if all players have picked for each position
      let currentPosition: number = 1;
      if (picksByPosition.get(1)?.size === numPlayers) {
        currentPosition = 2;
        if (picksByPosition.get(2)?.size === numPlayers) {
          currentPosition = 3;
          if (picksByPosition.get(3)?.size === numPlayers) {
            // Draft completed
            return null;
          }
        }
      }

      // Calculate which pick in the current position
      const picksInCurrentPosition = picksByPosition.get(currentPosition)?.size || 0;
      const currentPickInPosition = picksInCurrentPosition + 1;

      // Determine player index based on position and pick number
      let currentPlayerIndex: number;
      if (currentPosition === 1 || currentPosition === 3) {
        // Forward order: 0, 1, 2, 3, ...
        currentPlayerIndex = (currentPickInPosition - 1) % numPlayers;
      } else {
        // Reverse order: last person picks first, then backwards
        currentPlayerIndex = numPlayers - 1 - ((currentPickInPosition - 1) % numPlayers);
      }

      const currentMember = members[currentPlayerIndex];
      if (!currentMember) {
        return null;
      }

      // Get username
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', currentMember.user_id)
        .single();

      const displayName = currentMember.display_name || user?.username || `Player ${currentMember.user_id.substring(0, 8)}`;

      return {
        currentPlayerId: currentMember.user_id,
        currentPlayerName: displayName,
        position: currentPosition,
        pickNumber: currentPickInPosition,
      };
    } catch (error) {
      console.error('Error in getCurrentDraftTurn:', error);
      return null;
    }
  }

  // Check if it's a user's turn for a specific Final 3 position
  static async isUserTurnForPosition(
    leagueId: string,
    userId: string,
    position: 1 | 2 | 3
  ): Promise<boolean> {
    try {
      const draftTurn = await this.getCurrentDraftTurn(leagueId);
      
      if (!draftTurn || !draftTurn.currentPlayerId) {
        return false;
      }

      return draftTurn.currentPlayerId === userId && draftTurn.position === position;
    } catch (error) {
      console.error('Error in isUserTurnForPosition:', error);
      return false;
    }
  }

  // Update draft order for league members
  static async updateDraftOrder(
    leagueId: string,
    memberOrders: Array<{ memberId: string; draftOrder: number }>
  ): Promise<boolean> {
    try {
      // Use a transaction-like approach with multiple updates
      const updates = memberOrders.map(({ memberId, draftOrder }) =>
        supabase
          .from('league_members')
          .update({ draft_order: draftOrder })
          .eq('id', memberId)
          .eq('league_id', leagueId)
      );

      const results = await Promise.all(updates);
      
      // Check if any updates failed
      const hasError = results.some(result => result.error);
      if (hasError) {
        console.error('Error updating draft order:', results.find(r => r.error)?.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateDraftOrder:', error);
      return false;
    }
  }

  // Fallback method: Query league_members and users separately
  static async getLeagueStandingsFallback(leagueId: string): Promise<LeagueStanding[]> {
    try {
      // Get league members
      const { data: memberData, error: memberError } = await supabase
        .from('league_members')
        .select('user_id, total_points, display_name')
        .eq('league_id', leagueId)
        .order('total_points', { ascending: false });

      if (memberError || !memberData || memberData.length === 0) {
        console.error('Error in fallback method:', memberError);
        return [];
      }

      // Get user IDs
      const userIds = memberData.map((m: any) => m.user_id);

      // Fetch users separately
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, username')
        .in('id', userIds);

      if (usersError) {
        console.error('Error fetching users:', usersError);
      }

      // Create a map of user data
      const usersMap = new Map();
      if (usersData) {
        usersData.forEach((user: any) => {
          usersMap.set(user.id, user);
        });
      }

      // Transform to LeagueStanding format
      const standings: LeagueStanding[] = memberData.map((member: any, index: number) => {
        const user = usersMap.get(member.user_id);
        // Use display_name from league_members if available, otherwise fall back to username
        const displayName = member.display_name || user?.username || 'Unknown';
        return {
          rank: index + 1,
          userId: member.user_id,
          username: displayName,
          points: member.total_points ?? 0,
          change: 0,
          leagueId: leagueId,
        };
      });

      console.log('Fallback standings:', standings);
      return standings;
    } catch (error) {
      console.error('Error in fallback method:', error);
      return [];
    }
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
    try {
      const { data, error } = await supabase.rpc('calculate_user_total_points', {
        p_user_id: userId,
        p_league_id: leagueId,
        p_week_number: null, // null means all weeks
      });

      if (error) {
        console.error('Error calculating user points:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in calculateUserPoints:', error);
      return 0;
    }
  }

  // ACTIVITY EVENTS OPERATIONS
  static async addActivityEvent(
    seasonId: string,
    contestantId: string,
    weekNumber: number,
    activityType: 'immunity' | 'eliminated' | 'medical_evacuated' | 'made_merge' | 'made_final_three' | 'made_jury'
  ): Promise<{ id: string } | null> {
    try {
      const { data, error } = await supabase
        .from('activity_events')
        .insert({
          season_id: seasonId,
          contestant_id: contestantId,
          week_number: weekNumber,
          activity_type: activityType,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error adding activity event:', error);
        throw error;
      }

      return data ? { id: data.id } : null;
    } catch (error) {
      console.error('Error in addActivityEvent:', error);
      throw error;
    }
  }

  static async getActivityEvents(
    seasonId: string,
    weekNumber?: number
  ): Promise<Array<{
    id: string;
    seasonId: string;
    contestantId: string;
    weekNumber: number;
    activityType: string;
    createdAt: string;
  }>> {
    try {
      let query = supabase
        .from('activity_events')
        .select('*')
        .eq('season_id', seasonId)
        .order('week_number', { ascending: true })
        .order('created_at', { ascending: true });

      if (weekNumber !== undefined) {
        query = query.eq('week_number', weekNumber);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activity events:', error);
        return [];
      }

      return (data || []).map((event: any) => ({
        id: event.id,
        seasonId: event.season_id,
        contestantId: event.contestant_id,
        weekNumber: event.week_number,
        activityType: event.activity_type,
        createdAt: event.created_at,
      }));
    } catch (error) {
      console.error('Error in getActivityEvents:', error);
      return [];
    }
  }

  static async getCurrentWeek(seasonId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_current_week', {
        p_season_id: seasonId,
      });

      if (error) {
        console.error('Error getting current week:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in getCurrentWeek:', error);
      return 0;
    }
  }

  static async calculatePickPoints(
    userId: string,
    leagueId: string,
    contestantId: string,
    pickType: 'final3' | 'boot',
    weekNumber?: number
  ): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('calculate_pick_points', {
        p_user_id: userId,
        p_league_id: leagueId,
        p_contestant_id: contestantId,
        p_pick_type: pickType,
        p_week_number: weekNumber || null,
      });

      if (error) {
        console.error('Error calculating pick points:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in calculatePickPoints:', error);
      return 0;
    }
  }

  static async calculateUserPointsForWeek(
    userId: string,
    leagueId: string,
    weekNumber: number
  ): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('calculate_user_total_points', {
        p_user_id: userId,
        p_league_id: leagueId,
        p_week_number: weekNumber,
      });

      if (error) {
        console.error('Error calculating user points for week:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in calculateUserPointsForWeek:', error);
      return 0;
    }
  }

  // Recalculate all contestant statuses for a season based on activity events
  // Useful for data consistency or when bulk updating
  static async recalculateContestantStatuses(seasonId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('recalculate_contestant_statuses', {
        p_season_id: seasonId,
      });

      if (error) {
        console.error('Error recalculating contestant statuses:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in recalculateContestantStatuses:', error);
      throw error;
    }
  }

  // Get activity events for specific contestants in a season
  static async getActivityEventsForContestants(
    seasonId: string,
    contestantIds: string[]
  ): Promise<Array<{
    id: string;
    seasonId: string;
    contestantId: string;
    contestantName: string;
    weekNumber: number;
    activityType: string;
    points: number;
    createdAt: string;
  }>> {
    try {
      if (!contestantIds || contestantIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('activity_events')
        .select(`
          *,
          contestants!inner(
            id,
            name
          )
        `)
        .eq('season_id', seasonId)
        .in('contestant_id', contestantIds)
        .order('week_number', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching activity events for contestants:', error);
        return [];
      }

      return (data || []).map((event: any) => ({
        id: event.id,
        seasonId: event.season_id,
        contestantId: event.contestant_id,
        contestantName: event.contestants?.name || 'Unknown',
        weekNumber: event.week_number,
        activityType: event.activity_type,
        points: 0, // Will be calculated based on pick type
        createdAt: event.created_at,
      }));
    } catch (error) {
      console.error('Error in getActivityEventsForContestants:', error);
      return [];
    }
  }

  // Get all roster picks for a league (all users)
  static async getAllRosterPicksForLeague(leagueId: string): Promise<Array<{
    id: string;
    userId: string;
    contestantId: string;
    pickType: 'final3' | 'boot';
    displayName: string;
  }>> {
    try {
      // First get all roster picks
      const { data: picks, error: picksError } = await supabase
        .from('roster_picks')
        .select('id, user_id, contestant_id, pick_type')
        .eq('league_id', leagueId);

      if (picksError) {
        console.error('Error fetching roster picks:', picksError);
        return [];
      }

      if (!picks || picks.length === 0) {
        return [];
      }

      // Get unique user IDs
      const userIds = [...new Set(picks.map((p: any) => p.user_id))];

      // Get display names for all users in the league
      const { data: members, error: membersError } = await supabase
        .from('league_members')
        .select('user_id, display_name')
        .eq('league_id', leagueId)
        .in('user_id', userIds);

      if (membersError) {
        console.error('Error fetching league members:', membersError);
        return [];
      }

      // Create a map of user_id to display_name
      const displayNameMap: Record<string, string> = {};
      (members || []).forEach((member: any) => {
        displayNameMap[member.user_id] = member.display_name || 'Unknown';
      });

      // Combine picks with display names
      return (picks || []).map((pick: any) => ({
        id: pick.id,
        userId: pick.user_id,
        contestantId: pick.contestant_id,
        pickType: pick.pick_type as 'final3' | 'boot',
        displayName: displayNameMap[pick.user_id] || 'Unknown',
      }));
    } catch (error) {
      console.error('Error in getAllRosterPicksForLeague:', error);
      return [];
    }
  }

  // Check if draft has started for a league (returns true if status is draft_open or later)
  static async hasDraftStarted(leagueId: string): Promise<boolean> {
    try {
      const { data: league, error } = await supabase
        .from('leagues')
        .select('status')
        .eq('id', leagueId)
        .single();

      if (error) {
        console.error('Error checking draft status:', error);
        return false;
      }

      if (!league) {
        return false;
      }

      // Draft has started if status is draft_open, draft_closed, or completed
      return league.status === 'draft_open' || league.status === 'draft_closed' || league.status === 'completed';
    } catch (error) {
      console.error('Error in hasDraftStarted:', error);
      return false;
    }
  }

  // Get activity events for a season with contestant info
  static async getActivityEventsForSeason(seasonId: string): Promise<Array<{
    id: string;
    contestantId: string;
    contestantName: string;
    weekNumber: number;
    activityType: string;
    createdAt: string;
  }>> {
    try {
      const { data, error } = await supabase
        .from('activity_events')
        .select(`
          *,
          contestants!inner(
            id,
            name
          )
        `)
        .eq('season_id', seasonId)
        .order('week_number', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching activity events for season:', error);
        return [];
      }

      return (data || []).map((event: any) => ({
        id: event.id,
        contestantId: event.contestant_id,
        contestantName: event.contestants?.name || 'Unknown',
        weekNumber: event.week_number,
        activityType: event.activity_type,
        createdAt: event.created_at,
      }));
    } catch (error) {
      console.error('Error in getActivityEventsForSeason:', error);
      return [];
    }
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
