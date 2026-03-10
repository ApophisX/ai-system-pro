import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { PermissionEntity, RoleEntity, UserRoleEntity } from './entities';

// Repositories
import { PermissionRepository, RoleRepository, UserRoleRepository } from './repositories';

// Services
import { AclService, RoleService } from './services';

// Guards
import { PermissionsGuard, RolesGuard, ResourceOwnerGuard, RESOURCE_OWNER_VALIDATOR } from './guards';

// Controller
import { AclController } from './acl.controller';

/**
 * ACL 权限控制模块
 *
 * 提供基于角色的访问控制（RBAC）功能：
 * - 权限定义与管理
 * - 角色定义与管理
 * - 用户角色分配
 * - 权限检查
 *
 * @example
 * // 在 Controller 中使用权限控制
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @Permissions('asset:create')
 * async createAsset() {}
 *
 * // 使用角色控制
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(SystemRoleCode.PLATFORM_ADMIN)
 * async adminOnly() {}
 *
 * // 在 Service 中检查权限
 * const hasPermission = await this.aclService.hasPermission(userId, 'asset:create');
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([PermissionEntity, RoleEntity, UserRoleEntity])],
  controllers: [AclController],
  providers: [
    // Repositories
    PermissionRepository,
    RoleRepository,
    UserRoleRepository,
    // Services
    AclService,
    RoleService,
    // Guards
    PermissionsGuard,
    RolesGuard,
    ResourceOwnerGuard,
    // 资源所有者验证器（默认不提供，由具体模块注入）
    {
      provide: RESOURCE_OWNER_VALIDATOR,
      useValue: null,
    },
  ],
  exports: [
    // Services
    AclService,
    RoleService,
    // Guards
    PermissionsGuard,
    RolesGuard,
    ResourceOwnerGuard,
    // Repositories（供其他模块扩展使用）
    PermissionRepository,
    RoleRepository,
    UserRoleRepository,
  ],
})
export class AclModule {}
