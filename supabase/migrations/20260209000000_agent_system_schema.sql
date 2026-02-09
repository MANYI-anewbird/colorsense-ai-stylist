-- Agent system: first_ai_result cached per color, agent_final_result for display
-- first_ai_result: First AI analysis (no engineering context), cached for arbitrator input
-- agent_final_result: Final agent conclusion (primary, optional secondary, confidence, temperature)
-- report_to_human_count: Error reports when user clicks "This looks wrong"

-- Add new columns to color_ai_cache
ALTER TABLE color_ai_cache
  ADD COLUMN IF NOT EXISTS first_ai_result jsonb,
  ADD COLUMN IF NOT EXISTS agent_final_result jsonb;

COMMENT ON COLUMN color_ai_cache.first_ai_result IS 'First AI analysis (no engineering) - cached for arbitrator; one per color hex';
COMMENT ON COLUMN color_ai_cache.agent_final_result IS 'Agent final conclusion: { primarySeason, secondarySeason?, confidencePct, temperature }';

-- Migrate existing ai_result to first_ai_result for backward compatibility (first analysis ever run)
UPDATE color_ai_cache
SET first_ai_result = ai_result
WHERE first_ai_result IS NULL AND ai_result IS NOT NULL;
