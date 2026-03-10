import { RoleType, SystemRoleCode, PermissionResource, PermissionAction } from '../enums';
import { generatePermissionCode } from './permissions.constant';

/**
 * 角色定义接口
 */
export interface RoleDefinition {
  /** 角色代码 */
  code: SystemRoleCode | string;
  /** 角色名称 */
  name: string;
  /** 角色描述 */
  description: string;
  /** 角色类型 */
  type: RoleType;
  /** 是否为默认角色 */
  isDefault: boolean;
  /** 权限代码列表 */
  permissionCodes: string[];
}

/**
 * 系统默认角色定义
 */
export const DEFAULT_ROLES: RoleDefinition[] = [
  // ========== 超级管理员 ==========
  {
    code: SystemRoleCode.SUPER_ADMIN,
    name: '超级管理员',
    description: '拥有系统所有权限，不可删除',
    type: RoleType.SYSTEM,
    isDefault: false,
    permissionCodes: [generatePermissionCode(PermissionResource.ALL, PermissionAction.MANAGE)],
  },

  // ========== 平台管理员 ==========
  {
    code: SystemRoleCode.PLATFORM_ADMIN,
    name: '平台管理员',
    description: '负责平台日常管理和运营',
    type: RoleType.SYSTEM,
    isDefault: false,
    permissionCodes: [
      // 用户管理
      generatePermissionCode(PermissionResource.USER, PermissionAction.LIST),
      generatePermissionCode(PermissionResource.USER, PermissionAction.READ),
      generatePermissionCode(PermissionResource.USER, PermissionAction.UPDATE),
      generatePermissionCode(PermissionResource.USER, PermissionAction.FREEZE),
      generatePermissionCode(PermissionResource.USER, PermissionAction.UNFREEZE),
      generatePermissionCode(PermissionResource.USER, PermissionAction.BAN),
      generatePermissionCode(PermissionResource.USER, PermissionAction.AUDIT),
      // 资产管理
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.LIST),
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.READ),
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.UPDATE),
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.DELETE),
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.AUDIT),
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.UNPUBLISH),
      generatePermissionCode(PermissionResource.ASSET_CATEGORY, PermissionAction.MANAGE),
      // 订单管理
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.LIST),
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.READ),
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.MANAGE),
      // 支付管理
      generatePermissionCode(PermissionResource.PAYMENT, PermissionAction.LIST),
      generatePermissionCode(PermissionResource.REFUND, PermissionAction.AUDIT),
      generatePermissionCode(PermissionResource.SETTLEMENT, PermissionAction.MANAGE),
      // 争议管理
      generatePermissionCode(PermissionResource.DISPUTE, PermissionAction.LIST),
      generatePermissionCode(PermissionResource.DISPUTE, PermissionAction.ARBITRATE),
      // 系统管理
      generatePermissionCode(PermissionResource.ROLE, PermissionAction.MANAGE),
      generatePermissionCode(PermissionResource.PERMISSION, PermissionAction.LIST),
      generatePermissionCode(PermissionResource.AUDIT_LOG, PermissionAction.LIST),
    ],
  },

  // ========== 平台运营 ==========
  {
    code: SystemRoleCode.PLATFORM_OPERATOR,
    name: '平台运营',
    description: '负责平台内容审核和运营',
    type: RoleType.SYSTEM,
    isDefault: false,
    permissionCodes: [
      // 用户查看
      generatePermissionCode(PermissionResource.USER, PermissionAction.LIST),
      generatePermissionCode(PermissionResource.USER, PermissionAction.READ),
      // 资产审核
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.LIST),
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.READ),
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.AUDIT),
      // 订单查看
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.LIST),
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.READ),
    ],
  },

  // ========== 平台客服 ==========
  {
    code: SystemRoleCode.PLATFORM_SUPPORT,
    name: '平台客服',
    description: '负责用户服务和争议处理',
    type: RoleType.SYSTEM,
    isDefault: false,
    permissionCodes: [
      // 用户查看
      generatePermissionCode(PermissionResource.USER, PermissionAction.LIST),
      generatePermissionCode(PermissionResource.USER, PermissionAction.READ),
      // 订单查看
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.LIST),
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.READ),
      // 争议处理
      generatePermissionCode(PermissionResource.DISPUTE, PermissionAction.LIST),
      generatePermissionCode(PermissionResource.DISPUTE, PermissionAction.ARBITRATE),
      // 退款查看
      generatePermissionCode(PermissionResource.PAYMENT, PermissionAction.LIST),
    ],
  },

  // ========== 普通用户 ==========
  {
    code: SystemRoleCode.USER,
    name: '普通用户',
    description: '平台普通注册用户',
    type: RoleType.SYSTEM,
    isDefault: true, // 新用户默认角色
    permissionCodes: [
      // 资产操作（自己的）
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.CREATE),
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.LIST),
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.READ),
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.UPDATE),
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.DELETE),
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.PUBLISH),
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.UNPUBLISH),
      // 订单操作
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.CREATE),
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.LIST),
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.READ),
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.ACCEPT),
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.REJECT),
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.CANCEL),
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.COMPLETE),
      // 支付操作
      generatePermissionCode(PermissionResource.PAYMENT, PermissionAction.PAY),
      generatePermissionCode(PermissionResource.PAYMENT, PermissionAction.LIST),
      generatePermissionCode(PermissionResource.REFUND, PermissionAction.CREATE),
      // 争议操作
      generatePermissionCode(PermissionResource.DISPUTE, PermissionAction.DISPUTE),
      generatePermissionCode(PermissionResource.DISPUTE, PermissionAction.LIST),
    ],
  },

  // ========== 企业用户 ==========
  {
    code: SystemRoleCode.ENTERPRISE_USER,
    name: '企业用户',
    description: '平台认证企业用户',
    type: RoleType.SYSTEM,
    isDefault: false,
    permissionCodes: [
      // 继承普通用户所有权限
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.CREATE),
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.LIST),
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.READ),
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.UPDATE),
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.DELETE),
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.PUBLISH),
      generatePermissionCode(PermissionResource.ASSET, PermissionAction.UNPUBLISH),
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.CREATE),
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.LIST),
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.READ),
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.ACCEPT),
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.REJECT),
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.CANCEL),
      generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.COMPLETE),
      generatePermissionCode(PermissionResource.PAYMENT, PermissionAction.PAY),
      generatePermissionCode(PermissionResource.PAYMENT, PermissionAction.LIST),
      generatePermissionCode(PermissionResource.REFUND, PermissionAction.CREATE),
      generatePermissionCode(PermissionResource.DISPUTE, PermissionAction.DISPUTE),
      generatePermissionCode(PermissionResource.DISPUTE, PermissionAction.LIST),
      // 企业特有权限（可扩展）
      // 批量资产管理、团队管理等
    ],
  },

  // ========== 商户邀请拓展员 ==========
  {
    code: SystemRoleCode.MERCHANT_INVITER,
    name: '商户邀请拓展员',
    description: '可邀请商户入驻，查看自己的邀请码与奖励',
    type: RoleType.SYSTEM,
    isDefault: false,
    permissionCodes: [
      generatePermissionCode(PermissionResource.MERCHANT_INVITE, PermissionAction.LIST),
      generatePermissionCode(PermissionResource.MERCHANT_INVITE, PermissionAction.READ),
    ],
  },

  // ========== BD 商务拓展 ==========
  {
    code: SystemRoleCode.BD,
    name: 'BD 商务拓展',
    description: '商务拓展人员，可邀请商户、查看排行榜',
    type: RoleType.SYSTEM,
    isDefault: false,
    permissionCodes: [
      generatePermissionCode(PermissionResource.MERCHANT_INVITE, PermissionAction.LIST),
      generatePermissionCode(PermissionResource.MERCHANT_INVITE, PermissionAction.READ),
    ],
  },
];
