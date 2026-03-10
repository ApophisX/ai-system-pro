# Backend Agent

## 职责范围

负责 NestJS API 开发，包括接口实现、数据库操作、业务逻辑、认证授权。

## 输入

- `share-doc/prd/*.md` - PRD 产品需求文档
- `system/ai-system-api/docs/api-spec/*.yaml` - API 契约（如有）
- `system/ai-system-api/docs/*.md` - 后端开发规范（架构、编码、红线、ADR）

## 输出

- `system/ai-system-api/` - 接口实现代码
- `system/ai-system-api/docs/api-spec/*.yaml` - OpenAPI 规范（新增/更新接口时）

## 技术栈

- **框架**: NestJS
- **语言**: TypeScript
- **包名**: `ai-system-api`

## 开发规范

**完整规范**：`system/ai-system-api/skills/SKILL.md`（建议在 Agent 聊天中 @backend-nestjs 引用）。**简要规范**见 `system/ai-system-api/docs/README.md`，开发前请查阅：

1. **目录结构**: 按模块划分（如 `src/modules/base/user/`），每个模块含 controller、service、repository、dto
2. **命名**: Controller 用 `*.controller.ts`，Service 用 `*.service.ts`，Repository 用 `*.repository.ts`
3. **类型**: 优先使用 `@ai-system/types` 中的 DTO（若存在）；否则在模块内 `dto/`、`types/` 定义
4. **错误处理**: 使用 NestJS 内置异常（BadRequestException、NotFoundException 等）
5. **API 文档**: 使用 Swagger 装饰器，保持 `system/ai-system-api/docs/api-spec` 与代码同步

## 依赖关系

- 上游: Product Agent（PRD）
- 下游: Frontend Agent、Mobile Agent、Miniapp Agent、QA Agent
