-- Run once in Supabase Dashboard → SQL Editor
-- 用 color_ai_cache 的数据填充 color_master 的 ai_primary_season / ai_season_2 / ai_season_3
-- 并创建触发器，使之后 color_ai_cache 的写入/更新自动同步到 color_master

-- ========== 1) 触发器：之后 color_ai_cache 插入或更新 ai_result 时自动同步到 color_master ==========
CREATE OR REPLACE FUNCTION sync_color_master_ai_from_cache()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ai_result IS NOT NULL AND NEW.ai_result->>'primarySeason' IS NOT NULL THEN
    INSERT INTO color_master (
      color_hex,
      rgb_r, rgb_g, rgb_b, hsl_h, hsl_s, hsl_l,
      lab_l, lab_a, lab_b, lch_l, lch_c, lch_h,
      initial_primary_season, initial_season_1, initial_season_2,
      ai_primary_season, ai_season_2, ai_season_3,
      confidence, created_at, updated_at
    ) VALUES (
      NEW.color_hex,
      0, 0, 0, 0, 0, 0,
      0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric,
      NULL, NULL, NULL,
      NEW.ai_result->>'primarySeason',
      NEW.ai_result->'similarSeasons'->>0,
      NEW.ai_result->'similarSeasons'->>1,
      'medium', COALESCE(NEW.created_at, now()), now()
    )
    ON CONFLICT (color_hex) DO UPDATE SET
      ai_primary_season = EXCLUDED.ai_primary_season,
      ai_season_2 = EXCLUDED.ai_season_2,
      ai_season_3 = EXCLUDED.ai_season_3,
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_color_master_ai_on_ai_cache_change ON color_ai_cache;
CREATE TRIGGER sync_color_master_ai_on_ai_cache_change
  AFTER INSERT OR UPDATE OF ai_result ON color_ai_cache
  FOR EACH ROW EXECUTE PROCEDURE sync_color_master_ai_from_cache();

-- ========== 2) 一次性回填：已有 color_master 行，用 color_ai_cache 更新 AI 三列 ==========
UPDATE color_master m
SET
  ai_primary_season = c.ai_result->>'primarySeason',
  ai_season_2 = c.ai_result->'similarSeasons'->>0,
  ai_season_3 = c.ai_result->'similarSeasons'->>1,
  updated_at = now()
FROM color_ai_cache c
WHERE m.color_hex = c.color_hex
  AND c.ai_result IS NOT NULL
  AND c.ai_result->>'primarySeason' IS NOT NULL;

-- ========== 3) color_ai_cache 里有、color_master 里没有的 color_hex：插入新行并填 AI 三列 ==========
INSERT INTO color_master (
  color_hex,
  rgb_r, rgb_g, rgb_b,
  hsl_h, hsl_s, hsl_l,
  lab_l, lab_a, lab_b,
  lch_l, lch_c, lch_h,
  initial_primary_season, initial_season_1, initial_season_2,
  ai_primary_season, ai_season_2, ai_season_3,
  confidence,
  created_at, updated_at
)
SELECT
  c.color_hex,
  0, 0, 0,
  0, 0, 0,
  0::numeric, 0::numeric, 0::numeric,
  0::numeric, 0::numeric, 0::numeric,
  NULL, NULL, NULL,
  c.ai_result->>'primarySeason',
  c.ai_result->'similarSeasons'->>0,
  c.ai_result->'similarSeasons'->>1,
  'medium',
  COALESCE(c.created_at, now()),
  now()
FROM color_ai_cache c
WHERE NOT EXISTS (SELECT 1 FROM color_master m WHERE m.color_hex = c.color_hex)
  AND c.ai_result IS NOT NULL
  AND c.ai_result->>'primarySeason' IS NOT NULL
ON CONFLICT (color_hex) DO UPDATE SET
  ai_primary_season = EXCLUDED.ai_primary_season,
  ai_season_2 = EXCLUDED.ai_season_2,
  ai_season_3 = EXCLUDED.ai_season_3,
  updated_at = now();
