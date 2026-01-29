-- Run this once in Supabase Dashboard → SQL Editor → New query
-- Ensures color_ai_cache exists with all columns (fixes "non-2xx" if table was missing)

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS color_ai_cache (
  color_hex text PRIMARY KEY,
  ai_result jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

COMMENT ON TABLE color_ai_cache IS 'Cached AI 12-season analysis per color hex; only the first request per color hits the API';

-- 2. Add columns if not exists (safe to run multiple times)
ALTER TABLE color_ai_cache
  ADD COLUMN IF NOT EXISTS total_queries_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS report_to_human_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_api_calls_count int NOT NULL DEFAULT 0;

COMMENT ON COLUMN color_ai_cache.total_queries_count IS 'Number of times this color was shown AI re-analysis (cache or API)';
COMMENT ON COLUMN color_ai_cache.report_to_human_count IS 'Number of times users clicked "Send for human review" for this color';
COMMENT ON COLUMN color_ai_cache.ai_api_calls_count IS 'Number of times user requested AI re-analysis (clicked This looks wrong), regardless of cache or API';
