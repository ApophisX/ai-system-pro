# AI System - Agent 开发架构

本仓库采用多 Agent 协作开发模式，各 Agent 负责不同领域，按流程串联完成从需求到上线的全链路开发。

## Agent 列表

| Agent        | 职责               | 输入               | 输出                        | 配置                                          |
| ------------ | ------------------ | ------------------ | --------------------------- | --------------------------------------------- |
| **Product**  | 需求拆解、PRD 产出 | 原始需求           | docs/product, api-spec 初稿 | [product-agent.md](agents/product-agent.md)   |
| **Backend**  | NestJS API 开发    | PRD, api-spec      | apps/api, docs/api-spec     | [backend-agent.md](agents/backend-agent.md)   |
| **Frontend** | React + MUI Web    | PRD, api-spec, sdk | apps/web                    | [frontend-agent.md](agents/frontend-agent.md) |
| **Mobile**   | Flutter App        | PRD, api-spec      | apps/mobile                 | [mobile-agent.md](agents/mobile-agent.md)     |
| **Miniapp**  | Taro 小程序        | PRD, api-spec      | apps/miniapp                | [miniapp-agent.md](agents/miniapp-agent.md)   |
| **QA**       | 测试用例与自动化   | 各 app 代码        | 测试代码, docs/qa           | [qa-agent.md](agents/qa-agent.md)             |

## 推荐工作流

```
产品需求
    ↓
Product Agent → PRD (docs/product/)
    ↓
Backend Agent → API + API Spec (docs/api-spec/)
    ↓
Frontend / Miniapp / Mobile Agent（可并行，基于 API 契约）
    ↓
QA Agent → 测试
```

## 使用方式

1. **启动任务**：根据当前阶段选择对应 Agent 配置（`agents/*.md`）
2. **遵循规则**：Cursor 会根据 `.cursor/rules/` 自动应用对应规范
3. **查阅文档**：`docs/` 下 product、api-spec、database 等为各 Agent 的输入输出

## 依赖关系

```
Product → Backend → Frontend
                 → Mobile
                 → Miniapp
                 → QA（依赖所有 app）
```

## 共享包

- `@ai-system/types` - DTO/类型，各端共用
- `@ai-system/sdk` - API 调用封装
- `@ai-system/ui` - 共享 UI 组件（Web/小程序）
- `@ai-system/utils` - 工具函数
- `@ai-system/config` - ESLint/tsconfig
