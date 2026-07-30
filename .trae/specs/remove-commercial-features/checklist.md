# 验收清单

## 依赖清理
- [x] package.json 中已删除 `stripe`、`@supabase/supabase-js`、`@supabase/ssr` 依赖
- [x] `npm install` 后无 supabase/stripe 相关包（需重新安装依赖）

## API 路由清理
- [x] `/src/app/api/stripe/` 目录已删除
- [x] `/src/app/api/credits/` 目录已删除
- [x] `/src/app/api/sponsor/` 目录已删除
- [x] `/src/app/api/game-sessions/` 目录已删除
- [x] `/src/app/api/guest/` 目录已删除
- [x] `/src/app/api/auth/` 目录已删除
- [x] `/src/app/api/demo-config/` 目录已删除

## 库文件清理
- [x] `supabase.ts`、`supabase-admin.ts`、`database.ts` 已删除
- [x] `demo-config.ts`、`demo-config-server.ts`、`demo-mode.ts`、`auth-headers.ts` 已删除
- [x] `auth-errors.ts`、`watcha-oauth.ts` 已删除
- [x] `welfare-config.ts`、`spring-campaign.ts`、`referral.ts` 已删除
- [x] `api-auth.ts`、`game-session-tracker.ts` 已删除
- [x] `useCredits.ts` 已删除

## UI 组件清理
- [x] `AuthModal`、`AccountModal`、`ResetPasswordModal`、`UserProfileModal`、`LowCreditModal`、`SharePanel` 已删除
- [x] WelcomeScreen 中不再引用任何商业组件/弹窗
- [x] WelcomeScreen 中不再有赞助商卡片、春季活动、签到、积分展示
- [x] 首页 page.tsx 中不再引用 useCredits/supabase

## 功能改造
- [x] `useCustomCharacters` 使用 localStorage 而非 Supabase，且接口不变
- [x] `/api/chat` 无鉴权、无积分检查，仅使用用户自带 Key
- [x] `/api/tts` 无鉴权检查
- [x] `/api/vote-batch` 无鉴权检查
- [x] `api-keys.ts` 仅保留用户自定义 Key 逻辑
- [x] `audio-manager.ts` 移除了 auth-headers 和 gameSessionTracker 引用
- [x] `llm.ts` 移除了 auth-headers 和 gameSessionTracker 引用
- [x] `useGameLogic.ts` 移除了 supabase auth 和 gameSessionTracker 引用
- [x] `useSpecialEvents.ts` 移除了 gameSessionTracker 引用

## 配置和文档清理
- [x] `.env.example` 移除了 Supabase/Stripe/Watcha 环境变量
- [x] `AGENTS.md` 和 `CLAUDE.md` 移除了商业环境变量说明
- [x] `LandingContent.tsx` FAQ 文案已更新
- [x] i18n 文件中商业相关文案键已清理（authModal/accountModal/userProfile/sharePanel/lowCreditModal/payAsYouGo/credits/referral 等）
- [x] 全局 CSS 中 sponsor/promo/watcha 相关样式已清理（约 400 行）

## 核心功能不受损
- [x] 游戏可以正常从 WelcomeScreen 开始（输入名字 -> 开局）
- [x] 夜晚/白天/投票/警徽等游戏阶段逻辑完整保留
- [x] 多语言切换正常
- [x] 自定义角色可创建/编辑/删除并在游戏中生效（localStorage 存储）
- [x] 观战模式、原神模式保留

## 代码质量
- [x] VS Code 诊断检查通过，无类型错误
- [x] 无遗留的对已删除模块的 import 引用（全局 Grep 确认）
- [x] i18n 文件中商业相关文案键已清理（无孤立引用）
