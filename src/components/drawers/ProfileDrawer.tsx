import { useState } from 'react';
import { X, Camera, Check, Mail, LogOut } from 'lucide-react';
import { myLeagues } from '../../data/mockData';
import { useAuthViewModel } from '../../viewmodels/auth.viewmodel';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const auth = useAuthViewModel();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [editingLeagueId, setEditingLeagueId] = useState<string | null>(null);
  const [tempUsername, setTempUsername] = useState('');
  const [leagueUsernames, setLeagueUsernames] = useState<Record<string, string>>({
    'league-1': 'SurvivorFan47',
    'league-2': 'SurvivorFan47',
  });

  // Login/Signup form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Password reset state
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
    setTempUsername(leagueUsernames[leagueId] || 'SurvivorFan47');
  };

  const saveUsername = (leagueId: string) => {
    if (tempUsername.trim()) {
      setLeagueUsernames({ ...leagueUsernames, [leagueId]: tempUsername });
    }
    setEditingLeagueId(null);
  };

  const cancelEditing = () => {
    setEditingLeagueId(null);
    setTempUsername('');
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Mobile: Bottom Drawer, Desktop: Center Panel */}
      <div className="fixed inset-x-0 bottom-0 lg:inset-0 lg:flex lg:items-center lg:justify-center z-50 pointer-events-none">
        <div 
          className="bg-slate-900 border-slate-800 flex flex-col max-h-[85vh] lg:max-h-[700px] w-full lg:w-[600px] rounded-t-2xl lg:rounded-2xl border-t lg:border pointer-events-auto animate-slide-in-bottom lg:animate-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-slate-800">
            <div>
              <h2 className="text-xl">Profile Settings</h2>
              <p className="text-sm text-slate-400 mt-1">Manage your profile and settings</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            {auth.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-slate-400">Loading...</div>
              </div>
            ) : !auth.isAuthenticated ? (
              /* Login/Signup Forms or Password Reset/Update */
              <div className="space-y-6">
                {/* Password Recovery Form - shown when user clicks reset link */}
                {auth.isPasswordRecovery ? (
                  <div>
                    <h3 className="text-xl mb-4">Reset Password</h3>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      {auth.error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400">
                          {auth.error}
                        </div>
                      )}
                      <div>
                        <label className="text-sm text-slate-400 mb-2 block">New Password</label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          required
                          minLength={6}
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 mb-2 block">Confirm Password</label>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          required
                          minLength={6}
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                        {newPassword && confirmPassword && newPassword !== confirmPassword && (
                          <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={auth.isLoading || newPassword !== confirmPassword || !newPassword || !confirmPassword}
                        className="w-full"
                        style={{ backgroundColor: '#BFFF0B', color: '#000' }}
                      >
                        {auth.isLoading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </form>
                  </div>
                ) : auth.isPasswordResetRequested ? (
                  /* Password Reset Requested Success Message */
                  <div>
                    <h3 className="text-xl mb-4">Check Your Email</h3>
                    <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-sm text-green-400 mb-4">
                      <p className="mb-2">Password reset email sent!</p>
                      <p>Please check your email and click the link to reset your password.</p>
                    </div>
                    <Button
                      onClick={() => {
                        auth.clearPasswordResetRequested();
                        setResetEmail('');
                      }}
                      className="w-full"
                      style={{ backgroundColor: '#BFFF0B', color: '#000' }}
                    >
                      Back to Login
                    </Button>
                  </div>
                ) : (
                  /* Login/Signup Tabs */
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')}>
                    <TabsList className="w-full bg-slate-800/50">
                      <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
                      <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="mt-6">
                      <form onSubmit={handleLogin} className="space-y-4">
                        {auth.error && (
                          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400">
                            {auth.error}
                          </div>
                        )}
                        <div>
                          <label className="text-sm text-slate-400 mb-2 block">Email</label>
                          <Input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="bg-slate-800/50 border-slate-700 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-400 mb-2 block">Password</label>
                          <Input
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className="bg-slate-800/50 border-slate-700 text-white"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setResetEmail(loginEmail);
                              handleRequestPasswordReset(e);
                            }}
                            className="text-sm text-slate-400 hover:text-slate-300 underline"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <Button
                          type="submit"
                          disabled={auth.isLoading}
                          className="w-full"
                          style={{ backgroundColor: '#BFFF0B', color: '#000' }}
                        >
                          {auth.isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                      </form>
                    </TabsContent>

                  <TabsContent value="signup" className="mt-6">
                    <form onSubmit={handleSignup} className="space-y-4">
                      {auth.error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400">
                          {auth.error}
                        </div>
                      )}
                      <div>
                        <label className="text-sm text-slate-400 mb-2 block">Username</label>
                        <Input
                          type="text"
                          value={signupUsername}
                          onChange={(e) => setSignupUsername(e.target.value)}
                          placeholder="Choose a username"
                          required
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 mb-2 block">Email</label>
                        <Input
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 mb-2 block">Password</label>
                        <Input
                          type="password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Create a password"
                          required
                          minLength={6}
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={auth.isLoading}
                        className="w-full"
                        style={{ backgroundColor: '#BFFF0B', color: '#000' }}
                      >
                        {auth.isLoading ? 'Creating account...' : 'Sign Up'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
                )}
              </div>
            ) : (
              <>
                {/* User Info Section */}
                <div className="mb-6">
                  <div className="bg-slate-800/50 rounded-xl p-4">
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
            <div className="mb-6">
              <h3 className="text-sm text-slate-400 mb-3">PROFILE IMAGE</h3>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Image Preview */}
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
                    
                    {/* Camera Button */}
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

                  {/* Instructions */}
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
            </div>

            {/* League Usernames Section */}
            <div className="mb-6">
              <h3 className="text-sm text-slate-400 mb-3">LEAGUE USERNAMES</h3>
              <div className="space-y-2">
                {myLeagues.map((league) => {
                  const isEditing = editingLeagueId === league.id;
                  const currentUsername = leagueUsernames[league.id] || 'SurvivorFan47';

                  return (
                    <div
                      key={league.id}
                      className="bg-slate-800/50 rounded-lg p-4"
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
                              value={tempUsername}
                              onChange={(e) => setTempUsername(e.target.value)}
                              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-slate-500 w-32 text-sm"
                              placeholder="Username"
                              autoFocus
                            />
                            <button
                              onClick={() => saveUsername(league.id)}
                              className="p-2 rounded-lg transition-all hover:bg-slate-700"
                              style={{ color: '#BFFF0B' }}
                              aria-label="Save username"
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
                            <span className="text-slate-300 text-sm">{currentUsername}</span>
                            <button
                              onClick={() => startEditing(league.id)}
                              className="px-3 py-1.5 rounded-lg border transition-all hover:bg-slate-700 text-sm"
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
            </div>

                {/* Support Section */}
                <div>
                  <h3 className="text-sm text-slate-400 mb-3">SUPPORT</h3>
                  <a
                    href="mailto:support@realitybracket.com?subject=Reality%20Bracket%20Support"
                    className="block bg-slate-800/50 rounded-lg p-4 hover:bg-slate-800 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(191, 255, 11, 0.1)' }}>
                        <Mail className="w-5 h-5" style={{ color: '#BFFF0B' }} />
                      </div>
                      <div className="flex-1">
                        <p className="mb-1">Contact Support</p>
                        <p className="text-xs text-slate-400">Get help or report an issue</p>
                      </div>
                    </div>
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
