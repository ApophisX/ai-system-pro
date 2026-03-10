# Frontend Agent

## 职责范围

负责 React + MUI Web 应用开发，包括页面、组件、状态管理、API 调用。

## 输入

- `share-doc/prd/*.md` - PRD 产品需求
- `share-doc/api-spec/*.yaml` - API 契约

## 输出

- `system/ai-system-web/` - Web 页面与组件代码

## 技术栈

- **框架**: React
- **UI**: MUI (Material-UI)

## 开发规范

**完整规范**：`system/ai-system-web/skills/SKILL.md`（建议在 Agent 聊天中 @frontend-react-mui 引用）。**简要规范**见 `system/ai-system-web/docs/README.md`，开发前请查阅：

1. **目录结构**：`src/pages/`、`src/sections/{module}/`、`src/components/`
2. **组件**：Function Component，PascalCase 命名，禁止 class component、any
3. **API 调用**：通过 `src/lib/axios.ts`，使用 `@tanstack/react-query`
4. **UI**：MUI + Minimals 模板，支持深色/浅色模式、Mobile First

## 依赖关系

- 上游: Backend Agent（API 就绪）
- 下游: QA Agent
