# Supabase 数据库规划 - 颜色存储方案

## 📊 当前配置分析

**你的 Supabase 配置：**
- 实例大小：**MICRO**
- RAM：1 GB
- CPU：2-core ARM
- 月费用：~$10

---

## 🎯 功能需求分析

### 目标功能
1. **存储所有颜色分析结果**到数据库
2. **通过查询返回结果**，避免重复计算
3. 提高响应速度

### 数据量估算

#### 方案 A：存储用户分析过的颜色（推荐）
- **数据量**：假设每天 100 个用户，每个用户分析 10 个颜色
- **月增长**：100 × 10 × 30 = 30,000 条/月
- **年增长**：~360,000 条
- **存储大小**：每条记录 ~500 bytes
  - 年存储：360,000 × 500 bytes ≈ 180 MB
- **✅ MICRO 实例完全够用**

#### 方案 B：预计算常见颜色（中等规模）
- **数据量**：存储 10,000 - 100,000 个常见颜色
- **存储大小**：100,000 × 500 bytes ≈ 50 MB
- **✅ MICRO 实例够用**

#### 方案 C：缓存所有可能的颜色（不推荐）
- **数据量**：RGB 有 256³ = 16,777,216 种颜色
- **存储大小**：16M × 500 bytes ≈ 8 GB
- **❌ MICRO 实例不够，需要升级**

---

## 💾 推荐数据库设计

### 表结构设计

```sql
-- 颜色分析结果表
CREATE TABLE color_analyses (
  id BIGSERIAL PRIMARY KEY,
  
  -- 颜色值（用于快速查询）
  hex VARCHAR(7) NOT NULL UNIQUE,  -- 例如: #FF0801
  rgb_r SMALLINT NOT NULL,
  rgb_g SMALLINT NOT NULL,
  rgb_b SMALLINT NOT NULL,
  
  -- LAB 颜色空间
  lab_l DECIMAL(5,2) NOT NULL,
  lab_a DECIMAL(5,2) NOT NULL,
  lab_b DECIMAL(5,2) NOT NULL,
  
  -- 分析结果
  family VARCHAR(20) NOT NULL,  -- spring/summer/autumn/winter
  season12 VARCHAR(30) NOT NULL, -- spring-true, autumn-deep, etc.
  confidence INTEGER NOT NULL,  -- 0-100
  
  -- 详细指标
  lightness INTEGER NOT NULL,
  saturation INTEGER NOT NULL,
  temperature VARCHAR(20) NOT NULL,
  
  -- 元数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 索引优化查询
  CONSTRAINT unique_hex UNIQUE (hex)
);

-- 创建索引以加速查询
CREATE INDEX idx_color_analyses_hex ON color_analyses(hex);
CREATE INDEX idx_color_analyses_rgb ON color_analyses(rgb_r, rgb_g, rgb_b);
CREATE INDEX idx_color_analyses_family ON color_analyses(family);
CREATE INDEX idx_color_analyses_season12 ON color_analyses(season12);
```

### 查询优化

```sql
-- 快速查询：通过 HEX 查找
SELECT * FROM color_analyses WHERE hex = '#FF0801';

-- 快速查询：通过 RGB 查找
SELECT * FROM color_analyses 
WHERE rgb_r = 255 AND rgb_g = 8 AND rgb_b = 1;

-- 范围查询：查找相似颜色（在 RGB 空间中）
SELECT * FROM color_analyses 
WHERE rgb_r BETWEEN 250 AND 255 
  AND rgb_g BETWEEN 5 AND 15 
  AND rgb_b BETWEEN 0 AND 5
LIMIT 10;
```

---

## 📈 性能评估

### MICRO 实例性能（1GB RAM, 2-core）

**对于方案 A（用户分析过的颜色）：**
- ✅ **完全够用**
- 查询速度：< 10ms（有索引）
- 支持并发：~50-100 并发查询
- 存储容量：足够存储数百万条记录

**对于方案 B（预计算常见颜色）：**
- ✅ **够用**
- 查询速度：< 5ms（有索引）
- 支持并发：~100+ 并发查询

**对于方案 C（所有颜色）：**
- ❌ **不够用**
- 需要至少 SMALL（2GB RAM）或 MEDIUM（4GB RAM）

---

## 🚀 实施建议

### 阶段 1：当前 MICRO 实例（推荐开始）

1. **实现缓存机制**
   - 用户分析颜色时，先查询数据库
   - 如果存在，直接返回结果
   - 如果不存在，计算后存入数据库

2. **数据量控制**
   - 只存储实际分析过的颜色
   - 定期清理旧数据（可选）

3. **性能优化**
   - 创建合适的索引
   - 使用连接池
   - 实现查询缓存

### 阶段 2：如果数据量增长（未来）

**升级时机：**
- 数据量 > 500,000 条
- 查询响应时间 > 100ms
- 并发用户 > 100

**升级选项：**
- **SMALL**（$15/月）：2GB RAM，适合中等规模
- **MEDIUM**（$60/月）：4GB RAM，适合大规模

---

## 💡 最佳实践

### 1. 使用 Supabase 的自动功能
- ✅ 自动备份
- ✅ 自动索引优化
- ✅ 连接池管理

### 2. 查询优化策略
```typescript
// 先查缓存
const cached = await supabase
  .from('color_analyses')
  .select('*')
  .eq('hex', hex)
  .single();

if (cached.data) {
  return cached.data; // 直接返回，不计算
}

// 如果不存在，计算并存储
const result = classifyColorLAB(lab);
await supabase.from('color_analyses').insert({
  hex,
  rgb_r: color.rgb.r,
  rgb_g: color.rgb.g,
  rgb_b: color.rgb.b,
  lab_l: color.lab.l,
  lab_a: color.lab.a,
  lab_b: color.lab.b,
  family: result.family,
  season12: result.season12,
  confidence: result.confidence.top1 * 100,
  lightness: metrics.lightness,
  saturation: metrics.saturation,
  temperature: metrics.temperature,
});
```

### 3. 数据清理策略（可选）
```sql
-- 删除 1 年以上的旧数据
DELETE FROM color_analyses 
WHERE created_at < NOW() - INTERVAL '1 year';

-- 或保留最近 100,000 条
DELETE FROM color_analyses 
WHERE id NOT IN (
  SELECT id FROM color_analyses 
  ORDER BY created_at DESC 
  LIMIT 100000
);
```

---

## 📊 成本对比

| 方案 | 月费用 | 存储容量 | 查询性能 | 推荐场景 |
|------|--------|----------|----------|----------|
| **MICRO** | $10 | ~1GB | 快（<10ms） | ✅ 当前需求 |
| **SMALL** | $15 | ~2GB | 很快（<5ms） | 中等规模 |
| **MEDIUM** | $60 | ~4GB | 极快（<2ms） | 大规模 |

---

## ✅ 结论

**对于你的需求（存储用户分析过的颜色），MICRO 实例完全够用！**

**理由：**
1. ✅ 数据量可控（几千到几十万条）
2. ✅ 查询性能优秀（有索引）
3. ✅ 成本低（$10/月）
4. ✅ 可以随时升级

**建议：**
- 先用 MICRO 实例开始
- 实现缓存机制
- 监控数据量和性能
- 如果未来需要，再升级到 SMALL

---

## 🔧 下一步行动

1. **创建数据库表**（使用上面的 SQL）
2. **实现查询逻辑**（先查数据库，再计算）
3. **添加索引**（优化查询速度）
4. **监控性能**（观察查询时间和数据量）

需要我帮你实现数据库表和查询逻辑吗？
