// ViewModel for Authentication

import { useState, useEffect } from 'react';
import { SupabaseService } from '../services/supabaseService';
import type { User } from '../models';

export const useAuthViewModel = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const currentUser = await SupabaseService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Error checking auth:', err);
      setError('Failed to authenticate');
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
      const newUser = await SupabaseService.signUp(email, password, username);
      
      if (newUser) {
        setUser(newUser);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error signing up:', err);
      setError('Failed to sign up');
      return false;
    }
  };

  // Sign in existing user
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const loggedInUser = await SupabaseService.signIn(email, password);
      
      if (loggedInUser) {
        setUser(loggedInUser);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error signing in:', err);
      setError('Failed to sign in');
      return false;
    }
  };

  // Sign out user
  const signOut = async (): Promise<boolean> => {
    try {
      setError(null);
      await SupabaseService.signOut();
      setUser(null);
      return true;
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out');
      return false;
    }
  };

  // Initialize auth check
  useEffect(() => {
    checkAuth();

    // Set up auth state listener
    // TODO: Implement Supabase auth state listener
    // const { data: { subscription } } = supabase.auth.onAuthStateChange(
    //   async (event, session) => {
    //     if (session?.user) {
    //       const currentUser = await SupabaseService.getCurrentUser();
    //       setUser(currentUser);
    //     } else {
    //       setUser(null);
    //     }
    //   }
    // );

    // return () => {
    //   subscription?.unsubscribe();
    // };
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    refreshAuth: checkAuth,
  };
};
