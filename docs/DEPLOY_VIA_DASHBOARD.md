# 通过 Supabase Dashboard 部署 Edge Function

## 📋 步骤说明

### 步骤 1：登录 Supabase Dashboard
1. 访问 https://supabase.com/dashboard
2. 登录你的账户
3. 选择项目（ID: `qvnkuqvdfolktpnhhbxc`）

### 步骤 2：进入 Edge Functions
1. 在左侧菜单中，点击 **"Edge Functions"**
2. 你应该能看到 Edge Functions 页面

### 步骤 3：创建新函数
1. 点击 **"Create function"** 或 **"New function"** 按钮
2. 输入函数名称：`analyze-wrong`
3. 选择运行时：**Deno**

### 步骤 4：复制代码
1. 打开项目中的文件：`supabase/functions/analyze-wrong/index.ts`
2. **全选并复制**所有代码内容
3. 粘贴到 Supabase Dashboard 的代码编辑器中

### 步骤 5：部署
1. 点击 **"Deploy"** 或 **"Save"** 按钮
2. 等待部署完成（通常几秒钟）

### 步骤 6：验证
1. 在 Edge Functions 列表中，确认能看到 `analyze-wrong` 函数
2. 状态应该显示为 "Active" 或 "Deployed"

---

## ✅ 完成！

部署完成后，你就可以测试 AI 分析功能了：
1. 启动应用：`npm run dev`
2. 上传图片并选择颜色
3. 点击 "This looks wrong" 按钮
4. 应该能看到 AI 分析结果

---

## 🆘 如果遇到问题

### 问题：找不到 "Create function" 按钮
- 确认你在正确的项目中
- 检查账户权限（需要项目管理员权限）

### 问题：部署失败
- 检查代码是否有语法错误
- 确认代码完整复制（没有遗漏）

### 问题：函数部署后不工作
- 检查 Supabase Dashboard 中的函数日志
- 确认 `OPENAI_API_KEY` Secret 已设置
