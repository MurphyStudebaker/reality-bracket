-- Final 3 scoring starts after league draft completes (no retroactive weeks).
-- See finalize_league_final3_scoring() called when status → draft_closed.

ALTER TABLE public.leagues
  ADD COLUMN IF NOT EXISTS draft_completed_at timestamptz NULL;

CREATE OR REPLACE FUNCTION public.compute_final3_active_from_week(
  p_league_id uuid,
  p_as_of timestamptz
)
RETURNS integer
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT MAX(ae.week_number)
      FROM activity_events ae
      JOIN leagues l ON l.season_id = ae.season_id
      WHERE l.id = p_league_id
        AND ae.created_at <= p_as_of
    ),
    0
  ) + 1;
$$;

CREATE OR REPLACE FUNCTION public.finalize_league_final3_scoring(p_league_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_completed_at timestamptz;
  v_active_from integer;
  v_is_first_finalize boolean;
BEGIN
  SELECT draft_completed_at INTO v_completed_at
  FROM leagues
  WHERE id = p_league_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'League not found: %', p_league_id;
  END IF;

  v_is_first_finalize := v_completed_at IS NULL;

  IF v_is_first_finalize THEN
    v_completed_at := NOW();
    UPDATE leagues
    SET draft_completed_at = v_completed_at
    WHERE id = p_league_id;
  END IF;

  v_active_from := public.compute_final3_active_from_week(p_league_id, v_completed_at);

  IF v_is_first_finalize THEN
    UPDATE roster_picks
    SET active_from_week = v_active_from
    WHERE league_id = p_league_id
      AND pick_type = 'final3'
      AND active_through_week IS NULL;
  ELSE
    UPDATE roster_picks
    SET active_from_week = v_active_from
    WHERE league_id = p_league_id
      AND pick_type = 'final3'
      AND active_from_week IS NULL;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.compute_final3_active_from_week(uuid, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_league_final3_scoring(uuid) TO authenticated;

-- Backfill: anchor completion time for leagues that already finished drafting
UPDATE public.leagues l
SET draft_completed_at = sub.completed_at
FROM (
  SELECT rp.league_id, MAX(rp.picked_at) AS completed_at
  FROM public.roster_picks rp
  WHERE rp.pick_type = 'final3'
  GROUP BY rp.league_id
) sub
WHERE l.id = sub.league_id
  AND l.status IN ('draft_closed', 'completed')
  AND l.draft_completed_at IS NULL;

-- Backfill: fix picks that defaulted to week 1 before draft completion was enforced
UPDATE public.roster_picks rp
SET active_from_week = public.compute_final3_active_from_week(rp.league_id, l.draft_completed_at)
FROM public.leagues l
WHERE rp.league_id = l.id
  AND rp.pick_type = 'final3'
  AND l.draft_completed_at IS NOT NULL
  AND l.status IN ('draft_closed', 'completed')
  AND rp.active_from_week = 1
  AND public.compute_final3_active_from_week(rp.league_id, l.draft_completed_at) <> 1;
