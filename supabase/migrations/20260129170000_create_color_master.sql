-- Master table: one row per color, one column per variable.
-- Source of truth for color analysis; human can correct season here; app reads this for "Analyze Color".
-- Run in Supabase SQL Editor or via: npx supabase db push

CREATE TABLE IF NOT EXISTS color_master (
  -- Identity
  color_hex text PRIMARY KEY,

  -- Color values (one column per variable, no jsonb bundle)
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

  -- Algorithm result (12-season)
  primary_season text NOT NULL,
  season_2 text,
  season_3 text,
  confidence text NOT NULL DEFAULT 'medium' CHECK (confidence IN ('high', 'medium', 'low')),
  confidence_note text,
  lightness numeric(6, 2),
  saturation numeric(6, 2),
  temperature text,

  -- Human override: when set, app uses human_season / human_season_2 / human_season_3 as final
  human_season text,
  human_season_2 text,
  human_season_3 text,
  human_season_updated_at timestamptz,
  human_note text,

  -- Metadata
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

COMMENT ON TABLE color_master IS 'Master table: one row per color, one column per variable; human-corrected season; app reads this for final color analysis';
COMMENT ON COLUMN color_master.primary_season IS 'Algorithm 12-season result (e.g. spring-true, summer-soft)';
COMMENT ON COLUMN color_master.season_2 IS 'Second closest season (similar season)';
COMMENT ON COLUMN color_master.season_3 IS 'Third closest season';
COMMENT ON COLUMN color_master.human_season IS 'If set, overrides primary_season for display (manual correction)';
COMMENT ON COLUMN color_master.human_season_2 IS 'If set, overrides season_2 for display (manual correction)';
COMMENT ON COLUMN color_master.human_season_3 IS 'If set, overrides season_3 for display (manual correction)';
COMMENT ON COLUMN color_master.human_season_updated_at IS 'When human_season was last updated';

-- Optional: trigger to keep updated_at in sync
CREATE OR REPLACE FUNCTION color_master_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS color_master_updated_at ON color_master;
CREATE TRIGGER color_master_updated_at
  BEFORE UPDATE ON color_master
  FOR EACH ROW EXECUTE PROCEDURE color_master_updated_at();
