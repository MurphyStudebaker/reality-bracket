// ViewModel for Authentication

import { useState, useEffect } from 'react';
import { SupabaseService } from '../services/supabaseService';
import type { User } from '../models';

export const useAuthViewModel = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordResetRequested, setIsPasswordResetRequested] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const currentUser = await SupabaseService.getCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      console.error('Error checking auth:', err);
      setError(err?.message || 'Failed to authenticate');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up new user
  const signUp = async (
    email: string,
    password: string,
    username: string
  ): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      const newUser = await SupabaseService.signUp(email, password, username);
      
      if (newUser) {
        setUser(newUser);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error signing up:', err);
      setError(err?.message || 'Failed to sign up. Please check your email and password.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in existing user
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      const loggedInUser = await SupabaseService.signIn(email, password);
      
      if (loggedInUser) {
        setUser(loggedInUser);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error signing in:', err);
      setError(err?.message || 'Failed to sign in. Please check your email and password.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out user
  const signOut = async (): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      await SupabaseService.signOut();
      setUser(null);
      return true;
    } catch (err: any) {
      console.error('Error signing out:', err);
      setError(err?.message || 'Failed to sign out');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Request password reset
  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      await SupabaseService.resetPasswordForEmail(email);
      setIsPasswordResetRequested(true);
      return true;
    } catch (err: any) {
      console.error('Error requesting password reset:', err);
      setError(err?.message || 'Failed to send password reset email. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update password (for password recovery)
  const updatePassword = async (newPassword: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      await SupabaseService.updatePassword(newPassword);
      setIsPasswordRecovery(false);
      // Refresh user after password update
      const currentUser = await SupabaseService.getCurrentUser();
      setUser(currentUser);
      return true;
    } catch (err: any) {
      console.error('Error updating password:', err);
      setError(err?.message || 'Failed to update password. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize auth check
  useEffect(() => {
    let mounted = true;

    // Check for session immediately on mount
    const checkInitialSession = async () => {
      try {
        const supabase = SupabaseService.getClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Checking initial session:', { hasSession: !!session, hasUser: !!session?.user, error });
        
        if (!mounted) return;
        
        if (session?.user && !error) {
          // We have a valid session, use it directly to avoid network call
          console.log('Session found, restoring user...');
          // Create user object directly from session to avoid hanging on getUser()
          const username = session.user.user_metadata?.username || 
                           session.user.email?.split('@')[0] || 
                           'user';
          const userFromSession: User = {
            id: session.user.id,
            email: session.user.email || '',
            username: username,
            createdAt: session.user.created_at || new Date().toISOString(),
          };
          
          console.log('User restored from session:', userFromSession.username);
          if (mounted) {
            setUser(userFromSession);
            setIsLoading(false);
          }
        } else {
          // No session found
          console.log('No session found');
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Error checking initial session:', err);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener - this handles all auth state changes
    const supabase = SupabaseService.getClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'has session' : 'no session');
        
        if (!mounted) return;

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // INITIAL_SESSION fires when the app loads and Supabase detects an existing session
          if (session?.user) {
            // Use session data directly to avoid network calls that might hang
            const username = session.user.user_metadata?.username || 
                             session.user.email?.split('@')[0] || 
                             'user';
            const userFromSession: User = {
              id: session.user.id,
              email: session.user.email || '',
              username: username,
              createdAt: session.user.created_at || new Date().toISOString(),
            };
            
            if (mounted) {
              setUser(userFromSession);
              setIsLoading(false);
            }
          } else {
            if (mounted) {
              setUser(null);
              setIsLoading(false);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null);
            setIsPasswordRecovery(false);
            setIsPasswordResetRequested(false);
            setIsLoading(false);
          }
        } else if (event === 'PASSWORD_RECOVERY') {
          if (mounted) {
            setIsPasswordRecovery(true);
          }
        } else if (event === 'USER_UPDATED') {
          // User metadata was updated, refresh user info
          try {
            const currentUser = await SupabaseService.getCurrentUser();
            if (mounted) {
              setUser(currentUser);
            }
          } catch (err) {
            console.error('Error getting user after update:', err);
          }
        }
      }
    );

    // Check for session immediately
    checkInitialSession();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    isPasswordResetRequested,
    isPasswordRecovery,
    signUp,
    signIn,
    signOut,
    requestPasswordReset,
    updatePassword,
    refreshAuth: checkAuth,
    clearPasswordResetRequested: () => setIsPasswordResetRequested(false),
    clearError,
  };
};
