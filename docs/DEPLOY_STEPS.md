# 部署 Edge Function - 手动步骤

## 📋 前置条件

1. ✅ OpenAI API Key 已设置在 Supabase Dashboard
2. ⏳ 需要安装 Supabase CLI

---

## 🔧 步骤 1：安装 Supabase CLI

**方法 A：使用 Homebrew（推荐）**
```bash
brew install supabase/tap/supabase
```

**方法 B：使用 npm**
```bash
npm install -g supabase
```

**方法 C：使用 curl（macOS/Linux）**
```bash
curl -fsSL https://supabase.com/install.sh | sh
```

---

## 🔐 步骤 2：登录 Supabase

```bash
supabase login
```

这会打开浏览器让你登录 Supabase 账户。

---

## 🔗 步骤 3：链接项目

```bash
cd /Users/hongmanyi/colorsense-ai-stylist
supabase link --project-ref qvnkuqvdfolktpnhhbxc
```

---

## 🚀 步骤 4：部署 Edge Function

```bash
supabase functions deploy analyze-wrong
```

---

## ✅ 验证部署

部署成功后，你应该看到类似这样的输出：
```
Deploying function analyze-wrong...
Function analyze-wrong deployed successfully
```

然后在 Supabase Dashboard 的 **Edge Functions** 页面应该能看到 `analyze-wrong` 函数。

---

## 🧪 测试

1. 启动应用：`npm run dev`
2. 上传图片并选择颜色
3. 点击 "This looks wrong" 按钮
4. 查看 AI 分析结果

---

## 🆘 如果遇到问题

### 问题：`supabase: command not found`
- 确认 CLI 已安装
- 检查 PATH 环境变量
- 尝试重启终端

### 问题：登录失败
- 确认网络连接正常
- 尝试在浏览器中手动登录 Supabase

### 问题：链接项目失败
- 确认项目 ID 正确：`qvnkuqvdfolktpnhhbxc`
- 确认你有项目访问权限

### 问题：部署失败
- 检查 `supabase/functions/analyze-wrong/index.ts` 文件是否存在
- 查看错误信息，通常是语法错误或依赖问题

---

## 📝 快速命令总结

```bash
# 1. 安装 CLI
brew install supabase/tap/supabase

# 2. 登录
supabase login

# 3. 链接项目
cd /Users/hongmanyi/colorsense-ai-stylist
supabase link --project-ref qvnkuqvdfolktpnhhbxc

# 4. 部署
supabase functions deploy analyze-wrong
```

完成这些步骤后，AI 分析功能就可以使用了！🎉
