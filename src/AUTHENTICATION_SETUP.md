# Authentication Setup Summary

This document summarizes the Supabase authentication implementation for the Reality Bracket app.

## What Was Implemented

### 1. Supabase Service Layer (`src/services/supabaseService.ts`)
- ✅ Implemented `getCurrentUser()` - Fetches the current authenticated user
- ✅ Implemented `signUp()` - Creates a new user account with email, password, and username
- ✅ Implemented `signIn()` - Authenticates an existing user
- ✅ Implemented `signOut()` - Signs out the current user
- ✅ Added `getClient()` method to access the Supabase client instance

### 2. Authentication ViewModel (`src/viewmodels/auth.viewmodel.ts`)
- ✅ Integrated with Supabase authentication
- ✅ Added auth state listener to automatically update user state
- ✅ Handles loading states and error messages
- ✅ Provides `isAuthenticated` flag for UI conditional rendering

### 3. Profile Drawer Component (`src/components/drawers/ProfileDrawer.tsx`)
- ✅ Added login form with email and password fields
- ✅ Added signup form with username, email, and password fields
- ✅ Tabbed interface to switch between login and signup
- ✅ Shows user profile information when authenticated
- ✅ Sign out button when logged in
- ✅ Error message display for authentication failures
- ✅ Loading states during authentication operations

### 4. Database Trigger (`src/services/migrations/create_user_on_signup.sql`)
- ✅ Automatic user record creation when signing up via Supabase Auth
- ✅ Extracts username from user_metadata if provided
- ✅ Falls back to generating username from email if not provided
- ✅ Ensures username uniqueness
- ✅ Handles edge cases and conflicts

## Setup Instructions

### Step 1: Update Users Table Schema
Make sure your `users` table references `auth.users`:

```sql
-- If the table already exists, update it:
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS users_id_fkey,
  ADD CONSTRAINT users_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- If creating new, use:
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Step 2: Run the Migration
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Open `src/services/migrations/create_user_on_signup.sql`
4. Copy and paste the SQL into the editor
5. Click **Run** to execute

### Step 3: Set Up RLS Policies
Make sure you have the following RLS policies on the `users` table:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own data (for signup)
CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### Step 4: Enable Email Authentication
1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates if desired

### Step 5: Environment Variables
Make sure you have your Supabase credentials in `.env`:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## How It Works

1. **User Signs Up:**
   - User fills out signup form in Profile Drawer
   - `signUp()` is called with email, password, and username
   - Supabase Auth creates the auth user
   - Username is stored in `user_metadata`
   - Database trigger automatically creates user record in `users` table
   - User is automatically signed in

2. **User Signs In:**
   - User fills out login form in Profile Drawer
   - `signIn()` is called with email and password
   - Supabase Auth authenticates the user
   - User record is fetched from `users` table
   - User state is updated in the app

3. **User Signs Out:**
   - User clicks sign out button
   - `signOut()` is called
   - Supabase Auth signs out the user
   - User state is cleared

4. **Auth State Listener:**
   - Automatically listens for auth state changes
   - Updates user state when user signs in/out
   - Handles token refresh events

## Usage

The authentication is integrated into the Profile Drawer component. Users can:
- Click the profile icon in the top right corner
- See login/signup forms if not authenticated
- See their profile information if authenticated
- Sign out from their account

The `useAuthViewModel` hook can be used in any component to access authentication state:

```typescript
import { useAuthViewModel } from '../viewmodels/auth.viewmodel';

function MyComponent() {
  const auth = useAuthViewModel();
  
  if (auth.isLoading) return <div>Loading...</div>;
  if (!auth.isAuthenticated) return <div>Please log in</div>;
  
  return <div>Welcome, {auth.user?.username}!</div>;
}
```

## Troubleshooting

### "permission denied" error when signing up
- Check that RLS policies are set up correctly
- Ensure the trigger function has `SECURITY DEFINER` privilege
- Verify the `users` table allows inserts

### User record not created automatically
- Check that the trigger migration was run successfully
- Verify the trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
- Check Supabase logs for trigger execution errors

### Username not being saved
- Ensure username is passed in `user_metadata` during signup
- Check that the trigger function reads from `raw_user_meta_data->>'username'`
- Verify username uniqueness constraints

## Next Steps

- [ ] Add email verification flow
- [ ] Add password reset functionality
- [ ] Add social authentication (Google, GitHub, etc.)
- [ ] Add profile image upload to Supabase Storage
- [ ] Add username change functionality
- [ ] Add account deletion functionality

