# Agent System – Supabase 逻辑说明

## 概述

颜色分析改为 **Agent System**：工程算法 + 第一次 AI 分析 + 裁决 AI → 有且仅有一个最终结论。

## 表结构（简化后仅保留 `color_ai_cache`）

**已废弃并删除**：`color_analysis_cache`、`color_master`（见迁移 `20260209010000_cleanup_old_agent_tables.sql`）

## `color_ai_cache`

| 列 | 说明 |
|---|---|
| `color_hex` | 主键，颜色十六进制（如 #FF5733） |
| `first_ai_result` | 第一次 AI 分析结果（不含工程结论），按 color_hex 缓存，仅首次分析时调用 API |
| `agent_final_result` | 裁决 AI 的最终结论：`{ primarySeason, secondarySeason?, confidencePct, temperature }` |
| `engineering_result` | 工程/算法结果：`{ season12, temperature }`（用于展示） |
| `ai_result` | 保留兼容，现与 agent_final_result 同步 |
| `report_to_human_count` | 用户点击「This looks wrong」并上报的次数 |
| `total_queries_count` | 该颜色被分析的总次数 |
| `ai_api_calls_count` | AI API 调用次数 |

## 流程

1. **用户点击 Analyze Color** → 前端运行工程算法 → 进入 ResultPage
2. **ResultPage 加载** → 调用 `color-agent` Edge Function
3. **color-agent 逻辑**：
   - 按 `color_hex` 查 `color_ai_cache`
   - 若已有 `agent_final_result` → 直接返回
   - 若无 `first_ai_result`：
     - 调用第一次 AI（仅颜色/图像，**不传入工程结论**）
     - 写入 `first_ai_result`
   - 调用裁决 AI：输入 = 工程结论 + 第一次 AI 结论 + 颜色
   - 裁决 AI 输出单一结论 + 置信度 + 可选第二备选（边界情况）
   - 按最终结论修正 temperature：夏/冬 = cool，春/秋 = warm
   - 写入 `agent_final_result`，返回结果
4. **用户点击「This looks wrong」** → 调用 `report-to-human` → `report_to_human_count` +1

## 部署

```bash
# 1. 执行迁移
supabase db push
# 或在 Supabase Dashboard SQL Editor 中执行 20260209000000_agent_system_schema.sql

# 2. 部署 Edge Function
supabase functions deploy color-agent
```

## 环境变量

`color-agent` 需要 `OPENAI_API_KEY`（Supabase Secrets）。
