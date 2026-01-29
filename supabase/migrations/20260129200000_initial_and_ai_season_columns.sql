-- Final data asset: algorithm result = initial_primary_season, initial_season_1, initial_season_2;
-- AI result = ai_primary_season, ai_season_2, ai_season_3.

-- 1) Add new columns
ALTER TABLE color_master
  ADD COLUMN IF NOT EXISTS initial_primary_season text,
  ADD COLUMN IF NOT EXISTS initial_season_1 text,
  ADD COLUMN IF NOT EXISTS initial_season_2 text,
  ADD COLUMN IF NOT EXISTS ai_primary_season text,
  ADD COLUMN IF NOT EXISTS ai_season_2 text,
  ADD COLUMN IF NOT EXISTS ai_season_3 text;

-- 2) Migrate existing data: current primary_season/season_2/season_3 are algorithm result (only if columns exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'color_master' AND column_name = 'primary_season'
  ) THEN
    UPDATE color_master
    SET
      initial_primary_season = COALESCE(initial_primary_season, primary_season),
      initial_season_1 = COALESCE(initial_season_1, season_2),
      initial_season_2 = COALESCE(initial_season_2, season_3)
    WHERE primary_season IS NOT NULL;
  END IF;
END $$;

-- 3) Drop old columns (if they exist)
ALTER TABLE color_master DROP COLUMN IF EXISTS primary_season;
ALTER TABLE color_master DROP COLUMN IF EXISTS season_2;
ALTER TABLE color_master DROP COLUMN IF EXISTS season_3;

-- 4) Comments
COMMENT ON COLUMN color_master.initial_primary_season IS 'Algorithm (system) primary season e.g. summer-soft';
COMMENT ON COLUMN color_master.initial_season_1 IS 'Algorithm close match 2nd';
COMMENT ON COLUMN color_master.initial_season_2 IS 'Algorithm close match 3rd';
COMMENT ON COLUMN color_master.ai_primary_season IS 'AI re-analysis primary season (from analyze-wrong)';
COMMENT ON COLUMN color_master.ai_season_2 IS 'AI similar season 2';
COMMENT ON COLUMN color_master.ai_season_3 IS 'AI similar season 3';

-- 5) Update trigger function to use initial_* and ai_* (sync from cache fills initial_* only)
CREATE OR REPLACE FUNCTION sync_color_master_from_cache()
RETURNS TRIGGER AS $$
DECLARE
  r jsonb;
  init_primary text;
  init_1 text;
  init_2 text;
BEGIN
  r := COALESCE(NEW.result, '{}'::jsonb);
  IF r->'color'->>'hex' IS NULL THEN
    RETURN NEW;
  END IF;

  init_primary := COALESCE(
    r->'metrics'->'seasonMatch'->>'primarySeason',
    r->'metrics'->'seasonMatch'->'breakdown'->0->>'season',
    r->'metrics'->>'season12',
    'summer-true'
  );
  init_1 := r->'metrics'->'seasonMatch'->'breakdown'->1->>'season';
  init_2 := r->'metrics'->'seasonMatch'->'breakdown'->2->>'season';

  INSERT INTO color_master (
    color_hex,
    rgb_r, rgb_g, rgb_b,
    hsl_h, hsl_s, hsl_l,
    lab_l, lab_a, lab_b,
    lch_l, lch_c, lch_h,
    initial_primary_season, initial_season_1, initial_season_2,
    ai_primary_season, ai_season_2, ai_season_3,
    confidence, confidence_note, lightness, saturation, temperature,
    human_season, human_season_2, human_season_3, human_season_updated_at, human_note,
    created_at, updated_at
  ) VALUES (
    NEW.color_hex,
    COALESCE((r->'color'->'rgb'->>'r')::int, 0),
    COALESCE((r->'color'->'rgb'->>'g')::int, 0),
    COALESCE((r->'color'->'rgb'->>'b')::int, 0),
    COALESCE((r->'color'->'hsl'->>'h')::int, 0),
    COALESCE((r->'color'->'hsl'->>'s')::int, 0),
    COALESCE((r->'color'->'hsl'->>'l')::int, 0),
    COALESCE((r->'color'->'lab'->>'l')::numeric, 0),
    COALESCE((r->'color'->'lab'->>'a')::numeric, 0),
    COALESCE((r->'color'->'lab'->>'b')::numeric, 0),
    COALESCE((r->'color'->'lch'->>'L')::numeric, (r->'color'->'lab'->>'l')::numeric),
    COALESCE((r->'color'->'lch'->>'C')::numeric, 0),
    COALESCE((r->'color'->'lch'->>'h')::numeric, 0),
    init_primary,
    init_1,
    init_2,
    (SELECT ai_primary_season FROM color_master m WHERE m.color_hex = NEW.color_hex),
    (SELECT ai_season_2 FROM color_master m WHERE m.color_hex = NEW.color_hex),
    (SELECT ai_season_3 FROM color_master m WHERE m.color_hex = NEW.color_hex),
    COALESCE(r->>'confidence', 'medium'),
    r->>'confidenceNote',
    (r->'metrics'->>'lightness')::numeric,
    (r->'metrics'->>'saturation')::numeric,
    r->'metrics'->>'temperature',
    (SELECT human_season FROM color_master m WHERE m.color_hex = NEW.color_hex),
    (SELECT human_season_2 FROM color_master m WHERE m.color_hex = NEW.color_hex),
    (SELECT human_season_3 FROM color_master m WHERE m.color_hex = NEW.color_hex),
    (SELECT human_season_updated_at FROM color_master m WHERE m.color_hex = NEW.color_hex),
    (SELECT human_note FROM color_master m WHERE m.color_hex = NEW.color_hex),
    COALESCE(NEW.created_at, now()),
    now()
  )
  ON CONFLICT (color_hex) DO UPDATE SET
    rgb_r = EXCLUDED.rgb_r,
    rgb_g = EXCLUDED.rgb_g,
    rgb_b = EXCLUDED.rgb_b,
    hsl_h = EXCLUDED.hsl_h,
    hsl_s = EXCLUDED.hsl_s,
    hsl_l = EXCLUDED.hsl_l,
    lab_l = EXCLUDED.lab_l,
    lab_a = EXCLUDED.lab_a,
    lab_b = EXCLUDED.lab_b,
    lch_l = EXCLUDED.lch_l,
    lch_c = EXCLUDED.lch_c,
    lch_h = EXCLUDED.lch_h,
    initial_primary_season = EXCLUDED.initial_primary_season,
    initial_season_1 = EXCLUDED.initial_season_1,
    initial_season_2 = EXCLUDED.initial_season_2,
    confidence = EXCLUDED.confidence,
    confidence_note = EXCLUDED.confidence_note,
    lightness = EXCLUDED.lightness,
    saturation = EXCLUDED.saturation,
    temperature = EXCLUDED.temperature,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
