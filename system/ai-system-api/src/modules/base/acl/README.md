# ACL 权限控制模块

## 概述

ACL（Access Control List）模块提供基于角色的访问控制（RBAC）功能，支持：

- **权限（Permission）**：细粒度的操作权限，格式为 `resource:action`
- **角色（Role）**：权限的集合，可分配给用户
- **用户角色（UserRole）**：用户与角色的关联，支持有效期

## 快速开始

### 1. 导入模块

```typescript
import { AclModule } from '@/modules/base/acl/acl.module';

@Module({
  imports: [AclModule],
})
export class AppModule {}
```

### 2. 在 Controller 中使用

```typescript
import { JwtAuthGuard } from '@/modules/base/auth/guards';
import { PermissionsGuard, RolesGuard } from '@/modules/base/acl/guards';
import {
  Permissions,
  Roles,
  RequirePermission,
} from '@/modules/base/acl/decorators';
import {
  SystemRoleCode,
  PermissionResource,
  PermissionAction,
} from '@/modules/base/acl/enums';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetController {
  // 方式1：使用权限代码字符串
  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('asset:create')
  async create() {}

  // 方式2：使用 RequirePermission 装饰器
  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionResource.ASSET, PermissionAction.UPDATE)
  async update() {}

  // 方式3：使用角色控制
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(SystemRoleCode.PLATFORM_ADMIN)
  async delete() {}
}
```

### 3. 在 Service 中检查权限

```typescript
import { AclService } from '@/modules/base/acl/services';

@Injectable()
export class AssetService {
  constructor(private aclService: AclService) {}

  async updateAsset(userId: string, assetId: string, data: UpdateAssetDto) {
    // 检查权限
    const hasPermission = await this.aclService.hasPermission(
      userId,
      'asset:update',
    );
    if (!hasPermission) {
      throw new ForbiddenException('没有权限更新资产');
    }

    // 执行更新...
  }
}
```

## 预置角色

| 角色代码            | 角色名称   | 说明                         |
| ------------------- | ---------- | ---------------------------- |
| `super_admin`       | 超级管理员 | 拥有所有权限                 |
| `platform_admin`    | 平台管理员 | 负责平台日常管理             |
| `platform_operator` | 平台运营   | 负责内容审核和运营           |
| `platform_support`  | 平台客服   | 负责用户服务和争议处理       |
| `user`              | 普通用户   | 平台普通注册用户（默认角色） |
| `enterprise_user`   | 企业用户   | 平台认证企业用户             |

## 权限代码格式

权限代码格式为 `resource:action`，例如：

- `asset:create` - 创建资产
- `asset:update` - 更新资产
- `rental_order:manage` - 管理所有订单
- `all:manage` - 超级权限（拥有所有权限）

## API 接口

### 角色管理

- `GET /acl/roles` - 获取所有角色列表
- `GET /acl/roles/:id` - 获取角色详情
- `POST /acl/roles` - 创建角色
- `PUT /acl/roles/:id` - 更新角色
- `DELETE /acl/roles/:id` - 删除角色

### 权限查询

- `GET /acl/permissions` - 获取所有权限列表

### 用户角色分配

- `POST /acl/users/roles/assign` - 为用户分配角色
- `POST /acl/users/roles/remove` - 移除用户角色

### 当前用户权限

- `GET /acl/me/roles` - 获取当前用户的角色列表
- `GET /acl/me/permissions` - 获取当前用户的权限列表
- `GET /acl/me/check-permission/:code` - 检查当前用户是否拥有指定权限

## 扩展权限

如需添加新的权限，修改 `constants/permissions.constant.ts`：

```typescript
export const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  // ... 现有权限

  // 添加新权限
  {
    code: generatePermissionCode(
      PermissionResource.NEW_RESOURCE,
      PermissionAction.CREATE,
    ),
    name: '创建新资源',
    description: '创建新资源的权限',
    resource: PermissionResource.NEW_RESOURCE,
    action: PermissionAction.CREATE,
    group: '新模块',
  },
];
```

## 扩展角色

如需添加新的预置角色，修改 `constants/default-roles.constant.ts`：

```typescript
export const DEFAULT_ROLES: RoleDefinition[] = [
  // ... 现有角色

  // 添加新角色
  {
    code: 'content_manager',
    name: '内容管理员',
    description: '负责内容管理',
    type: RoleType.SYSTEM,
    isDefault: false,
    permissionCodes: ['asset:list', 'asset:read', 'asset:audit'],
  },
];
```

## 缓存说明

ACL 服务内置了用户权限缓存，以提高查询性能：

- 用户权限在首次查询时加载并缓存
- 角色变更后会自动清除相关缓存
- 可手动清除缓存：`aclService.clearUserCache(userId)` 或 `aclService.clearAllCache()`

## 数据库表结构

- `acl_permission` - 权限表
- `acl_role` - 角色表
- `acl_role_permission` - 角色权限关联表
- `acl_user_role` - 用户角色关联表
