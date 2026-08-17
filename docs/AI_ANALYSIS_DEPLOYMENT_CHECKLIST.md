# AI 分析功能部署检查清单

## ✅ 代码准备（已完成）

- [x] Edge Function `analyze-wrong` 已创建
- [x] 使用 OpenAI API（已从 Lovable 改为 OpenAI）
- [x] 前端按钮和 UI 已实现
- [x] Dialog 显示 AI 分析结果
- [x] 错误处理已实现
- [x] 加载状态已实现

---

## 🔧 部署步骤

### 1. 设置 OpenAI API Key

**在 Supabase Dashboard 中：**

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目（ID: `ffhlprmliuocwbkeicya`）
3. 进入 **Settings** → **Edge Functions** → **Secrets**
4. 添加 Secret：
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-...`（你的 OpenAI API key）

### 2. 部署 Edge Function

#### 方法 A：通过 Supabase Dashboard（如果支持）

1. 进入 **Edge Functions** 页面
2. 点击 **"Deploy function"** 或 **"Create function"**
3. 上传 `supabase/functions/analyze-wrong/index.ts` 文件

#### 方法 B：通过 Supabase CLI（推荐）

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

# 4. 部署 analyze-wrong function
supabase functions deploy analyze-wrong
```

### 3. 验证部署

**检查 Edge Function 是否部署成功：**

1. 在 Supabase Dashboard 中
2. 进入 **Edge Functions**
3. 确认能看到 `analyze-wrong` 函数
4. 点击函数名称，查看详情和日志

---

## 🧪 测试步骤

### 1. 启动应用

```bash
npm run dev
# 或
yarn dev
```

### 2. 测试流程

1. **上传图片**并选择一个颜色
2. **查看分析结果**页面
3. **点击 "This looks wrong" 按钮**
4. **观察：**
   - 按钮显示 "Requesting AI analysis..."
   - Dialog 弹出，显示加载动画
   - 几秒后显示 AI 分析结果

### 3. 预期结果

**成功情况：**
- ✅ Dialog 显示完整的 AI 分析文本
- ✅ 分析包含修正后的分类和解释
- ✅ 有友好的提示文字

**错误情况：**
- ❌ 如果 API key 未设置：显示 "OPENAI_API_KEY is not configured"
- ❌ 如果 API key 无效：显示 "Invalid API key"
- ❌ 如果网络错误：显示相应的错误信息

---

## 🐛 故障排查

### 问题 1：按钮点击后没有反应

**检查：**
- [ ] 浏览器控制台（F12）是否有错误
- [ ] Supabase Edge Functions 是否已部署
- [ ] 网络连接是否正常

### 问题 2：显示 "OPENAI_API_KEY is not configured"

**解决：**
- [ ] 确认已在 Supabase Dashboard 中设置 Secret
- [ ] Secret 名称必须完全一致：`OPENAI_API_KEY`（区分大小写）
- [ ] 重新部署 Edge Function（如果设置 Secret 后）

### 问题 3：显示 "Invalid API key"

**解决：**
- [ ] 检查 OpenAI API key 是否正确
- [ ] 确认 API key 在 OpenAI Platform 中有效
- [ ] 确认 API key 有余额

### 问题 4：Edge Function 部署失败

**检查：**
- [ ] Supabase CLI 是否已登录
- [ ] 项目 ID 是否正确
- [ ] 文件路径是否正确

### 问题 5：AI 分析结果为空

**检查：**
- [ ] Supabase Edge Functions 日志（在 Dashboard 中查看）
- [ ] OpenAI API 是否正常响应
- [ ] 网络连接是否正常

---

## 📊 监控和日志

### 查看 Edge Functions 日志

1. 在 Supabase Dashboard 中
2. 进入 **Edge Functions**
3. 点击 `analyze-wrong` 函数
4. 查看 **Logs** 标签页

### 查看浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 查看 **Console** 标签页
3. 查看错误信息和网络请求

---

## 💰 成本估算

### OpenAI API 成本（GPT-4o-mini）

- **每次分析**：~800 tokens
- **成本**：~$0.0001/次（非常便宜）
- **1000 次分析**：~$0.10

### Supabase Edge Functions

- **免费额度**：每月 500,000 次调用
- **超出后**：$0.0000002/次

**结论：对于个人项目，成本几乎可以忽略不计！**

---

## ✅ 完成检查清单

- [ ] OpenAI API Key 已设置
- [ ] Edge Function `analyze-wrong` 已部署
- [ ] 应用已启动并测试
- [ ] 按钮点击后 Dialog 正常显示
- [ ] AI 分析结果正常显示
- [ ] 错误处理正常工作
- [ ] 加载状态正常显示

---

## 🎉 完成！

如果所有步骤都完成，AI 分析功能就可以正常工作了！

**下一步：**
- 测试不同的颜色
- 观察 AI 分析的质量
- 根据反馈调整 prompt（如果需要）
