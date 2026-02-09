-- Cleanup: Remove old logic no longer used by Agent System
-- New flow: color-agent reads/writes only color_ai_cache (first_ai_result, agent_final_result)
-- Frontend does NOT use: color_analysis_cache, color_master, or their sync triggers
--
-- ⚠️ WARNING: Dropping color_master will permanently delete all rows. Export data first if needed.

-- 1) Drop sync triggers (they sync to color_master which we no longer use)
DROP TRIGGER IF EXISTS sync_color_master_on_cache_change ON color_analysis_cache;
DROP TRIGGER IF EXISTS sync_color_master_ai_on_ai_cache_change ON color_ai_cache;

-- 2) Drop unused tables
-- color_analysis_cache: Old flow cached algorithmic analysis here; new flow runs engineering client-side
DROP TABLE IF EXISTS color_analysis_cache CASCADE;

-- color_master: Old flow synced from caches for human override; new flow uses only color_ai_cache
DROP TABLE IF EXISTS color_master CASCADE;
