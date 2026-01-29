-- Reorder color_master so human_season, human_season_2, human_season_3 are adjacent (not after updated_at).
-- PostgreSQL has no ALTER COLUMN ORDER; we recreate the table with correct column order and copy data.

-- 1) Drop triggers that reference color_master (restore after rename)
DROP TRIGGER IF EXISTS sync_color_master_on_cache_change ON color_analysis_cache;
DROP TRIGGER IF EXISTS color_master_updated_at ON color_master;

-- 2) Create new table with desired column order (human_season, human_season_2, human_season_3 together)
CREATE TABLE color_master_new (
  color_hex text PRIMARY KEY,
  rgb_r int NOT NULL,
  rgb_g int NOT NULL,
  rgb_b int NOT NULL,
  hsl_h int NOT NULL,
  hsl_s int NOT NULL,
  hsl_l int NOT NULL,
  lab_l numeric(10, 4) NOT NULL,
  lab_a numeric(10, 4) NOT NULL,
  lab_b numeric(10, 4) NOT NULL,
  lch_l numeric(10, 4) NOT NULL,
  lch_c numeric(10, 4) NOT NULL,
  lch_h numeric(10, 4) NOT NULL,
  primary_season text NOT NULL,
  season_2 text,
  season_3 text,
  confidence text NOT NULL DEFAULT 'medium' CHECK (confidence IN ('high', 'medium', 'low')),
  confidence_note text,
  lightness numeric(6, 2),
  saturation numeric(6, 2),
  temperature text,
  human_season text,
  human_season_2 text,
  human_season_3 text,
  human_season_updated_at timestamptz,
  human_note text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3) Copy data (column names match, order in SELECT doesn't matter)
INSERT INTO color_master_new (
  color_hex, rgb_r, rgb_g, rgb_b, hsl_h, hsl_s, hsl_l,
  lab_l, lab_a, lab_b, lch_l, lch_c, lch_h,
  primary_season, season_2, season_3, confidence, confidence_note,
  lightness, saturation, temperature,
  human_season, human_season_2, human_season_3, human_season_updated_at, human_note,
  created_at, updated_at
)
SELECT
  color_hex, rgb_r, rgb_g, rgb_b, hsl_h, hsl_s, hsl_l,
  lab_l, lab_a, lab_b, lch_l, lch_c, lch_h,
  primary_season, season_2, season_3, confidence, confidence_note,
  lightness, saturation, temperature,
  human_season, human_season_2, human_season_3, human_season_updated_at, human_note,
  created_at, updated_at
FROM color_master;

-- 4) Swap tables
DROP TABLE color_master;
ALTER TABLE color_master_new RENAME TO color_master;

-- 5) Restore triggers
CREATE TRIGGER color_master_updated_at
  BEFORE UPDATE ON color_master
  FOR EACH ROW EXECUTE PROCEDURE color_master_updated_at();

CREATE TRIGGER sync_color_master_on_cache_change
  AFTER INSERT OR UPDATE OF result ON color_analysis_cache
  FOR EACH ROW EXECUTE PROCEDURE sync_color_master_from_cache();
