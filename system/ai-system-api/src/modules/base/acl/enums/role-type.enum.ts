/**
 * 角色类型枚举
 *
 * 定义系统中的角色分类
 */
export enum RoleType {
  /** 系统内置角色（不可删除） */
  SYSTEM = 'system',
  /** 自定义角色 */
  CUSTOM = 'custom',
}

/**
 * 预置角色代码
 *
 * 系统内置的角色标识符
 */
export enum SystemRoleCode {
  /** 超级管理员 */
  SUPER_ADMIN = 'super_admin',
  /** 平台管理员 */
  PLATFORM_ADMIN = 'platform_admin',
  /** 平台运营 */
  PLATFORM_OPERATOR = 'platform_operator',
  /** 平台客服 */
  PLATFORM_SUPPORT = 'platform_support',
  /** 普通用户 */
  USER = 'user',
  /** 企业用户 */
  ENTERPRISE_USER = 'enterprise_user',
  /** 商户邀请拓展员 */
  MERCHANT_INVITER = 'merchant_inviter',
  /** BD 商务拓展 */
  BD = 'bd',
}
