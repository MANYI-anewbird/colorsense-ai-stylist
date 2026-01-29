-- Fill color_master.ai_primary_season, ai_season_2, ai_season_3 from color_ai_cache.ai_result.
-- One-time backfill + trigger so future AI cache writes also update color_master.

-- 1) One-time backfill: update color_master from color_ai_cache where color_hex matches
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

-- 2) Trigger: when color_ai_cache is inserted/updated, sync ai_* to color_master
CREATE OR REPLACE FUNCTION sync_color_master_ai_from_cache()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ai_result IS NOT NULL AND NEW.ai_result->>'primarySeason' IS NOT NULL THEN
    UPDATE color_master
    SET
      ai_primary_season = NEW.ai_result->>'primarySeason',
      ai_season_2 = NEW.ai_result->'similarSeasons'->>0,
      ai_season_3 = NEW.ai_result->'similarSeasons'->>1,
      updated_at = now()
    WHERE color_hex = NEW.color_hex;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_color_master_ai_on_ai_cache_change ON color_ai_cache;
CREATE TRIGGER sync_color_master_ai_on_ai_cache_change
  AFTER INSERT OR UPDATE OF ai_result ON color_ai_cache
  FOR EACH ROW EXECUTE PROCEDURE sync_color_master_ai_from_cache();
