/**
 * ACL 模块守卫统一导出
 */
export { PermissionsGuard } from './permissions.guard';
export { RolesGuard } from './roles.guard';
export { ResourceOwnerGuard, RESOURCE_OWNER_VALIDATOR, type ResourceOwnerValidator } from './resource-owner.guard';
