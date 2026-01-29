-- Cache for initial "Analyze Color" results: one row per color (by hex).
-- First request for a color runs the analysis; subsequent requests read from this table.
CREATE TABLE IF NOT EXISTS color_analysis_cache (
  color_hex text PRIMARY KEY,
  result jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

COMMENT ON TABLE color_analysis_cache IS 'Cached algorithmic color analysis (metrics, season, confidence) per color hex; only the first request per color runs the analysis';
