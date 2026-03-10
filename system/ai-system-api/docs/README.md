# 后端开发规范 (NestJS)

本目录包含 NestJS 后端开发的完整规范，供 Backend Agent 及开发者参考。

## 文档结构

| 文档                                         | 用途               | 阅读时机                                       |
| -------------------------------------------- | ------------------ | ---------------------------------------------- |
| [architecture.md](./architecture.md)         | 架构原则与分层约束 | 理解整体架构、分层职责                         |
| [coding-standards.md](./coding-standards.md) | 日常编码规范       | 开发时查阅，Controller/Service/Repository 写法 |
| [prohibitions.md](./prohibitions.md)         | 禁止事项（红线）   | 合并前检查、避免违规                           |
| [adr.md](./adr.md)                           | 技术决策记录 (ADR) | 理解技术选型、设计背景                         |

## 阅读顺序（推荐）

1. **architecture.md** → 先理解三层架构和分层职责
2. **adr.md** → 了解技术栈选型与决策背景
3. **coding-standards.md** → 日常开发时按规范编码
4. **prohibitions.md** → 合并前自查，确保不触犯红线

## 文档关系

```
architecture.md (架构原则)
       │
       ├──→ coding-standards.md (编码规范，落地实现)
       │
       ├──→ prohibitions.md (红线，不可违反)
       │
       └──→ adr.md (决策依据，解释「为什么」)
```

## 与 Cursor 规则的关系

- **`.cursor/rules/backend.mdc`**：精简规则，编辑 `system/ai-system-api` 时 AI 自动应用
- **`docs/*.md`**：详细规范，Agent 开发时按需查阅

## 相关资源

- `share-doc/api-spec/` - OpenAPI 契约，与 Swagger 同步
- `docs/database.md` - 数据库设计
