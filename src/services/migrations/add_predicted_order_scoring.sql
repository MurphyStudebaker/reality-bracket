-- Add predicted-order scoring for completed seasons.
-- Awards +15 when a user's active Final 3 pick finishes in the predicted slot.
-- Requires finale activity events: finished_first, finished_second, finished_third.

-- Extend activity_events.activity_type constraint if present
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT con.conname INTO constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE nsp.nspname = 'public'
    AND rel.relname = 'activity_events'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%activity_type%'
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.activity_events DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE public.activity_events
ADD CONSTRAINT activity_events_activity_type_check
CHECK (
  activity_type IN (
    'tribal_immunity',
    'individual_immunity',
    'found_immunity_idol',
    'immunity',
    'eliminated',
    'medical_evacuated',
    'made_merge',
    'made_final_three',
    'made_jury',
    'finished_first',
    'finished_second',
    'finished_third'
  )
);

CREATE OR REPLACE FUNCTION public.calculate_pick_points(
  p_user_id UUID,
  p_league_id UUID,
  p_contestant_id UUID,
  p_pick_type TEXT,
  p_week_number INTEGER DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    SUM(
      CASE
        WHEN rp.pick_type = 'boot'
          AND ae.activity_type IN ('eliminated', 'medical_evacuated')
          AND rp.week_number IS NOT NULL
          AND rp.week_number = ae.week_number
          THEN 15

        WHEN rp.pick_type = 'final3'
          AND s.status = 'completed'
          AND rp.active_through_week IS NULL
          AND rp.final3_position IS NOT NULL
          AND (
            (ae.activity_type = 'finished_first' AND rp.final3_position = 1) OR
            (ae.activity_type = 'finished_second' AND rp.final3_position = 2) OR
            (ae.activity_type = 'finished_third' AND rp.final3_position = 3)
          )
          THEN 15

        WHEN rp.pick_type = 'final3'
          AND rp.active_from_week IS NOT NULL
          AND ae.week_number >= rp.active_from_week
          AND (rp.active_through_week IS NULL OR ae.week_number <= rp.active_through_week)
          AND ae.activity_type = 'tribal_immunity'
          THEN 5

        WHEN rp.pick_type = 'final3'
          AND rp.active_from_week IS NOT NULL
          AND ae.week_number >= rp.active_from_week
          AND (rp.active_through_week IS NULL OR ae.week_number <= rp.active_through_week)
          AND ae.activity_type IN ('individual_immunity', 'found_immunity_idol', 'immunity')
          THEN 10

        WHEN rp.pick_type = 'final3'
          AND rp.active_from_week IS NOT NULL
          AND ae.week_number >= rp.active_from_week
          AND (rp.active_through_week IS NULL OR ae.week_number <= rp.active_through_week)
          AND ae.activity_type IN ('made_jury', 'made_final_three')
          THEN 5

        ELSE 0
      END
    ),
    0
  )::INTEGER
  FROM roster_picks rp
  JOIN leagues l
    ON l.id = rp.league_id
  JOIN seasons s
    ON s.id = l.season_id
  JOIN activity_events ae
    ON ae.season_id = l.season_id
   AND ae.contestant_id = rp.contestant_id
  WHERE rp.user_id = p_user_id
    AND rp.league_id = p_league_id
    AND rp.contestant_id = p_contestant_id
    AND rp.pick_type = p_pick_type
    AND (p_week_number IS NULL OR ae.week_number <= p_week_number);
$$;

CREATE OR REPLACE FUNCTION public.calculate_user_total_points(
  p_user_id UUID,
  p_league_id UUID,
  p_week_number INTEGER DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    SUM(
      CASE
        WHEN rp.pick_type = 'boot'
          AND ae.activity_type IN ('eliminated', 'medical_evacuated')
          AND rp.week_number IS NOT NULL
          AND rp.week_number = ae.week_number
          THEN 15

        WHEN rp.pick_type = 'final3'
          AND s.status = 'completed'
          AND rp.active_through_week IS NULL
          AND rp.final3_position IS NOT NULL
          AND (
            (ae.activity_type = 'finished_first' AND rp.final3_position = 1) OR
            (ae.activity_type = 'finished_second' AND rp.final3_position = 2) OR
            (ae.activity_type = 'finished_third' AND rp.final3_position = 3)
          )
          THEN 15

        WHEN rp.pick_type = 'final3'
          AND rp.active_from_week IS NOT NULL
          AND ae.week_number >= rp.active_from_week
          AND (rp.active_through_week IS NULL OR ae.week_number <= rp.active_through_week)
          AND ae.activity_type = 'tribal_immunity'
          THEN 5

        WHEN rp.pick_type = 'final3'
          AND rp.active_from_week IS NOT NULL
          AND ae.week_number >= rp.active_from_week
          AND (rp.active_through_week IS NULL OR ae.week_number <= rp.active_through_week)
          AND ae.activity_type IN ('individual_immunity', 'found_immunity_idol', 'immunity')
          THEN 10

        WHEN rp.pick_type = 'final3'
          AND rp.active_from_week IS NOT NULL
          AND ae.week_number >= rp.active_from_week
          AND (rp.active_through_week IS NULL OR ae.week_number <= rp.active_through_week)
          AND ae.activity_type IN ('made_jury', 'made_final_three')
          THEN 5

        ELSE 0
      END
    ),
    0
  )::INTEGER
  FROM roster_picks rp
  JOIN leagues l
    ON l.id = rp.league_id
  JOIN seasons s
    ON s.id = l.season_id
  JOIN activity_events ae
    ON ae.season_id = l.season_id
   AND ae.contestant_id = rp.contestant_id
  WHERE rp.user_id = p_user_id
    AND rp.league_id = p_league_id
    AND (p_week_number IS NULL OR ae.week_number <= p_week_number);
$$;
