/**
 * 权限资源枚举
 *
 * 定义系统中所有可被访问控制的资源类型
 * 与业务模块对应
 */
export enum PermissionResource {
  // ========== 用户模块 ==========
  /** 用户 */
  USER = 'user',
  /** 用户资料 */
  USER_PROFILE = 'user_profile',

  // ========== 资产模块 ==========
  /** 资产 */
  ASSET = 'asset',
  /** 资产分类 */
  ASSET_CATEGORY = 'asset_category',
  /** 资产标签 */
  ASSET_TAG = 'asset_tag',
  /** 资产库存 */
  ASSET_INVENTORY = 'asset_inventory',
  /** 租赁方案 */
  RENTAL_PLAN = 'rental_plan',

  // ========== 订单模块 ==========
  /** 租赁订单 */
  RENTAL_ORDER = 'rental_order',
  /** 订单支付 */
  ORDER_PAYMENT = 'order_payment',

  // ========== 支付与结算模块 ==========
  /** 支付记录 */
  PAYMENT = 'payment',
  /** 结算记录 */
  SETTLEMENT = 'settlement',
  /** 退款记录 */
  REFUND = 'refund',

  // ========== 信用与风控模块 ==========
  /** 信用记录 */
  CREDIT = 'credit',
  /** 风控规则 */
  RISK_RULE = 'risk_rule',

  // ========== 争议模块 ==========
  /** 争议工单 */
  DISPUTE = 'dispute',

  // ========== 系统管理模块 ==========
  /** 角色管理 */
  ROLE = 'role',
  /** 权限管理 */
  PERMISSION = 'permission',
  /** 系统配置 */
  SYSTEM_CONFIG = 'system_config',
  /** 操作日志 */
  AUDIT_LOG = 'audit_log',

  // ========== 商户增长模块 ==========
  /** 商户邀请 */
  MERCHANT_INVITE = 'merchant_invite',

  // ========== 通用资源 ==========
  /** 所有资源（超级管理员） */
  ALL = 'all',
}
