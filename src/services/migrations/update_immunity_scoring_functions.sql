-- Update scoring RPC functions to support split immunity scoring.
-- tribal_immunity: 5 points (final3 picks)
-- individual_immunity: 10 points (final3 picks)
-- Backward compatibility: legacy immunity still counts as 10 points.

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
          AND ae.activity_type = 'tribal_immunity'
          THEN 5

        WHEN rp.pick_type = 'final3'
          AND ae.activity_type IN ('individual_immunity', 'immunity')
          THEN 10

        WHEN rp.pick_type = 'final3'
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
          AND ae.activity_type = 'tribal_immunity'
          THEN 5

        WHEN rp.pick_type = 'final3'
          AND ae.activity_type IN ('individual_immunity', 'immunity')
          THEN 10

        WHEN rp.pick_type = 'final3'
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
  JOIN activity_events ae
    ON ae.season_id = l.season_id
   AND ae.contestant_id = rp.contestant_id
  WHERE rp.user_id = p_user_id
    AND rp.league_id = p_league_id
    AND (p_week_number IS NULL OR ae.week_number <= p_week_number);
$$;
