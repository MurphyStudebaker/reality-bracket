-- made_jury: 5 points, made_final_three: 10 points (final3 picks)

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
          AND ae.activity_type = 'made_jury'
          THEN 5

        WHEN rp.pick_type = 'final3'
          AND rp.active_from_week IS NOT NULL
          AND ae.week_number >= rp.active_from_week
          AND (rp.active_through_week IS NULL OR ae.week_number <= rp.active_through_week)
          AND ae.activity_type = 'made_final_three'
          THEN 10

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
          AND ae.activity_type = 'made_jury'
          THEN 5

        WHEN rp.pick_type = 'final3'
          AND rp.active_from_week IS NOT NULL
          AND ae.week_number >= rp.active_from_week
          AND (rp.active_through_week IS NULL OR ae.week_number <= rp.active_through_week)
          AND ae.activity_type = 'made_final_three'
          THEN 10

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
