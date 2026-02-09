-- Add engineering_result column to store algorithm output for display
ALTER TABLE color_ai_cache
  ADD COLUMN IF NOT EXISTS engineering_result jsonb;

COMMENT ON COLUMN color_ai_cache.engineering_result IS 'Engineering/algorithm result: { season12, temperature }';
