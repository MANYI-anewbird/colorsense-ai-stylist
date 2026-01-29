-- Track how many times OpenAI was actually called for this color (cache miss = 1 call).
-- AI call rate = ai_api_calls_count / total_queries_count (high rate = initial result was often wrong, many first-time requests).
ALTER TABLE color_ai_cache
  ADD COLUMN IF NOT EXISTS ai_api_calls_count int NOT NULL DEFAULT 0;

COMMENT ON COLUMN color_ai_cache.ai_api_calls_count IS 'Number of times OpenAI API was called for this color (1 per color on first request, then cached)';
