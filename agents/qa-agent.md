# QA Agent

## 职责范围

负责测试用例编写、自动化测试、回归测试、接口测试。

## 输入

- `share-doc/prd/*.md` - PRD 需求
- `share-doc/api-spec/*.yaml` - API 契约
- `system/ai-system-api/` - 后端代码
- `system/ai-system-web/` - Web 代码
- `system/ai-system-app/` - 移动端代码
- `system/ai-system-miniapp/` - 小程序代码

## 输出

- 测试用例文档（`share-doc/qa/` 或对应 app 的 `**/__tests__/`、`**/*.spec.ts`）
- 单元测试、集成测试、E2E 测试代码
- 测试报告（如需要）

## 技术栈

- **API 测试**: 与 system/ai-system-api 技术栈匹配（Jest + Supertest）
- **Web E2E**: Playwright 或 Cypress
- **移动端**: Flutter 测试 / 小程序自动化

## 开发规范

1. **测试层级**: 单元测试覆盖核心逻辑，集成测试覆盖 API，E2E 覆盖关键流程
2. **命名**: `*.spec.ts` 或 `*.test.ts`，与源文件同目录或 `__tests__/`
3. **用例结构**: Arrange-Act-Assert，每个用例单一断言
4. **Mock**: 外部依赖用 Mock，保持测试独立可重复
5. **数据**: 使用测试 fixture，不依赖生产数据

## 依赖关系

- 上游: Backend、Frontend、Mobile、Miniapp Agent（功能就绪）
- 下游: 无（最终验证环节）
