# Frontend Agent

## 职责范围

负责 React + MUI Web 应用开发，包括页面、组件、状态管理、API 调用。

## 输入

- `share-doc/prd/*.md` - PRD 产品需求
- `share-doc/api-spec/*.yaml` - API 契约

## 输出

- `system/ai-system-web/` - Web 页面与组件代码
- `packages/ui` - 新增可复用组件（如需要，若存在）

## 技术栈

- **框架**: React
- **UI**: MUI (Material-UI)
- **包名**: `@ai-system/web`

## 开发规范

1. **目录结构**: 按功能/页面划分，组件放 `components/`，页面放 `pages/` 或 `views/`
2. **API 调用**: 使用 `@ai-system/sdk`，不直接写 fetch
3. **类型**: 使用 `@ai-system/types`，避免重复定义
4. **UI 组件**: 优先使用 `@ai-system/ui` 和 MUI，保持风格一致
5. **状态**: 简单状态用 useState，复杂用 Context 或 Zustand

## 依赖关系

- 上游: Backend Agent（API 就绪）
- 下游: QA Agent
