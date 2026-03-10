# 共享文档 (share-doc)

各 Agent 协作的输入输出目录，存放 PRD、API 契约、测试用例等跨端共享文档。

## 目录结构

| 目录         | 用途               | 负责 Agent | 说明                         |
| ------------ | ------------------ | ---------- | ---------------------------- |
| `prd/`       | 产品需求文档       | Product    | PRD、用户故事、验收标准      |
| `api-spec/`  | API 契约 (OpenAPI) | Product、Backend | OpenAPI 3.x YAML，与 Swagger 同步 |
| `database/`  | 数据模型说明       | Product、Backend | 表结构、实体说明（可选）     |
| `qa/`        | 测试用例文档       | QA         | 测试用例、测试计划           |

## 使用方式

1. **Product Agent**：产出 `prd/*.md`、`api-spec/*.yaml` 初稿
2. **Backend Agent**：读取 PRD 与 api-spec，实现 API，更新 api-spec
3. **Frontend/Mobile/Miniapp Agent**：读取 prd、api-spec 开发
4. **QA Agent**：读取 prd、api-spec 及各 app 代码，产出 `qa/*.md` 及测试代码

## 规范

- PRD 使用 Markdown，按模块拆分
- API 契约使用 OpenAPI 3.x YAML 格式
- 文档命名清晰，便于检索（如 `prd/user-module.md`、`api-spec/openapi.yaml`）
