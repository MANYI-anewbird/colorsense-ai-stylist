# 部署 Edge Function 步骤

## ✅ 已完成
- [x] OpenAI API Key 已设置在 Supabase Dashboard Secrets 中

## 🚀 下一步：部署 Edge Function

### 方法 1：通过 Supabase Dashboard（如果支持）

1. 在 Supabase Dashboard 中
2. 进入 **Edge Functions** 页面
3. 点击 **"Deploy function"** 或 **"Create function"**
4. 上传 `supabase/functions/analyze-wrong/index.ts` 文件

### 方法 2：通过 Supabase CLI（推荐）

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
supabase link --project-ref qvnkuqvdfolktpnhhbxc

# 4. 部署 analyze-wrong function
supabase functions deploy analyze-wrong
```

### 验证部署

部署成功后，你应该能在 Supabase Dashboard 的 **Edge Functions** 页面看到 `analyze-wrong` 函数。

---

## 🧪 测试步骤

1. **启动应用**
   ```bash
   npm run dev
   ```

2. **测试流程**
   - 上传图片并选择一个颜色
   - 查看分析结果页面
   - 点击 **"This looks wrong"** 按钮
   - 应该看到 Dialog 弹出，显示 AI 分析结果

3. **预期结果**
   - ✅ Dialog 显示加载动画
   - ✅ 几秒后显示 AI 分析文本
   - ✅ 分析包含修正建议和解释

---

## 🐛 如果遇到问题

### 问题：函数部署失败
- 检查 Supabase CLI 是否已登录
- 确认项目 ID 正确：`qvnkuqvdfolktpnhhbxc`

### 问题：点击按钮后没有反应
- 检查浏览器控制台（F12）的错误信息
- 确认 Edge Function 已部署

### 问题：显示 API Key 错误
- 确认 Secret 名称完全一致：`OPENAI_API_KEY`
- 确认 API Key 在 OpenAI Platform 中有效

---

## 📝 检查清单

- [x] OpenAI API Key 已设置
- [ ] Edge Function `analyze-wrong` 已部署
- [ ] 应用已启动
- [ ] 功能测试通过

完成部署后就可以测试 AI 分析功能了！🎉
