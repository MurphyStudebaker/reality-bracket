-- Add draft_order field to league_members table
-- This field determines the order in which players pick during the snake draft

ALTER TABLE league_members
ADD COLUMN draft_order INTEGER;

-- Add a comment for clarity
COMMENT ON COLUMN league_members.draft_order IS 'Order in which players pick during draft (1 = first, etc.)';
