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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo || `${window.location.origin}/reset-password`,
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
          total_points,
          leagues!inner(
            id,
            name,
            season_id,
            invite_code,
            created_at,
            draft_date,
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

      // For each league, get member count and calculate user's rank
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

          // Get all members ordered by total_points to calculate rank
          const { data: allMembers } = await supabase
            .from('league_members')
            .select('user_id, total_points')
            .eq('league_id', league.id)
            .order('total_points', { ascending: false });

          // Calculate user's rank (1-based)
          let userRank = 1;
          if (allMembers) {
            const rankIndex = allMembers.findIndex((m: any) => m.user_id === userId);
            userRank = rankIndex >= 0 ? rankIndex + 1 : memberCount;
          }

          return {
            league: {
              id: league.id,
              name: league.name,
              seasonId: league.season_id,
              createdById: league.created_by_id || '',
              inviteCode: league.invite_code,
              createdAt: league.created_at,
              draftDate: league.draft_date || undefined,
            },
            seasonName: season.name || `Season ${season.number}`,
            memberCount,
            userRank,
            userPoints: member.total_points,
          };
        })
      );

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
      // Only query league_members table - no joins with users table
      const { data: memberData, error: memberError } = await supabase
        .from('league_members')
        .select('user_id, total_points, display_name')
        .eq('league_id', leagueId)
        .order('total_points', { ascending: false });

      if (memberError || !memberData || memberData.length === 0) {
        if (memberError) {
          console.error('Error fetching league members:', memberError);
        } else {
          console.log('No league members found for league:', leagueId);
        }
        return [];
      }

      // Transform to LeagueStanding format
      // Use display_name from league_members if available, otherwise show generic name
      const standings: LeagueStanding[] = memberData.map((member: any, index: number) => {
        // Use display_name if set, otherwise show "Player" with first 8 chars of user_id
        const displayName = member.display_name || `Player ${member.user_id.substring(0, 8)}`;
        return {
          rank: index + 1,
          userId: member.user_id,
          username: displayName,
          points: member.total_points ?? 0,
          change: 0,
          leagueId: leagueId,
        };
      });

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
