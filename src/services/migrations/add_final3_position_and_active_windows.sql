-- Add explicit Final 3 position tracking and active scoring windows.
-- This removes dependency on picked_at ordering and supports medical evac replacements
-- while preserving historical points from prior picks.

ALTER TABLE roster_picks
ADD COLUMN final3_position INTEGER,
ADD COLUMN active_from_week INTEGER,
ADD COLUMN active_through_week INTEGER;

-- Backfill existing Final 3 picks using historical picked_at ordering once.
WITH ranked_final3 AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, league_id
      ORDER BY picked_at ASC, id ASC
    ) AS derived_position
  FROM roster_picks
  WHERE pick_type = 'final3'
)
UPDATE roster_picks rp
SET
  final3_position = LEAST(rf.derived_position, 3),
  active_from_week = 1,
  active_through_week = NULL
FROM ranked_final3 rf
WHERE rp.id = rf.id;

-- Ensure Final 3 rows always carry position/window metadata and boot rows do not.
ALTER TABLE roster_picks
ADD CONSTRAINT roster_picks_pick_type_fields_check
CHECK (
  (
    pick_type = 'final3'
    AND final3_position BETWEEN 1 AND 3
    AND active_from_week IS NOT NULL
    AND week_number IS NULL
  )
  OR
  (
    pick_type = 'boot'
    AND final3_position IS NULL
    AND active_from_week IS NULL
    AND active_through_week IS NULL
    AND week_number IS NOT NULL
  )
);

ALTER TABLE roster_picks
ADD CONSTRAINT roster_picks_active_window_check
CHECK (
  active_through_week IS NULL
  OR active_from_week IS NULL
  OR active_through_week >= active_from_week
);

-- One active Final 3 pick per user, per league, per position.
CREATE UNIQUE INDEX IF NOT EXISTS idx_roster_picks_final3_active_user_position
  ON roster_picks(user_id, league_id, final3_position)
  WHERE pick_type = 'final3' AND active_through_week IS NULL;

-- A contestant can only be actively drafted once for a given Final 3 position in a league.
CREATE UNIQUE INDEX IF NOT EXISTS idx_roster_picks_final3_active_league_position_contestant
  ON roster_picks(league_id, final3_position, contestant_id)
  WHERE pick_type = 'final3' AND active_through_week IS NULL;
