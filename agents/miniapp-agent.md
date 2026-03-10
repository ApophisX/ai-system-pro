# Miniapp Agent

## 职责范围

负责 Taro 小程序开发，包括页面、组件、API 调用、小程序特有能力（如登录、支付、分享、定位等）。

## 输入

- `share-doc/prd/*.md` - PRD 产品需求
- `share-doc/api-spec/*.yaml` - API 契约（OpenAPI）
- `system/ai-system-api/docs/api-spec/*.yaml` - API 规范（如有）

## 输出

- `system/ai-system-miniapp/` - 小程序代码

## 技术栈

| 类别     | 技术                          |
| -------- | ----------------------------- |
| 框架     | Taro 4.x                      |
| 语言     | TypeScript                    |
| UI       | React 18 + Less + TailwindCSS |
| 数据请求 | SWR / @tanstack/react-query   |
| API 生成 | @umijs/openapi (openapi2ts)   |
| 规范     | Husky + Commitlint            |

## 目录结构

```
system/ai-system-miniapp/
├── config/              # Taro 构建配置
├── src/
│   ├── pages/           # 页面（按路由划分）
│   ├── sections/        # 页面级业务区块
│   ├── components/      # 通用组件
│   ├── services/        # API 服务（含 openapi2ts 生成）
│   ├── actions/         # 业务 actions
│   ├── auth/            # 登录态、鉴权
│   ├── hooks/           # 自定义 hooks
│   ├── utils/           # 工具函数
│   ├── constants/       # 常量
│   ├── icons/           # 图标资源
│   ├── app.config.ts    # 小程序配置（页面、tabBar 等）
│   └── app.tsx          # 应用入口
└── project.config.json # 微信开发者工具配置
```

## 常用命令

| 命令               | 说明                       |
| ------------------ | -------------------------- |
| `pnpm dev:weapp`   | 微信小程序开发模式         |
| `pnpm dev:alipay`  | 支付宝小程序开发模式       |
| `pnpm dev:h5`      | H5 开发模式                |
| `pnpm build:weapp` | 微信小程序生产构建         |
| `pnpm api`         | 根据 OpenAPI 生成 API 代码 |

## 开发规范

1. **目录结构**：页面放 `src/pages/`，通用组件放 `src/components/`，页面级区块放 `src/sections/`
2. **多端适配**：Taro 支持微信/支付宝/百度/字节/H5 等，注意平台差异（如 `Taro.getEnv()` 判断）
3. **API 调用**：优先使用 `openapi2ts` 生成 `src/services/API/`，与 Web/Mobile 共用后端 API
4. **类型**：参考 `share-doc/api-spec` 定义
5. **小程序限制**：
   - 包大小（主包 2MB、分包 20MB）
   - 请求域名需在小程序后台配置白名单
   - 登录态使用 `Taro.getStorageSync` / `Taro.setStorageSync`
6. **样式**：使用 Less + TailwindCSS（weapp-tailwindcss），设计稿 750 宽度

## Cursor 规则

开发时 Cursor 会根据 `.cursor/rules/miniapp.mdc` 自动应用小程序规范。

## 依赖关系

- 上游: Backend Agent（API 就绪）
- 下游: QA Agent
