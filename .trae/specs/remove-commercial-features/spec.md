# 剔除商业功能 Spec

## Why

去除 Wolfcha 项目中所有商业化/变现功能，将其简化为纯开源、免费、无账号的本地化 AI 狼人杀游戏。改造后无需任何后端服务（Supabase、Stripe），用户只需自备 LLM API Key 即可游玩。

## What Changes

### 删除的模块（完整移除）

- **Stripe 支付系统**：删除 `/api/stripe/` 下所有路由、删除 `stripe` npm 依赖
- **积分系统**：删除 `useCredits hook`、`/api/credits/` 下所有路由（consume/daily-bonus/referral/redeem/spring-login-bonus）
- **游戏会话系统**：删除 `game-sessions` API、`game-session-tracker`、`api-auth` 中的会话鉴权
- **邀请/推广系统**：删除 `referral.ts`、`SharePanel`、邀请码展示
- **限时活动**：删除 `spring-campaign.ts`、新春弹窗及相关 API
- **赞助商**：删除 `SponsorCard` 组件、赞助商卡片、`/api/sponsor/click` 路由
- **每日签到**：删除 `daily-bonus` API
- **兑换码**：删除 `redeem` API
- **免费赠送次数**：删除 `FREE_ROUNDS_PROMO_ENABLED` 相关横幅
- **Demo 模式**：删除 `demo-config.ts`、`demo-config-server.ts`、`demo-mode.ts`、`/api/guest/migrate` 路由
- **福利活动配置**：删除 `welfare-config.ts`
- **Supabase 全链路**：删除 `supabase.ts`、`supabase-admin.ts`、`database.ts`、所有数据库类型定义
- **用户认证系统**：删除 `AuthModal`、`AccountModal`、`ResetPasswordModal`、`UserProfileModal`、`auth-headers.ts`、`/api/auth/` 路由
- **API 鉴权**：删除 `api-auth.ts`（authenticateRequest / requireCredits / hasAuthorizedActiveGameSession）

### 修改的模块

- **自定义角色**：`useCustomCharacters` 从 Supabase CRUD 改为 localStorage 存储
- **AI 聊天路由**：`/api/chat` 去掉鉴权 + 积分检查，仅允许用户自带的 API Key（通过 header 透传）
- **AI 投票路由**：`/api/vote-batch` 去掉鉴权检查，透传用户 API Key
- **TTS 路由**：`/api/tts` 去掉鉴权检查
- **WelcomeScreen**：去掉所有商业相关弹窗/按钮，精简为只保留名字输入 + 设置 + 开始游戏
- **useGameLogic**：去掉 `gameSessionId` 追踪、刷新时恢复检查点改为纯本地判断
- **LLM 调用**：去掉服务端 fallback Key，仅使用用户自定义 Key
- **page.tsx (首页)**：去掉 `useCredits`、`useSupabase` 等依赖，去掉用户状态栏
- **game-machine.ts**：去掉 `gameSessionId` 相关状态
- **package.json**：删除 `stripe`、`@supabase/supabase-js`、`@supabase/ssr` 等商业依赖

### 保留的功能

- 游戏核心逻辑（发牌、阶段转换、AI 决策、胜负判定）
- UI 界面（入场、游戏板、昼夜切换、角色面板）
- 多语言（next-intl 中/英）
- 自定义角色（改为本地存储）
- 复盘功能（依赖保留，但去除游戏会话关联）
- 观战模式、原神模式
- 自定义 API Key 设置（`api-keys.ts` 保留，但简化）
- GitHub 链接
- DevTools

## Impact

### 受影响的功能模块

| 功能 | 变更类型 |
|------|---------|
| Stripe 支付 | **删除** |
| 积分系统 | **删除** |
| 用户登录/注册 | **删除** |
| 邀请码 | **删除** |
| 春节活动 | **删除** |
| 赞助商 | **删除** |
| 每日签到 | **删除** |
| 兑换码 | **删除** |
| Demo 模式 | **删除** |
| 游戏会话追踪 | **删除** |
| 自定义角色 | **改为本地存储** |
| AI 聊天 API | **改为仅用户自备 Key** |
| WelcomeScreen | **精简去商业化** |
| 首页 page.tsx | **精简去商业化** |

### 受影响代码文件

见 `tasks.md` 中的详细文件清单。

## 改造后架构

```
用户浏览器 → localStorage API Key → 前端请求（header 带 Key）
                                    → /api/chat (透传 Key 到 LLM)
                                    → /api/tts (透传 Key)
                                    → /api/vote-batch (透传 Key)
                                    → 无鉴权、无积分、无数据库
```

## 改造原则

1. **不破坏游戏逻辑**：不影响夜晚/白天/投票/警徽等核心流程
2. **不破坏 UI 完整性**：WelcomeScreen 和其他页面保持视觉一致性
3. **不破坏多语言**：保留 i18n 字符串，仅删除商业相关文案
4. **小步提交**：每个任务完成后可独立运行和验证