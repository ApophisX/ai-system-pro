import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { SystemRoleCode } from '../enums';

/**
 * 角色元数据键
 */
export const ROLES_KEY = 'roles';

/**
 * 角色装饰器
 *
 * 用于声明接口所需的角色
 * 用户只需拥有其中任一角色即可访问
 *
 * @example
 * // 使用预定义角色代码
 * @Roles(SystemRoleCode.PLATFORM_ADMIN, SystemRoleCode.SUPER_ADMIN)
 *
 * // 使用字符串（自定义角色）
 * @Roles('custom_role', SystemRoleCode.PLATFORM_ADMIN)
 */
export const Roles = (...roles: (SystemRoleCode | string)[]): CustomDecorator<string> => {
  return SetMetadata(ROLES_KEY, roles);
};

/**
 * 仅超级管理员装饰器（便捷方法）
 *
 * @example
 * @SuperAdminOnly()
 */
export const SuperAdminOnly = (): CustomDecorator<string> => {
  return Roles(SystemRoleCode.SUPER_ADMIN);
};

/**
 * 平台管理员装饰器（便捷方法）
 * 包含超级管理员和平台管理员
 *
 * @example
 * @PlatformAdminOnly()
 */
export const PlatformAdminOnly = (): CustomDecorator<string> => {
  return Roles(SystemRoleCode.SUPER_ADMIN, SystemRoleCode.PLATFORM_ADMIN);
};
