import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { PermissionAction, PermissionResource } from '../enums';
import { generatePermissionCode } from '../constants';

/**
 * 权限元数据键
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * 权限要求接口
 */
export interface PermissionRequirement {
  /** 资源类型 */
  resource: PermissionResource;
  /** 操作动作 */
  action: PermissionAction;
}

/**
 * 权限装饰器
 *
 * 用于声明接口所需的权限
 *
 * @example
 * // 使用权限代码字符串
 * @Permissions('asset:create', 'asset:update')
 *
 * // 使用权限对象
 * @Permissions({ resource: PermissionResource.ASSET, action: PermissionAction.CREATE })
 *
 * // 混合使用
 * @Permissions('asset:create', { resource: PermissionResource.USER, action: PermissionAction.READ })
 */
export const Permissions = (...permissions: (string | PermissionRequirement)[]): CustomDecorator<string> => {
  // 标准化权限为字符串数组
  const normalizedPermissions = permissions.map(permission => {
    if (typeof permission === 'string') {
      return permission;
    }
    return generatePermissionCode(permission.resource, permission.action);
  });

  return SetMetadata(PERMISSIONS_KEY, normalizedPermissions);
};

/**
 * 单一权限装饰器（便捷方法）
 *
 * @example
 * @RequirePermission(PermissionResource.ASSET, PermissionAction.CREATE)
 */
export const RequirePermission = (resource: PermissionResource, action: PermissionAction): CustomDecorator<string> => {
  return Permissions({ resource, action });
};
