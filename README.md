# AI System Pro

统一 monorepo 仓库，采用多 Agent 协作开发模式，覆盖从产品需求到 API、Web、小程序、移动端的全链路开发。

## 项目结构

```
ai-system-pro
│
├── system/                    # 应用层
│   ├── ai-system-api/         # NestJS 后端 API
│   ├── ai-system-web/         # React + MUI Web（规划中）
│   ├── ai-system-miniapp/     # Taro 小程序（规划中）
│   └── ai-system-app/         # Flutter 移动端（规划中）
│
├── share-doc/                 # 共享文档
│   ├── prd/                   # PRD、需求文档
│   └── api-spec/              # API 契约（OpenAPI）
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

| 端     | 技术栈                   | 目录                        |
| ------ | ------------------------ | --------------------------- |
| API    | NestJS + TypeORM + MySQL | `system/ai-system-api/`     |
| Web    | React + MUI              | `system/ai-system-web/`     |
| 小程序 | Taro                     | `system/ai-system-miniapp/` |
| 移动端 | Flutter                  | `system/ai-system-app/`     |

## 快速开始

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

### 环境要求

- **Node.js** 18+
- **pnpm** 8+
- **MySQL** 8.0+
- **Redis** 6+

## Agent 开发流程

详见 [AGENTS.md](AGENTS.md)。

```
产品需求
    ↓
Product Agent → PRD 文档 (share-doc/prd/)
    ↓
Backend Agent → API + API Spec (share-doc/api-spec/, system/ai-system-api/docs/)
    ↓
Frontend / Miniapp / Mobile Agent（可并行）
    ↓
QA Agent → 测试
```

## 使用方式

1. **启动任务**：根据当前阶段选择对应 Agent 配置（`agents/*.md`）
2. **遵循规则**：Cursor 会根据 `.cursor/rules/` 自动应用对应规范
3. **查阅文档**：`share-doc/` 与各应用 `docs/` 为各 Agent 的输入输出

## 相关文档

- [AGENTS.md](AGENTS.md) - Agent 列表、工作流、依赖关系
- [system/ai-system-api/docs/](system/ai-system-api/docs/) - 后端架构、编码规范、数据库设计
