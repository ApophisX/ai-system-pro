# AI System - Agent 开发架构

本仓库采用多 Agent 协作开发模式，各 Agent 负责不同领域，按流程串联完成从需求到上线的全链路开发。

## Agent 列表

| Agent        | 职责               | 输入               | 输出                           | 配置                                          |
| ------------ | ------------------ | ------------------ | ------------------------------ | --------------------------------------------- |
| **Product**  | 需求拆解、PRD 产出 | 原始需求           | share-doc/prd, api-spec 初稿   | [product-agent.md](agents/product-agent.md)   |
| **Backend**  | NestJS API 开发    | PRD, api-spec      | system/ai-system-api, api-spec | [backend-agent.md](agents/backend-agent.md)   |
| **Frontend** | React + MUI Web    | PRD, api-spec, sdk | system/ai-system-web           | [frontend-agent.md](agents/frontend-agent.md) |
| **Mobile**   | Flutter App        | PRD, api-spec      | system/ai-system-app           | [mobile-agent.md](agents/mobile-agent.md)     |
| **Miniapp**  | Taro 小程序        | PRD, api-spec      | system/ai-system-miniapp       | [miniapp-agent.md](agents/miniapp-agent.md)   |
| **QA**       | 测试用例与自动化   | 各 app 代码        | 测试代码, share-doc/qa         | [qa-agent.md](agents/qa-agent.md)             |

## 推荐工作流

```
产品需求
    ↓
Product Agent → PRD (share-doc/prd/) + API Spec 初稿 (share-doc/api-spec/)
    ↓
Backend Agent → API 实现 + API Spec 更新 (share-doc/api-spec/, system/ai-system-api/)
    ↓
Frontend / Miniapp / Mobile Agent（可并行，基于 API 契约）
    ↓
QA Agent → 测试 (share-doc/qa/, 各 app 的 __tests__/)
```

## 使用方式

1. **启动任务**：根据当前阶段选择对应 Agent 配置（`agents/*.md`）
2. **遵循规则**：Cursor 会根据 `.cursor/rules/` 按 glob 自动应用对应规范（product/backend/frontend/mobile/miniapp/qa）
3. **查阅文档**：`share-doc/` 下 prd、api-spec 及各应用 `docs/`、`skills/SKILL.md` 为各 Agent 的输入输出

## 依赖关系

```
Product → Backend → Frontend
                 → Mobile
                 → Miniapp
                 → QA（依赖所有 app）
```

## 快速启动

| 阶段     | 操作说明                                                                 |
| -------- | ------------------------------------------------------------------------ |
| 产品需求 | 打开 `agents/product-agent.md`，在 Cursor 中 @ 引用，编辑 `share-doc/prd/` |
| 后端开发 | 打开 `agents/backend-agent.md`，编辑 `system/ai-system-api/` 时自动应用 backend 规则 |
| 前端开发 | 打开 `agents/frontend-agent.md`，编辑 `system/ai-system-web/` 时自动应用 frontend 规则 |
| 小程序   | 打开 `agents/miniapp-agent.md`，编辑 `system/ai-system-miniapp/` 时自动应用 miniapp 规则 |
| 移动端   | 打开 `agents/mobile-agent.md`，编辑 `system/ai-system-app/` 时自动应用 mobile 规则 |
| 测试     | 打开 `agents/qa-agent.md`，编写测试时自动应用 qa 规则                     |
