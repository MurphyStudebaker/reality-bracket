import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuthViewModel } from '../../viewmodels/auth.viewmodel';
import { SupabaseService } from '../../services/supabaseService';
import logoImage from '../../assets/icon.png';

type AuthStatus = 'loading' | 'success' | 'error';

export default function MagicLinkPage() {
  const auth = useAuthViewModel();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleMagicLink = async () => {
      try {
        // Log the current URL for debugging
        console.log('Magic link page loaded with URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Search:', window.location.search);

        // Check if we have any auth-related parameters
        const hash = window.location.hash;
        const hashParams = hash ? new URLSearchParams(hash.substring(1)) : new URLSearchParams();
        const searchParams = new URLSearchParams(window.location.search);

        const hasAuthParams = hashParams.has('access_token') ||
                             hashParams.has('token') ||
                             searchParams.has('token') ||
                             hashParams.get('type') === 'magiclink' ||
                             hashParams.get('type') === 'signup';

        console.log('Auth parameters found:', {
          hashParams: Object.fromEntries(hashParams),
          searchParams: Object.fromEntries(searchParams),
          hasAuthParams
        });

        if (!hasAuthParams) {
          setStatus('error');
          setErrorMessage('Invalid magic link. Please request a new one.');
          return;
        }

        // Try to manually get the session to trigger authentication
        const supabase = SupabaseService.getClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        console.log('Session check result:', {
          hasSession: !!session,
          user: session?.user?.email,
          error: sessionError
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          setStatus('error');
          setErrorMessage(`Authentication failed: ${sessionError.message}`);
          return;
        }

        if (session?.user) {
          console.log('Magic link authentication successful');
          setStatus('success');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          // Wait a bit more for the auth state to update
          setTimeout(() => {
            if (auth.isAuthenticated) {
              console.log('Magic link authentication successful (delayed)');
              setStatus('success');
              setTimeout(() => {
                window.location.href = '/';
              }, 2000);
            } else {
              console.log('Magic link authentication failed');
              setStatus('error');
              setErrorMessage(auth.error || 'Authentication failed. The magic link may be invalid or expired.');
            }
          }, 2000);
        }

      } catch (error: any) {
        console.error('Error processing magic link:', error);
        setStatus('error');
        setErrorMessage(error?.message || 'Failed to authenticate with magic link.');
      }
    };

    handleMagicLink();
  }, []);

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

        {/* Status Content */}
        {status === 'loading' && (
          <>
            <h1 className="text-2xl font-bold mb-4">Signing you in...</h1>
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#BFFF0B' }} />
            </div>
            <p className="text-slate-400">Please wait while we authenticate your magic link.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-2xl font-bold mb-4">Welcome back!</h1>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-16 h-16" style={{ color: '#BFFF0B' }} />
            </div>
            <p className="text-slate-400 mb-4">Successfully signed in with your magic link.</p>
            <p className="text-sm text-slate-500">Redirecting you to the app...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold mb-4">Authentication Failed</h1>
            <div className="flex items-center justify-center mb-4">
              <XCircle className="w-16 h-16 text-red-400" />
            </div>
            <p className="text-slate-400 mb-6">{errorMessage}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: '#BFFF0B',
                color: '#000'
              }}
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
