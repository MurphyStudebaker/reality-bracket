# Supabase Setup Guide

This guide will help you connect your Reality Bracket app to Supabase.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: Reality Bracket
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**

## Step 2: Set Up Database Tables

1. In your Supabase project, go to **SQL Editor**
2. Copy and paste the SQL from `/services/supabase-schema.md`
3. Run each table creation statement
4. Run the index creation statements
5. Run the RLS (Row Level Security) statements

## Step 3: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## Step 4: Get Your API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy your:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 5: Configure Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Never commit your `.env` file to git!

## Step 6: Initialize Supabase Client

Update `/services/supabaseService.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Step 7: Implement Service Methods

Remove the `// TODO: Connect to Supabase` comments and implement the actual Supabase calls.

### Example: Get Leagues by User ID

**Before**:
```typescript
static async getLeaguesByUserId(userId: string): Promise<League[]> {
  // TODO: Connect to Supabase
  return [];
}
```

**After**:
```typescript
static async getLeaguesByUserId(userId: string): Promise<League[]> {
  const { data, error } = await supabase
    .from('league_members')
    .select(`
      leagues (
        id,
        name,
        season_id,
        created_by_id,
        invite_code,
        created_at,
        draft_date
      )
    `)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching leagues:', error);
    return [];
  }
  
  return data?.map(item => item.leagues) || [];
}
```

## Step 8: Seed Initial Data

Create some test data in your database:

### Create a Season
```sql
INSERT INTO seasons (name, number, status, start_date)
VALUES ('Season 47', 47, 'active', '2024-09-01');
```

### Add Contestants
```sql
INSERT INTO contestants (season_id, name, age, occupation, hometown, status)
VALUES 
  ((SELECT id FROM seasons WHERE number = 47), 'Rachel LaMont', 34, 'Graphic Designer', 'Southfield, MI', 'final3'),
  ((SELECT id FROM seasons WHERE number = 47), 'Sam Phalen', 24, 'Sports Reporter', 'Schaumburg, IL', 'final3');
```

## Step 9: Enable Real-Time Features (Optional)

To get live updates, enable real-time in ViewModels:

```typescript
useEffect(() => {
  const channel = supabase
    .channel('league-standings')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'league_members',
        filter: `league_id=eq.${leagueId}`
      },
      (payload) => {
        // Refresh data when changes occur
        fetchStandings();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [leagueId]);
```

## Step 10: Test Your Integration

1. Start your dev server: `npm run dev`
2. Try creating a league
3. Try joining a league
4. Check Supabase dashboard to verify data is being created

## Authentication Setup

The app uses Supabase Auth. To enable:

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates if needed
4. Update `useAuthViewModel` to use real auth methods

## Troubleshooting

### "relation does not exist" error
- Make sure you ran all the CREATE TABLE statements
- Check table names match exactly

### "permission denied" error
- Check Row Level Security policies
- Ensure RLS is configured correctly

### Can't connect to Supabase
- Verify your URL and key in `.env`
- Make sure you're using `VITE_` prefix for Vite projects
- Restart your dev server after adding env variables

## Security Best Practices

1. **Never commit** `.env` file or API keys
2. **Always use** RLS (Row Level Security) policies
3. **Validate input** on both client and server
4. **Use prepared statements** (Supabase does this automatically)
5. **Limit anon key** permissions appropriately

## Next Steps

- Implement authentication flow
- Add error handling and retry logic
- Set up database backups
- Configure production environment
- Add monitoring and logging

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
