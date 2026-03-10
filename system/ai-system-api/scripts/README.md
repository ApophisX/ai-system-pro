# 初始化脚本

## 资产分类数据初始化

### 自动初始化

项目启动时会自动检查并初始化资产分类数据。如果数据库中已存在分类数据，会自动跳过初始化，不会重复创建。

### 手动初始化

如果需要手动执行初始化，可以使用以下命令：

```bash
# 普通初始化（如果已有数据会跳过）
npm run init:categories

# 强制重新初始化（会重新初始化所有数据）
npm run init:categories:force
```

### 直接使用 ts-node

```bash
# 普通初始化
ts-node -r tsconfig-paths/register scripts/init-asset-categories.ts

# 强制重新初始化
ts-node -r tsconfig-paths/register scripts/init-asset-categories.ts --force
```

### 说明

- 初始化过程在事务中执行，确保数据一致性
- 如果初始化失败，事务会回滚，不会影响数据库状态
- 子分类的 code 格式为：`PARENTCODE_CHILDCODE`（如 `CAMERA_CAMERA`）
- 分类按照数据文件中的顺序设置排序权重（第一个最大）
