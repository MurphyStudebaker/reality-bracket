-- Add week_number column to track per-week boot picks
ALTER TABLE roster_picks
  ADD COLUMN IF NOT EXISTS week_number INTEGER;

-- Ensure only one boot pick per user/league per week
CREATE UNIQUE INDEX IF NOT EXISTS idx_roster_picks_boot_week
  ON roster_picks(user_id, league_id, week_number)
  WHERE pick_type = 'boot' AND week_number IS NOT NULL;

