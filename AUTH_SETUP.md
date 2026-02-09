# 账号注册 / 登录配置

本项目使用 Supabase Auth 的邮箱 + 密码方式进行注册和登录。

## Supabase Dashboard 配置

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)，选择你的项目
2. 进入 **Authentication** → **Providers**
3. 确保 **Email** 提供商已启用（默认开启）
4. 在 **Auth URL Configuration** 中设置 **Site URL**：
   - 本地开发：`http://127.0.0.1:8080`（本项目 Vite 配置）
   - 生产环境：你的部署域名（如 `https://your-app.vercel.app`）
5. 在 **Redirect URLs** 中添加密码重置回调地址（用于忘记密码功能）。Supabase 支持通配符，一次配置即可兼容任意端口：
   - 本地开发（任意端口）：`http://127.0.0.1:*/reset-password` 或 `http://localhost:*/reset-password`
   - 生产环境：`https://your-app.vercel.app/reset-password`（替换为你的域名）
6. （可选）若希望用户注册后无需邮箱验证即可登录，可在 **Email Auth** 中关闭 **Confirm email**

配置完成后，用户即可在应用内点击「登录」按钮，通过「注册」填写邮箱和密码创建账号，或通过「登录」/「忘记密码」使用已有账号登录或重置密码。
