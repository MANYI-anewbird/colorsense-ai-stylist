# 账号注册 / 登录配置

本项目使用 Supabase Auth 的邮箱 + 密码方式进行注册和登录。

## Vercel 部署后必须配置 Supabase

**是的，Supabase 必须添加 Vercel 的域名**，否则在 Vercel 上注册/登录会失败。

## Supabase Dashboard 配置步骤

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)，选择你的项目
2. 进入 **Authentication** → **URL Configuration**

### Site URL
- **生产环境（Vercel）**：设为你的 Vercel 域名，例如 `https://your-app.vercel.app`
- 邮箱确认链接会跳转到这个地址，若设为 localhost，在手机上打开会失败

### Redirect URLs
在 **Redirect URLs** 中添加（每行一个）：
- 本地开发：`http://127.0.0.1:*/**`、`http://localhost:*/**`
- **Vercel 生产**：`https://your-app.vercel.app/**`（把 `your-app` 换成你的 Vercel 项目名）

这样邮箱确认、密码重置、OAuth 等回调才能正确跳回你的 Vercel 站点。

### 关于「Email 没有 confirm」问题
Supabase 默认要求**邮箱验证**：注册后会发一封确认邮件，**必须点击邮件中的链接**才能登录。若未点击，登录时会提示未确认。

**解决方案：**
- **方案 A**：在 **Authentication** → **Providers** → **Email** 中，关闭 **Confirm email**，注册后无需验证即可登录
- **方案 B**：保持邮箱验证。确保 **Site URL** 和 **Redirect URLs** 已正确配置为 Vercel 域名，然后重新注册或点击确认邮件完成验证

## 检查清单
- [ ] Site URL 已设为 Vercel 生产域名
- [ ] Redirect URLs 包含 `https://你的vercel域名/**`
- [ ] Vercel 环境变量已设置 `VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY`
