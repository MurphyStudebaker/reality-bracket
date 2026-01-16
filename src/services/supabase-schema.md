# Supabase Database Schema

This document outlines the database schema for the Reality Bracket app.

## Tables

### users
Stores user account information.
**Note:** The `id` field should reference `auth.users(id)` to link with Supabase Auth.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Important:** A database trigger automatically creates a user record when someone signs up via Supabase Auth. See `migrations/create_user_on_signup.sql` for the trigger implementation.

### seasons
Stores reality show seasons.

```sql
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  number INTEGER NOT NULL,
  status TEXT CHECK (status IN ('active', 'completed', 'upcoming')),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### contestants
Stores contestants for each season.

```sql
CREATE TABLE contestants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  occupation TEXT,
  hometown TEXT,
  image_url TEXT,
  status TEXT CHECK (status IN ('active', 'eliminated', 'jury', 'final3')),
  eliminated_week INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### leagues
Stores fantasy leagues created by users.

```sql
CREATE TABLE leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  created_by_id UUID REFERENCES users(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL,
  draft_date DATE,
  status TEXT CHECK (status IN ('not_started', 'draft_open', 'draft_closed', 'completed')) DEFAULT 'not_started',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### league_members
Stores league membership relationships.

```sql
CREATE TABLE league_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_points INTEGER DEFAULT 0,
  draft_order INTEGER,
  UNIQUE(league_id, user_id)
);
```

### roster_picks
Stores user picks for Final 3 and Bottom 1 contestants.

```sql
CREATE TABLE roster_picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  contestant_id UUID REFERENCES contestants(id) ON DELETE CASCADE,
  pick_type TEXT CHECK (pick_type IN ('final3', 'boot')),
  week_number INTEGER,
  picked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, league_id, contestant_id)
);
```
Each boot pick stores the `week_number` it is predicting so the app can award points on a weekly basis while final-3 picks keep this column `NULL`.

### contestant_scores
Stores weekly scoring events for contestants.

```sql
CREATE TABLE contestant_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contestant_id UUID REFERENCES contestants(id) ON DELETE CASCADE,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,
  score_type TEXT CHECK (score_type IN ('immunity', 'jury', 'final3', 'boot', 'predicted_order')),
  points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### activity_items
Stores activity feed items for leagues.

```sql
CREATE TABLE activity_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  contestant_id UUID REFERENCES contestants(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  contestant_name TEXT NOT NULL,
  points INTEGER NOT NULL,
  type TEXT CHECK (type IN ('immunity', 'jury', 'final3', 'boot', 'predicted_order')),
  week INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Indexes

```sql
-- Improve query performance
CREATE INDEX idx_league_members_user_id ON league_members(user_id);
CREATE INDEX idx_league_members_league_id ON league_members(league_id);
CREATE INDEX idx_roster_picks_user_league ON roster_picks(user_id, league_id);
CREATE INDEX idx_contestant_scores_contestant ON contestant_scores(contestant_id);
CREATE INDEX idx_activity_items_league ON activity_items(league_id, created_at DESC);
CREATE UNIQUE INDEX idx_roster_picks_boot_week ON roster_picks(user_id, league_id, week_number) WHERE pick_type = 'boot' AND week_number IS NOT NULL;
```

## Row Level Security (RLS)

Enable RLS on all tables and create policies:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE roster_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_items ENABLE ROW LEVEL SECURITY;

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

-- League members can read league data
CREATE POLICY "League members can read league"
  ON leagues FOR SELECT
  USING (
    id IN (
      SELECT league_id FROM league_members WHERE user_id = auth.uid()
    )
  );

-- Users can read league member data for their leagues
CREATE POLICY "Users can read league members"
  ON league_members FOR SELECT
  USING (
    league_id IN (
      SELECT league_id FROM league_members WHERE user_id = auth.uid()
    )
  );

-- Users can manage their own roster picks
CREATE POLICY "Users can manage own roster"
  ON roster_picks FOR ALL
  USING (user_id = auth.uid());

-- Users can read activity for their leagues
CREATE POLICY "Users can read league activity"
  ON activity_items FOR SELECT
  USING (
    league_id IN (
      SELECT league_id FROM league_members WHERE user_id = auth.uid()
    )
  );
```

## Scoring System

Points are awarded as follows:
- **Immunity Challenge Win**: +10 points
- **Making Jury**: +5 points
- **Final 3**: +5 points
- **Finishing in Predicted Order**: +10 points
- **Correctly Predicted Boot**: +15 points
