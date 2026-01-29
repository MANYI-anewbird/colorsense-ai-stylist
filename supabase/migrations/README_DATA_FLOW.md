# 颜色分析数据流说明

## 表关系与触发逻辑

1. **用户点击「Analyze Color」（初次分析）**
   - **新颜色**（表中没有）：本地跑算法分析 → 写入 **color_analysis_cache**（一条新记录）→ 触发器把算法结果同步到 **color_master**（initial_primary_season, initial_season_1, initial_season_2 等）。
   - **已有颜色**（表中已有）：直接从 **color_analysis_cache** 读结果展示，**不写表**，不触发 color_master 更新。

2. **用户点击「This looks wrong」（AI 再分析）**
   - **该颜色在 color_ai_cache 中还没有 AI 结果**：调用 AI → 写入/更新 **color_ai_cache**（ai_result 等）→ 触发器把 AI 结果同步到 **color_master**（ai_primary_season, ai_season_2, ai_season_3）。
   - **该颜色已有 AI 结果**：直接从 **color_ai_cache** 返回缓存，只更新计数（如 total_queries_count），**不覆盖 ai_result**，因此不会触发「ai_result 变更」的触发器，color_master 的 ai_* 列不变。

3. **color_master**
   - 只要 **color_analysis_cache** 或 **color_ai_cache** 有**有意义的更新**（新算法结果 / 新 AI 结果），对应触发器就会把最新数据同步到 **color_master** 的对应列。
   - 若某颜色之前已有客户查过、对应表里已有记录，则不会对缓存表做内容更新（算法/AI 结果不覆盖），因此 color_master 也不会被重复写入。

## 触发器一览

| 源表 | 触发器 | 同步到 color_master 的列 |
|------|--------|--------------------------|
| color_analysis_cache | sync_color_master_on_cache_change（INSERT 或 UPDATE result） | initial_primary_season, initial_season_1, initial_season_2 及 color/rgb/hsl/lab/lch、confidence、lightness、saturation、temperature 等 |
| color_ai_cache | sync_color_master_ai_on_ai_cache_change（INSERT 或 UPDATE **ai_result**） | ai_primary_season, ai_season_2, ai_season_3 |

注意：color_ai_cache 仅当 **ai_result** 被插入或更新时才会触发；只更新 total_queries_count 等计数不会触发。
