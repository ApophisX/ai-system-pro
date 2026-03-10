import { SetMetadata, CustomDecorator } from '@nestjs/common';

/**
 * 资源所有者元数据键
 */
export const RESOURCE_OWNER_KEY = 'resourceOwner';

/**
 * 资源所有者配置接口
 */
export interface ResourceOwnerConfig {
  /**
   * 资源 ID 参数名（从路由参数获取）
   * @default 'id'
   */
  resourceIdParam?: string;

  /**
   * 用户 ID 字段名（在资源实体中的字段名）
   * @default 'userId'
   */
  ownerField?: string;

  /**
   * 是否允许管理员绕过所有者检查
   * @default true
   */
  allowAdminBypass?: boolean;
}

/**
 * 资源所有者装饰器
 *
 * 用于声明接口需要验证当前用户是否为资源所有者
 * 配合 ResourceOwnerGuard 使用
 *
 * @example
 * // 默认配置
 * @ResourceOwner()
 *
 * // 自定义配置
 * @ResourceOwner({
 *   resourceIdParam: 'assetId',
 *   ownerField: 'createdById',
 *   allowAdminBypass: true
 * })
 */
export const ResourceOwner = (config: ResourceOwnerConfig = {}): CustomDecorator<string> => {
  const defaultConfig: ResourceOwnerConfig = {
    resourceIdParam: 'id',
    ownerField: 'userId',
    allowAdminBypass: true,
  };

  return SetMetadata(RESOURCE_OWNER_KEY, { ...defaultConfig, ...config });
};
