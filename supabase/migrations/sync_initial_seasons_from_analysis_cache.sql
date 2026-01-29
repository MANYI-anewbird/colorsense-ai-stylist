-- Run in Supabase Dashboard → SQL Editor
-- 让 color_analysis_cache 的分析结果自动填入 color_master 的 initial_primary_season, initial_season_1, initial_season_2
-- 前提：已存在 color_master 表。若表中仍有 primary_season（NOT NULL），请先执行 20260129200000_initial_and_ai_season_columns.sql 再执行本脚本。

-- 1) 确保 color_master 有 initial_* 列（若没有请先执行 20260129200000 或本脚本前的迁移）
ALTER TABLE color_master
  ADD COLUMN IF NOT EXISTS initial_primary_season text,
  ADD COLUMN IF NOT EXISTS initial_season_1 text,
  ADD COLUMN IF NOT EXISTS initial_season_2 text;

-- 2) 同步函数：color_analysis_cache 插入/更新时，把 result 里的 season 写入 color_master
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

-- 3) 绑定到 color_analysis_cache：插入或更新 result 时自动同步到 color_master
DROP TRIGGER IF EXISTS sync_color_master_on_cache_change ON color_analysis_cache;
CREATE TRIGGER sync_color_master_on_cache_change
  AFTER INSERT OR UPDATE OF result ON color_analysis_cache
  FOR EACH ROW EXECUTE PROCEDURE sync_color_master_from_cache();

-- 4) 一次性回填：把已有 color_analysis_cache 里的 season 填入 color_master 的 initial_*
UPDATE color_master m
SET
  initial_primary_season = COALESCE(
    c.result->'metrics'->'seasonMatch'->>'primarySeason',
    c.result->'metrics'->'seasonMatch'->'breakdown'->0->>'season',
    c.result->'metrics'->>'season12'
  ),
  initial_season_1 = c.result->'metrics'->'seasonMatch'->'breakdown'->1->>'season',
  initial_season_2 = c.result->'metrics'->'seasonMatch'->'breakdown'->2->>'season',
  updated_at = now()
FROM color_analysis_cache c
WHERE m.color_hex = c.color_hex
  AND c.result IS NOT NULL
  AND c.result->'metrics'->'seasonMatch' IS NOT NULL;
