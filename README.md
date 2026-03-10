# AI System Pro

统一 monorepo 仓库，采用多 Agent 协作开发模式，覆盖从产品需求到 API、Web、小程序、移动端的全链路开发。

## 项目结构

```
ai-system-pro
│
├── system/                    # 应用层
│   ├── ai-system-api/         # NestJS 后端 API
│   ├── ai-system-web/         # React + MUI Web（Vite + Minimals）
│   ├── ai-system-miniapp/     # Taro 小程序
│   └── ai-system-app/         # Flutter 移动端（规划中）
│
├── share-doc/                 # 共享文档
│   ├── prd/                   # PRD、需求文档
│   ├── api-spec/              # API 契约（OpenAPI）
│   ├── database/              # 数据模型说明（可选）
│   └── qa/                    # 测试用例文档（QA 产出）
│
├── agents/                    # Agent 配置
│   ├── product-agent.md
│   ├── backend-agent.md
│   ├── frontend-agent.md
│   ├── mobile-agent.md
│   ├── miniapp-agent.md
│   └── qa-agent.md
│
├── .cursor/rules/             # Cursor 规则（按领域自动应用）
├── AGENTS.md                  # Agent 总览与工作流
└── scripts/                  # 脚本工具
```

## 技术栈

| 端     | 技术栈                           | 目录                        |
| ------ | -------------------------------- | --------------------------- |
| API    | NestJS + TypeORM + MySQL         | `system/ai-system-api/`     |
| Web    | React 19 + Vite + MUI + Minimals | `system/ai-system-web/`     |
| 小程序 | Taro                             | `system/ai-system-miniapp/` |
| 移动端 | Flutter                          | `system/ai-system-app/`     |

## 快速开始

### 根目录（推荐）

在仓库根目录执行，可快速启动各应用：

```bash
# 安装所有依赖
pnpm install

# 启动后端 API
pnpm dev:api

# 启动 Web 前端（另开终端）
pnpm dev:web

# 启动小程序（另开终端）
pnpm dev:miniapp
```

### 后端 API

```bash
cd system/ai-system-api

# 安装依赖
pnpm install

# 配置环境变量（复制模板后填写）
cp .env.template .env.local

# 开发模式
pnpm dev
```

API 开发规范见 `system/ai-system-api/docs/README.md`。

### Web 前端 (React + MUI)

```bash
cd system/ai-system-web

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build
```

Web 前端基于 **Vite + React 19 + MUI + Minimals** 模板，支持深色/浅色模式、移动端适配。开发规范见 `system/ai-system-web/docs/README.md`，完整规范见 `system/ai-system-web/skills/SKILL.md`。

### 小程序 (Taro)

```bash
cd system/ai-system-miniapp

# 安装依赖
pnpm install

# 微信小程序开发模式
pnpm dev:weapp

# 其他平台：dev:alipay / dev:h5 / dev:tt 等
```

小程序开发规范见 [agents/miniapp-agent.md](agents/miniapp-agent.md)。

### 环境要求

- **Node.js** 22+（Web 前端要求 22.12+）
- **pnpm** 10+
- **MySQL** 8.0+
- **Redis** 6+

## Agent 开发流程

详见 [AGENTS.md](AGENTS.md)。

```
产品需求
    ↓
Product Agent → PRD (share-doc/prd/) + API Spec 初稿 (share-doc/api-spec/)
    ↓
Backend Agent → API 实现 + API Spec 更新 (share-doc/api-spec/, system/ai-system-api/)
    ↓
Frontend / Miniapp / Mobile Agent（可并行，基于 share-doc/api-spec）
    ↓
QA Agent → 测试 (share-doc/qa/, 各 app 的 __tests__/)
```

## 使用方式

1. **启动任务**：根据当前阶段选择对应 Agent 配置（`agents/*.md`）
2. **遵循规则**：Cursor 会根据 `.cursor/rules/` 自动应用对应规范
3. **查阅文档**：`share-doc/` 与各应用 `docs/` 为各 Agent 的输入输出

## 相关文档

- [AGENTS.md](AGENTS.md) - Agent 列表、工作流、依赖关系
- [share-doc/README.md](share-doc/README.md) - 共享文档目录说明（PRD、API Spec、QA）
- [system/ai-system-api/docs/](system/ai-system-api/docs/) - 后端架构、编码规范、数据库设计
- [system/ai-system-web/docs/](system/ai-system-web/docs/) - 前端开发规范、目录结构、与 Cursor 规则
- [system/ai-system-web/skills/SKILL.md](system/ai-system-web/skills/SKILL.md) - 前端完整开发规范（组件、页面、API 调用等）
