-- Backfill color_master from color_analysis_cache (parse result jsonb).
-- Also add trigger so future inserts/updates to color_analysis_cache auto-sync to color_master.

-- 1) Backfill: parse result jsonb and insert into color_master (skip if row exists to keep human edits)
INSERT INTO color_master (
  color_hex,
  rgb_r, rgb_g, rgb_b,
  hsl_h, hsl_s, hsl_l,
  lab_l, lab_a, lab_b,
  lch_l, lch_c, lch_h,
  primary_season, season_2, season_3,
  confidence, confidence_note, lightness, saturation, temperature,
  human_season, human_season_2, human_season_3, human_season_updated_at, human_note,
  created_at, updated_at
)
SELECT
  c.color_hex,
  COALESCE((c.result->'color'->'rgb'->>'r')::int, 0),
  COALESCE((c.result->'color'->'rgb'->>'g')::int, 0),
  COALESCE((c.result->'color'->'rgb'->>'b')::int, 0),
  COALESCE((c.result->'color'->'hsl'->>'h')::int, 0),
  COALESCE((c.result->'color'->'hsl'->>'s')::int, 0),
  COALESCE((c.result->'color'->'hsl'->>'l')::int, 0),
  COALESCE((c.result->'color'->'lab'->>'l')::numeric, 0),
  COALESCE((c.result->'color'->'lab'->>'a')::numeric, 0),
  COALESCE((c.result->'color'->'lab'->>'b')::numeric, 0),
  COALESCE((c.result->'color'->'lch'->>'L')::numeric, (c.result->'color'->'lab'->>'l')::numeric),
  COALESCE((c.result->'color'->'lch'->>'C')::numeric, 0),
  COALESCE((c.result->'color'->'lch'->>'h')::numeric, 0),
  COALESCE(c.result->'metrics'->>'season12', 'summer-true'),
  (c.result->'metrics'->'seasonMatch'->'breakdown'->1->>'season'),
  (c.result->'metrics'->'seasonMatch'->'breakdown'->2->>'season'),
  COALESCE(c.result->>'confidence', 'medium'),
  c.result->>'confidenceNote',
  (c.result->'metrics'->>'lightness')::numeric,
  (c.result->'metrics'->>'saturation')::numeric,
  c.result->'metrics'->>'temperature',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  COALESCE(c.created_at, now()),
  now()
FROM color_analysis_cache c
WHERE c.result IS NOT NULL
  AND c.result->'color'->>'hex' IS NOT NULL
ON CONFLICT (color_hex) DO NOTHING;

-- 2) Function: on color_analysis_cache INSERT/UPDATE, upsert one row into color_master from result jsonb
CREATE OR REPLACE FUNCTION sync_color_master_from_cache()
RETURNS TRIGGER AS $$
DECLARE
  r jsonb;
BEGIN
  r := COALESCE(NEW.result, '{}'::jsonb);
  IF r->'color'->>'hex' IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO color_master (
    color_hex,
    rgb_r, rgb_g, rgb_b,
    hsl_h, hsl_s, hsl_l,
    lab_l, lab_a, lab_b,
    lch_l, lch_c, lch_h,
    primary_season, season_2, season_3,
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
    COALESCE(r->'metrics'->>'season12', 'summer-true'),
    (r->'metrics'->'seasonMatch'->'breakdown'->1->>'season'),
    (r->'metrics'->'seasonMatch'->'breakdown'->2->>'season'),
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
    primary_season = EXCLUDED.primary_season,
    season_2 = EXCLUDED.season_2,
    season_3 = EXCLUDED.season_3,
    confidence = EXCLUDED.confidence,
    confidence_note = EXCLUDED.confidence_note,
    lightness = EXCLUDED.lightness,
    saturation = EXCLUDED.saturation,
    temperature = EXCLUDED.temperature,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3) Trigger: after insert or update on color_analysis_cache, sync to color_master
DROP TRIGGER IF EXISTS sync_color_master_on_cache_change ON color_analysis_cache;
CREATE TRIGGER sync_color_master_on_cache_change
  AFTER INSERT OR UPDATE OF result ON color_analysis_cache
  FOR EACH ROW EXECUTE PROCEDURE sync_color_master_from_cache();
