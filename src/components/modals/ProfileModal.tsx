import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Check, Mail, LogOut, Instagram, ArrowRight } from 'lucide-react';
import useSWR from 'swr';
import { mutate } from 'swr';
import { useAuthViewModel } from '../../viewmodels/auth.viewmodel';
import { SupabaseService } from '../../services/supabaseService';
import { fetcher, createKey } from '../../lib/swr';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import BaseModal from './BaseModal';
import type { League } from '../../data/mockData';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const auth = useAuthViewModel();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [editingLeagueId, setEditingLeagueId] = useState<string | null>(null);
  const [tempDisplayName, setTempDisplayName] = useState('');

  // Login/Signup form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showMoreLoginOptions, setShowMoreLoginOptions] = useState(false);
  const [showMoreSignupOptions, setShowMoreSignupOptions] = useState(false);
  
  // Password reset state
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Magic link state
  const [magicLinkEmail, setMagicLinkEmail] = useState('');

  // Clear error when drawer opens (only once when it first opens)
  const prevIsOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current && auth.clearError) {
      prevIsOpenRef.current = true;
      auth.clearError();
    } else if (!isOpen) {
      prevIsOpenRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Clear error when switching tabs (only when tab actually changes)
  const prevActiveTabRef = useRef(activeTab);
  useEffect(() => {
    if (activeTab !== prevActiveTabRef.current && auth.clearError) {
      prevActiveTabRef.current = activeTab;
      auth.clearError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Fetch leagues using SWR
  const leaguesKey = createKey('leagues-selector', auth.user?.id);
  const { data: leagues = [], isLoading: isLoadingLeagues } = useSWR<League[]>(
    isOpen && auth.isAuthenticated ? leaguesKey : null,
    fetcher
  );

  // Fetch display names using SWR
  const displayNamesKey = createKey('league-display-names', auth.user?.id);
  const { data: leagueDisplayNames = {}, mutate: mutateDisplayNames } = useSWR<Record<string, string>>(
    isOpen && auth.isAuthenticated ? displayNamesKey : null,
    fetcher
  );

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditing = (leagueId: string) => {
    setEditingLeagueId(leagueId);
    // Get current display name (empty string if not set, so user can set a new one)
    const currentDisplayName = leagueDisplayNames[leagueId] || '';
    setTempDisplayName(currentDisplayName);
  };

  const saveDisplayName = async (leagueId: string) => {
    if (!auth.user) {
      console.error('Cannot save display name: user not authenticated');
      return;
    }

    const displayName = tempDisplayName.trim();
    
    const success = await SupabaseService.updateLeagueDisplayName(
      auth.user.id,
      leagueId,
      displayName
    );


    if (success) {
      // Invalidate and revalidate display names cache
      if (displayNamesKey) {
        await mutateDisplayNames();
      }
      
      setEditingLeagueId(null);
      setTempDisplayName('');
    } else {
      console.error('Failed to update display name');
      // Keep editing mode open on error so user can try again
      alert('Failed to update display name. Please try again.');
    }
  };

  const cancelEditing = () => {
    setEditingLeagueId(null);
    setTempDisplayName('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await auth.signIn(loginEmail, loginPassword);
    if (success) {
      setLoginEmail('');
      setLoginPassword('');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await auth.signUp(signupEmail, signupPassword, signupUsername);
    if (success) {
      setSignupEmail('');
      setSignupPassword('');
      setSignupUsername('');
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    onClose();
  };

  const handleRequestPasswordReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await auth.requestPasswordReset(resetEmail || loginEmail);
  };

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await auth.signInWithMagicLink(magicLinkEmail);
    if (success) {
      setMagicLinkEmail('');
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    await auth.signInWithOAuth(provider);
  };

  const oauthButtons = (
    <div className="space-y-3">
      <Button
        type="button"
        onClick={() => handleOAuthSignIn('google')}
        disabled={auth.isLoading}
        className="w-full h-12 rounded-xl font-semibold text-slate-900 hover:opacity-90"
        style={{ backgroundColor: '#BFFF0B', color: '#000' }}
      >
        <span className="mr-2 inline-flex items-center">
          <svg
            viewBox="0 0 48 48"
            width="18"
            height="18"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M24 9.5c3.3 0 6.3 1.2 8.7 3.3l6.5-6.5C35.2 2.5 29.9 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.6 5.9C12 13.2 17.6 9.5 24 9.5z"
            />
            <path
              fill="currentColor"
              d="M46.5 24.5c0-1.6-.1-2.7-.4-3.9H24v7.4h12.8c-.3 2-1.8 5-5.1 7l7.8 6.1c4.6-4.2 7-10.4 7-16.6z"
            />
            <path
              fill="currentColor"
              d="M10.2 28.6c-1-2-1.6-4.2-1.6-6.6s.6-4.6 1.6-6.6l-7.6-5.9C.9 12.8 0 16.3 0 22s.9 9.2 2.6 12.5l7.6-5.9z"
            />
            <path
              fill="currentColor"
              d="M24 44c6 0 11.1-2 14.8-5.4l-7.8-6.1c-2.1 1.5-4.9 2.6-7 2.6-6.4 0-12-3.7-14-9.1l-7.6 5.9C6.5 42.6 14.6 48 24 48z"
            />
          </svg>
        </span>
        Continue with Google
      </Button>
    </div>
  );

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return;
    }
    const success = await auth.updatePassword(newPassword);
    if (success) {
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const headerTitle = auth.isAuthenticated ? 'Profile Settings' : 'Come On In, Guys';
  const headerSubtitle = auth.isAuthenticated ? 'Manage your profile and settings' : '';
  const header = (
    <div className="sticky top-0 z-10 flex items-center justify-between p-6 lg:p-8 border-b border-slate-800 bg-slate-900 rounded-t-2xl lg:rounded-2xl">
      <div>
        <h2 className="text-xl">{headerTitle}</h2>
        {headerSubtitle && (
          <p className="text-sm text-slate-400 mt-1">{headerSubtitle}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );

  const profileBody = (
    auth.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-slate-400">Loading...</div>
              </div>
            ) : !auth.isAuthenticated ? (
              /* Login/Signup Forms or Password Reset/Update */
              <div className="space-y-8">
                {/* Password Recovery Form - shown when user clicks reset link */}
                {auth.isPasswordRecovery ? (
                  <div>
                    <h3 className="text-xl mb-6 font-semibold">Reset Password</h3>
                    <form onSubmit={handleUpdatePassword} className="space-y-5">
                      {auth.error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-sm text-red-400">
                          {auth.error}
                        </div>
                      )}
                      <div>
                        <label className="text-sm text-slate-400 mb-3 block font-medium">New Password</label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
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
                          onChange={(e) => setConfirmPassword(e.target.value)}
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
                        disabled={auth.isLoading || newPassword !== confirmPassword || !newPassword || !confirmPassword}
                        className="w-full h-12 rounded-xl font-semibold"
                        style={{ backgroundColor: '#BFFF0B', color: '#000' }}
                      >
                        {auth.isLoading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </form>
                  </div>
                ) : auth.isMagicLinkRequested ? (
                  /* Magic Link Requested Success Message */
                  <div>
                    <h3 className="text-xl mb-6 font-semibold">Check Your Email</h3>
                    <div className="bg-green-500/10 rounded-xl p-5 text-sm text-green-400 mb-6">
                      <p className="mb-2">Magic link sent!</p>
                      <p>Please check your email and click the link to sign in.</p>
                    </div>
                    <Button
                      onClick={() => {
                        auth.clearMagicLinkRequested();
                        setMagicLinkEmail('');
                      }}
                      className="w-full h-12 rounded-xl font-semibold"
                      style={{ backgroundColor: '#BFFF0B', color: '#000' }}
                    >
                      Back to Login
                    </Button>
                  </div>
                ) : auth.isPasswordResetRequested ? (
                  /* Password Reset Requested Success Message */
                  <div>
                    <h3 className="text-xl mb-6 font-semibold">Check Your Email</h3>
                    <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-5 text-sm text-green-400 mb-6">
                      <p className="mb-2">Password reset email sent!</p>
                      <p>Please check your email and click the link to reset your password.</p>
                    </div>
                    <Button
                      onClick={() => {
                        auth.clearPasswordResetRequested();
                        setResetEmail('');
                      }}
                      className="w-full h-12 rounded-xl font-semibold"
                      style={{ backgroundColor: '#BFFF0B', color: '#000' }}
                    >
                      Back to Login
                    </Button>
                  </div>
                ) : (
                  /* Login/Signup Tabs */
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')}>
                    <TabsList className="w-full bg-slate-800/50 rounded-xl p-1">
                      <TabsTrigger 
                        value="login" 
                        className="flex-1 data-[state=active]:bg-slate-900 rounded-lg"
                        style={{
                          color: activeTab === 'login' ? '#BFFF0B' : '#94a3b8'
                        }}
                      >
                        Login
                      </TabsTrigger>
                      <TabsTrigger 
                        value="signup" 
                        className="flex-1 data-[state=active]:bg-slate-900 rounded-lg"
                        style={{
                          color: activeTab === 'signup' ? '#BFFF0B' : '#94a3b8'
                        }}
                      >
                        Sign Up
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="mt-8">
                      <div className="h-4"></div>
                      {oauthButtons}

                      <div className="h-4"></div>

                      <div className="mt-6">
                        {!showMoreLoginOptions ? (
                          <button
                            type="button"
                            onClick={() => setShowMoreLoginOptions(true)}
                            className="w-full text-sm text-slate-400 hover:text-slate-300 underline font-medium inline-flex items-center justify-center gap-2"
                            style={{ color: 'oklch(70.4% 0.04 256.788)' }}
                          >
                            More ways to login
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <div className="h-4"></div>
                            <div className="relative my-6">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700"></div>
                              </div>
                              <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-slate-900 text-slate-400">Or use a magic link</span>
                              </div>
                            </div>
                            <div className="h-4"></div>

                            {/* Magic Link Section */}
                            <div className="space-y-3 mb-6">
                              <form onSubmit={handleMagicLinkSignIn} className="space-y-3">
                                <div>
                                  <Input
                                    type="email"
                                    value={magicLinkEmail}
                                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                                    placeholder="Enter your email for magic link"
                                    required
                                    className="bg-slate-800/50 border-slate-700 text-white rounded-xl h-12"
                                  />
                                </div>
                                <Button
                                  type="submit"
                                  disabled={auth.isLoading || !magicLinkEmail}
                                  className="w-full h-12  rounded-xl font-medium"
                                  style={{ backgroundColor: '#BFFF0B', color: '#000' }}
                                >
                                  {auth.isLoading ? 'Sending...' : 'Send Magic Link'}
                                </Button>
                              </form>
                            </div>

                            <div className="relative my-6">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700"></div>
                              </div>
                              <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-slate-900 text-slate-400">Or continue with email and password</span>
                              </div>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-5">
                              {auth.error && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-sm text-red-400">
                                  {auth.error}
                                </div>
                              )}
                              <div className="flex flex-col gap-3">
                              <div>
                                <label className="text-sm text-slate-400 mb-1 block font-medium">Email</label>
                                <Input
                                  type="email"
                                  value={loginEmail}
                                  onChange={(e) => setLoginEmail(e.target.value)}
                                  placeholder="Enter your email"
                                  required
                                  className="bg-slate-800/50 border-slate-700 text-white rounded-xl h-12"
                                />
                              </div>
                              <div>
                                <label className="text-sm text-slate-400 mb-1 block font-medium">Password</label>
                                <Input
                                  type="password"
                                  value={loginPassword}
                                  onChange={(e) => setLoginPassword(e.target.value)}
                                  placeholder="Enter your password"
                                  required
                                  className="bg-slate-800/50 border-slate-700 text-white rounded-xl h-12"
                                />
                              </div>
                              <div className="h-2"></div>
                              <div className="flex justify-end">
                                {/* <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setResetEmail(loginEmail);
                                    handleRequestPasswordReset(e);
                                  }}
                                  className="text-sm mb-2 text-slate-400 hover:text-slate-300 underline font-medium"
                                >
                                  Forgot Password?
                                </button> */}
                              </div>
                              </div>
                              <Button
                                type="submit"
                                disabled={auth.isLoading}
                                className="w-full h-12 rounded-xl font-semibold"
                                style={{ backgroundColor: '#BFFF0B', color: '#000' }}
                              >
                                {auth.isLoading ? 'Signing in...' : 'Sign In'}
                              </Button>

                            </form>
                          </>
                        )}
                      </div>
                    </TabsContent>

                  <TabsContent value="signup" className="mt-8">
                    <div className="h-4"></div>

                    {oauthButtons}
                    <div className="h-4"></div>

                    <div className="mt-6">
                      {!showMoreSignupOptions ? (
                        <div>
                          {/* <div className="h-4"></div> */}
                        <button
                          type="button"
                          onClick={() => setShowMoreSignupOptions(true)}
                          className="w-full text-sm text-slate-400 hover:text-slate-300 underline font-medium inline-flex items-center justify-center gap-2"
                          style={{ color: 'oklch(70.4% 0.04 256.788)' }}
                        >
                          More ways to sign up
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        </div>
                      ) : (
                        <>
                          <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-4 bg-slate-900 text-slate-400">Or sign up with email</span>
                            </div>
                          </div>
                          <form onSubmit={handleSignup} className="space-y-8">
                            {auth.error && (
                              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-sm text-red-400">
                                {auth.error}
                              </div>
                            )}
                            <div className="flex flex-col gap-3">
                              <div>
                              <label className="text-sm text-slate-400 mb-1 block font-medium">Username</label>
                              <Input
                                type="text"
                                value={signupUsername}
                                onChange={(e) => setSignupUsername(e.target.value)}
                                placeholder="Choose a username"
                                required
                                className="bg-slate-800/50 border-slate-700 text-white rounded-xl h-12"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-slate-400 mb-1 mt-2 block font-medium">Email</label>
                              <Input
                                type="email"
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="bg-slate-800/50 border-slate-700 text-white rounded-xl h-12"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-slate-400 mb-1 block font-medium">Password</label>
                              <Input
                                type="password"
                                value={signupPassword}
                                onChange={(e) => setSignupPassword(e.target.value)}
                                placeholder="Create a password"
                                required
                                minLength={6}
                                className="bg-slate-800/50 border-slate-700 text-white rounded-xl h-12"
                              />
                            </div>
                            </div>
                            <div className="h-4"></div>
                            <Button
                              type="submit"
                              disabled={auth.isLoading}
                              className="w-full h-12 rounded-xl font-semibold"
                              style={{ backgroundColor: '#BFFF0B', color: '#000' }}
                            >
                              {auth.isLoading ? 'Creating account...' : 'Sign Up'}
                            </Button>
                          </form>
                        </>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                )}
              </div>
            ) : (
              <>
                {/* User Info Section */}
                <div className="mb-8">
                  <div className="bg-slate-800/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold">{auth.user?.username || 'User'}</p>
                        <p className="text-sm text-slate-400">{auth.user?.email}</p>
                      </div>
                      <Button
                        onClick={handleSignOut}
                        variant="outline"
                        size="sm"
                        className="border-slate-700 text-slate-300 hover:bg-slate-700"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Profile Image Section */}
            {/* <div className="mb-6">
              <h3 className="text-sm text-slate-400 mb-3">PROFILE IMAGE</h3>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative">
                    <div 
                      className="w-24 h-24 rounded-full overflow-hidden border-4 flex items-center justify-center text-3xl"
                      style={{ 
                        borderColor: '#BFFF0B',
                        backgroundColor: profileImage ? 'transparent' : '#334155'
                      }}
                    >
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-500">SF</span>
                      )}
                    </div>
                    
                    <label 
                      htmlFor="profile-upload"
                      className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-2 border-slate-900 transition-all hover:scale-110"
                      style={{ backgroundColor: '#BFFF0B' }}
                    >
                      <Camera className="w-4 h-4 text-slate-900" />
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm text-slate-300 mb-1">
                      Upload Your Photo
                    </p>
                    <p className="text-xs text-slate-500">
                      This image will be displayed across all your leagues
                    </p>
                  </div>
                </div>
              </div>
            </div> */}

            {/* League Display Names Section */}
            <div className="mb-8">
              <h3 className="text-sm text-slate-400 mb-4 font-semibold">LEAGUE DISPLAY NAMES</h3>
              {isLoadingLeagues ? (
                <div className="text-center text-slate-400 py-4">Loading leagues...</div>
              ) : leagues.length === 0 ? (
                <div className="text-center text-slate-400 py-4">
                  <p>No leagues found.</p>
                  <p className="text-xs mt-2">Join or create a league to set display names.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leagues.map((league) => {
                    const isEditing = editingLeagueId === league.id;
                    // Use display name if set, otherwise show placeholder
                    const currentDisplayName = leagueDisplayNames[league.id] || 'Not set';
                    return (
                      <div
                        key={league.id}
                        className="rounded-xl p-5 py-2"
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="truncate">{league.name}</p>
                            <p className="text-xs text-slate-400">{league.season}</p>
                          </div>

                          {isEditing ? (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <input
                                type="text"
                                value={tempDisplayName}
                                onChange={(e) => setTempDisplayName(e.target.value)}
                                className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:outline-none focus:border-slate-500 w-32 text-sm"
                                placeholder="Display name"
                                autoFocus
                              />
                              <button
                                onClick={() => saveDisplayName(league.id)}
                                className="p-2 rounded-lg transition-all hover:bg-slate-700"
                                style={{ color: '#BFFF0B' }}
                                aria-label="Save display name"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-2 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-slate-700 transition-all"
                                aria-label="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-slate-300 text-sm">{currentDisplayName}</span>
                              <button
                                onClick={() => startEditing(league.id)}
                                className="px-4 py-2 rounded-xl border transition-all hover:bg-slate-700 text-sm font-medium"
                                style={{ borderColor: '#BFFF0B', color: '#BFFF0B' }}
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

                {/* Support Section */}
                <div>
                  <h3 className="text-sm text-slate-400 mb-4 font-semibold">SUPPORT</h3>
                  <p className="text-xs text-slate-400 my-4 mb-4">This app is built by an individual developer. If you have any issues or feedback, please contact me and I'll try to fix it.</p>
                  <div className="flex flex-col gap-1 my-2">
                  <a
                    href="mailto:support@realitybracket.com?subject=Reality%20Bracket%20Support"
                    className="block p-2 rounded-lg hover:bg-slate-800 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(191, 255, 11, 0.1)' }}>
                        <Mail className="w-5 h-5" style={{ color: '#BFFF0B' }} />
                      </div>
                      <div className="flex-1">
                        <p className="mb-1">murphy.stude@gmail.com</p>
                      </div>
                    </div>
                  </a>
                  <a
                    href="https://www.instagram.com/murphy_builds/"
                    className="block mt-2 mb-2 p-2 rounded-lg hover:bg-slate-800 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(191, 255, 11, 0.1)' }}>
                        <Instagram className="w-5 h-5" style={{ color: '#BFFF0B' }} />
                      </div>
                      <div className="flex-1">
                        <p className="mb-1">@murphy_builds</p>
                      </div>
                    </div>
                  </a>
                  </div>
                </div>
              </>
    )
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      header={header}
      sizeClassName="lg:w-full lg:max-w-md"
      bodyClassName="flex-1 overflow-y-auto p-6 lg:p-8"
      children={profileBody}
    />
  );
}
