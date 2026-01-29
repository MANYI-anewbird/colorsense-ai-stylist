-- Cache for AI re-analysis results: one row per color (by hex).
-- First request for a color calls the API; subsequent requests read from this table.
CREATE TABLE IF NOT EXISTS color_ai_cache (
  color_hex text PRIMARY KEY,
  ai_result jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

COMMENT ON TABLE color_ai_cache IS 'Cached AI 12-season analysis per color hex; only the first request per color hits the API';
