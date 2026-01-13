import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useAuthViewModel } from '../../viewmodels/auth.viewmodel';
import { SupabaseService } from '../../services/supabaseService';
import logoImage from '../../assets/icon.png';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export default function PasswordResetPage() {
  const auth = useAuthViewModel();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handlePasswordResetFlow = async () => {
      try {
        // Log the current URL for debugging
        console.log('Password reset page loaded with URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Search:', window.location.search);

        // Check if we have password recovery parameters
        const hash = window.location.hash;
        const hashParams = hash ? new URLSearchParams(hash.substring(1)) : new URLSearchParams();
        const searchParams = new URLSearchParams(window.location.search);

        const hasRecoveryParams = hashParams.get('type') === 'recovery' ||
                                 hashParams.has('access_token') ||
                                 searchParams.has('token');

        console.log('Password recovery parameters:', {
          hashParams: Object.fromEntries(hashParams),
          searchParams: Object.fromEntries(searchParams),
          hasRecoveryParams,
          isPasswordRecovery: auth.isPasswordRecovery
        });

        if (!hasRecoveryParams && !auth.isPasswordRecovery) {
          setIsValidToken(false);
          return;
        }

        // First, try to get existing session
        const supabase = SupabaseService.getClient();
        let { data: { session }, error: sessionError } = await supabase.auth.getSession();

        console.log('Initial password reset session check:', {
          hasSession: !!session,
          user: session?.user?.email,
          error: sessionError,
          isPasswordRecovery: auth.isPasswordRecovery
        });

        // If no session but we have recovery parameters, try to establish session from URL
        if (!session && hasRecoveryParams) {
          console.log('Attempting to establish session from URL tokens...');

          // For password reset, we might need to manually refresh the session or handle the URL
          // Let's try to refresh the session to pick up any URL-based auth
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();

          console.log('Session refresh result:', {
            hasRefreshedSession: !!refreshedSession,
            user: refreshedSession?.user?.email,
            error: refreshError
          });

          if (refreshedSession) {
            session = refreshedSession;
          } else {
            // Try getting session again after a brief delay
            await new Promise(resolve => setTimeout(resolve, 500));
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            session = retrySession;
            console.log('Retry session check:', {
              hasSession: !!session,
              user: session?.user?.email
            });
          }
        }

        if (sessionError) {
          console.error('Session error during password reset:', sessionError);
          setIsValidToken(false);
          return;
        }

        // Check if we have a valid session for password update
        if (session?.user || auth.isPasswordRecovery) {
          console.log('Password reset session is valid');
          setIsValidToken(true);
        } else {
          console.log('No valid session found, checking again in 2 seconds...');
          // Wait for auth state to update
          setTimeout(async () => {
            const { data: { session: delayedSession } } = await supabase.auth.getSession();
            console.log('Delayed session check:', {
              hasSession: !!delayedSession,
              user: delayedSession?.user?.email,
              isPasswordRecovery: auth.isPasswordRecovery
            });

            if (delayedSession?.user || auth.isPasswordRecovery) {
              setIsValidToken(true);
            } else {
              console.log('No valid session found after delay - password reset will fail');
              setIsValidToken(false);
            }
          }, 2000);
        }

      } catch (error: any) {
        console.error('Error handling password reset flow:', error);
        setIsValidToken(false);
      }
    };

    handlePasswordResetFlow();
  }, [auth.isPasswordRecovery]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return;
    }

    // Verify we have a valid session before attempting password update
    const supabase = SupabaseService.getClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    console.log('Pre-password-update session check:', {
      hasSession: !!session,
      user: session?.user?.email,
      error: sessionError,
      isPasswordRecovery: auth.isPasswordRecovery
    });

    if (!session && !auth.isPasswordRecovery) {
      setErrorMessage('No valid authentication session found. Please request a new password reset link.');
      return;
    }

    setIsProcessing(true);
    try {
      const success = await auth.updatePassword(newPassword);
      if (success) {
        // Redirect to home after successful password reset
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (error: any) {
      console.error('Password reset failed:', error);
      setErrorMessage(error?.message || 'Failed to update password. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToLogin = () => {
    window.location.href = '/';
  };

  // Show loading if still checking authentication
  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#BFFF0B' }} />
        </div>
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  // If not a valid recovery token, show error
  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(191, 255, 11, 0.1)' }}>
              <img
                src={logoImage}
                alt="Reality Bracket Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-4">Invalid Reset Link</h1>
          <p className="text-slate-400 mb-6">
            This password reset link is invalid or has expired. Please request a new password reset.
          </p>

          <Button
            onClick={handleBackToLogin}
            className="w-full h-12 rounded-xl font-semibold"
            style={{ backgroundColor: '#BFFF0B', color: '#000' }}
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  // If password was successfully updated, show success message
  if (auth.user && !auth.isPasswordRecovery) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(191, 255, 11, 0.1)' }}>
              <img
                src={logoImage}
                alt="Reality Bracket Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-4">Password Updated!</h1>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-16 h-16" style={{ color: '#BFFF0B' }} />
          </div>
          <p className="text-slate-400 mb-4">Your password has been successfully updated.</p>
          <p className="text-sm text-slate-500">Redirecting you to the app...</p>
        </div>
      </div>
    );
  }

  // Show password reset form
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={handleBackToLogin}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(191, 255, 11, 0.1)' }}>
            <img
              src={logoImage}
              alt="Reality Bracket Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Reset Your Password</h1>
            <p className="text-slate-400">Enter your new password below</p>
          </div>

          <form onSubmit={handlePasswordReset} className="space-y-5">
            {(auth.error || errorMessage) && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-sm text-red-400">
                {errorMessage || auth.error}
              </div>
            )}

            <div>
              <label className="text-sm text-slate-400 mb-3 block font-medium">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrorMessage(''); // Clear error when user types
                }}
                placeholder="Enter new password"
                required
                minLength={6}
                className="bg-slate-800/50 border-slate-700 text-white rounded-xl h-12"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-3 block font-medium">Confirm Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrorMessage(''); // Clear error when user types
                }}
                placeholder="Confirm new password"
                required
                minLength={6}
                className="bg-slate-800/50 border-slate-700 text-white rounded-xl h-12"
              />
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isProcessing || newPassword !== confirmPassword || !newPassword || !confirmPassword}
              className="w-full h-12 rounded-xl font-semibold"
              style={{ backgroundColor: '#BFFF0B', color: '#000' }}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
