/**
 * ACL 模块装饰器统一导出
 */
export { Permissions, RequirePermission, PERMISSIONS_KEY, type PermissionRequirement } from './permissions.decorator';
export { Roles, SuperAdminOnly, PlatformAdminOnly, ROLES_KEY } from './roles.decorator';
export { ResourceOwner, RESOURCE_OWNER_KEY, type ResourceOwnerConfig } from './resource-owner.decorator';
