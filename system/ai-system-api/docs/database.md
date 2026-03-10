# 数据库设计

---

## 1. 设计原则

### 1.1 技术栈

- **数据库**：MySQL 8.0+
- **ORM**：TypeORM
- **命名**：表名、列名使用 snake_case

### 1.2 通用字段

所有业务表建议继承 BaseEntity，包含：

| 字段      | 类型     | 说明               |
| --------- | -------- | ------------------ |
| id        | uuid     | 主键               |
| createdAt | datetime | 创建时间           |
| updatedAt | datetime | 更新时间           |
| deletedAt | datetime | 软删除时间（可选） |
| createdBy | uuid     | 创建人（可选）     |
| updatedBy | uuid     | 更新人（可选）     |
| version   | int      | 乐观锁版本（可选） |

### 1.3 约束

- 主键统一使用 UUID
- 外键使用 `type: 'uuid'`
- 敏感字段加密存储
- 审计相关表不可物理删除

---

## 2. 索引与性能

### 2.1 常用索引

- 外键字段：按业务主键建索引
- 查询条件：`status`、`createdAt`
- 组合索引：按常用查询条件组合

### 2.2 分页

- 列表查询必须分页，默认 `pageSize=20`，最大 100
- 避免 `SELECT *`，按需 `select` 字段

---

## 3. 迁移与版本管理

- 使用 TypeORM migrations 管理 schema 变更
- 迁移文件命名：`YYYYMMDDHHMMSS-Description.ts`
- 禁止直接修改已有迁移，新增迁移解决变更

---

## 4. 安全与合规

- **敏感数据**：加密存储
- **审计日志**：不可修改、不可删除，定期备份
- **数据留存**：按业务域合规要求设定保存年限

---

## 5. 关联文档

- [架构设计](./architecture.md)
- [项目文件结构](../doc/file_structure.md)
