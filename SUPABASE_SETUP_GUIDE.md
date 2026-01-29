# Supabase 设置教程

本教程将指导你如何在 Supabase 中设置 OpenAI API Key，让你的 AI 功能正常工作。

## 📋 目录

1. [注册/登录 Supabase](#1-注册登录-supabase)
2. [找到你的项目](#2-找到你的项目)
3. [设置 OpenAI API Key](#3-设置-openai-api-key)
4. [部署 Edge Functions（如果需要）](#4-部署-edge-functions如果需要)
5. [验证设置](#5-验证设置)

---

## 1. 注册/登录 Supabase

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 如果你还没有账户：
   - 点击 "Sign Up" 注册
   - 可以使用 GitHub、Google 或邮箱注册
3. 如果已有账户，直接登录

---

## 2. 找到你的项目

登录后，你应该能看到你的项目列表。找到项目 ID 为 `ffhlprmliuocwbkeicya` 的项目。

**如果看不到项目：**
- 检查是否登录了正确的账户
- 或者创建一个新项目（但需要更新项目 ID）

---

## 3. 设置 OpenAI API Key

### 步骤 3.1：获取 OpenAI API Key

1. 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 登录或注册 OpenAI 账户
3. 点击 **"Create new secret key"**
4. 给 key 起个名字（例如：`colorsense-ai-stylist`）
5. **重要：复制 API key**（格式：`sk-...`）
   - ⚠️ 这个 key 只会显示一次，请妥善保存！

### 步骤 3.2：在 Supabase 中设置 Secret

1. 在 Supabase Dashboard 中，点击你的项目
2. 在左侧菜单中，点击 **Settings**（设置）
3. 在 Settings 菜单中，点击 **Edge Functions**（边缘函数）
4. 找到 **Secrets** 部分
5. 点击 **"Add new secret"** 或 **"New secret"**
6. 填写：
   - **Name**: `OPENAI_API_KEY`（必须完全一致，区分大小写）
   - **Value**: 粘贴你的 OpenAI API key（`sk-...`）
7. 点击 **"Save"** 或 **"Add secret"**

✅ **完成！** API Key 已设置完成。

---

## 4. 部署 Edge Functions（如果需要）

如果你的 Edge Functions 还没有部署，需要先部署：

### 方法 A：通过 Supabase Dashboard（推荐）

1. 在 Supabase Dashboard 中，点击左侧菜单的 **Edge Functions**
2. 你应该能看到两个函数：
   - `analyze-color`
   - `analyze-wrong`
3. 如果函数不存在或需要更新：
   - 点击 **"Deploy"** 或 **"Create function"**
   - 或者使用 CLI 部署（见方法 B）

### 方法 B：通过 Supabase CLI

如果你安装了 Supabase CLI：

```bash
# 1. 安装 Supabase CLI（如果还没安装）
# macOS:
brew install supabase/tap/supabase

# 或使用 npm:
npm install -g supabase

# 2. 登录 Supabase
supabase login

# 3. 链接到你的项目
cd /Users/hongmanyi/colorsense-ai-stylist
supabase link --project-ref ffhlprmliuocwbkeicya

# 4. 部署 Edge Functions
supabase functions deploy analyze-color
supabase functions deploy analyze-wrong
```

---

## 5. 验证设置

### 验证 API Key 是否设置成功

1. 在 Supabase Dashboard 中
2. 进入 **Settings** → **Edge Functions** → **Secrets**
3. 确认能看到 `OPENAI_API_KEY` 这一行
4. 值应该显示为 `sk-...`（部分隐藏）

### 测试功能

1. 启动你的应用：
   ```bash
   npm run dev
   # 或
   yarn dev
   ```

2. 上传一张图片并选择一个颜色进行分析

3. 在结果页面，点击 **"This looks wrong"** 按钮

4. 如果一切正常：
   - 按钮会显示 "Requesting AI analysis..."
   - 几秒后会显示 AI 分析结果（通过 toast 通知）

5. 如果出现错误：
   - 检查浏览器控制台（F12）的错误信息
   - 检查 Supabase Dashboard 中的 Edge Functions 日志
   - 确认 API Key 是否正确设置

---

## 🔧 常见问题

### Q1: 找不到 Secrets 选项？

**A:** 确保你：
- 在正确的项目中
- 点击的是 **Settings** → **Edge Functions**（不是其他 Settings）
- 你的账户有项目管理权限

### Q2: API Key 设置后还是不工作？

**A:** 检查：
1. Secret 名称是否完全一致：`OPENAI_API_KEY`（区分大小写）
2. API Key 是否有效（可以在 OpenAI Platform 测试）
3. Edge Functions 是否已部署
4. 查看 Edge Functions 的日志（在 Dashboard 中）

### Q3: 如何查看 Edge Functions 日志？

**A:** 
1. 在 Supabase Dashboard 中
2. 点击 **Edge Functions**
3. 点击函数名称（如 `analyze-wrong`）
4. 查看 **Logs** 标签页

### Q4: 如何更新 API Key？

**A:**
1. 在 Secrets 页面
2. 找到 `OPENAI_API_KEY`
3. 点击编辑或删除后重新添加
4. 输入新的 API Key
5. 保存

### Q5: API Key 会暴露吗？

**A:** 不会！API Key 存储在 Supabase 的服务器端，不会暴露在前端代码中。这是使用 Supabase Edge Functions 的主要优势。

---

## 📝 快速检查清单

- [ ] 已登录 Supabase Dashboard
- [ ] 找到了项目（ID: `ffhlprmliuocwbkeicya`）
- [ ] 已获取 OpenAI API Key
- [ ] 已在 Supabase 中设置 `OPENAI_API_KEY` secret
- [ ] Edge Functions 已部署（`analyze-color` 和 `analyze-wrong`）
- [ ] 已测试功能是否正常工作

---

## 🆘 需要帮助？

如果遇到问题：
1. 检查 Supabase Dashboard 中的 Edge Functions 日志
2. 检查浏览器控制台的错误信息
3. 确认 API Key 在 OpenAI Platform 中有效且有余额

---

## 📚 相关链接

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Edge Functions 文档](https://supabase.com/docs/guides/functions)
- [OpenAI Platform](https://platform.openai.com/)
- [OpenAI API 文档](https://platform.openai.com/docs/api-reference)
