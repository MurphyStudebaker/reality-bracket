-- Backfill Final 3 picks missing active_from_week so RPC scoring matches intended "week 1 start".
-- Matches app insert default in SupabaseService.addRosterPick (activeFromWeek ?? 1).
-- Review in staging before applying to production.

UPDATE roster_picks
SET active_from_week = 1
WHERE pick_type = 'final3'
  AND active_from_week IS NULL;
