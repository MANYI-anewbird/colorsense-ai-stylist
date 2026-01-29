-- Add columns to track "report to human" and total AI re-analysis views for rate calculation.
ALTER TABLE color_ai_cache
  ADD COLUMN IF NOT EXISTS total_queries_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS report_to_human_count int NOT NULL DEFAULT 0;

COMMENT ON COLUMN color_ai_cache.total_queries_count IS 'Number of times this color was shown AI re-analysis (cache or API)';
COMMENT ON COLUMN color_ai_cache.report_to_human_count IS 'Number of times users clicked "Send for human review" for this color';
