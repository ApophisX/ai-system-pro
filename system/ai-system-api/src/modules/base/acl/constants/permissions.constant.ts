import { PermissionAction, PermissionResource } from '../enums';

/**
 * 权限定义接口
 */
export interface PermissionDefinition {
  /** 权限代码 */
  code: string;
  /** 权限名称 */
  name: string;
  /** 权限描述 */
  description: string;
  /** 资源类型 */
  resource: PermissionResource;
  /** 操作动作 */
  action: PermissionAction;
  /** 权限分组 */
  group: string;
}

/**
 * 生成权限代码
 */
export const generatePermissionCode = (resource: PermissionResource, action: PermissionAction): string => {
  return `${resource}:${action}`;
};

/**
 * 系统预置权限定义
 *
 * 所有权限按模块分组定义
 */
export const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  // ========== 用户管理权限 ==========
  {
    code: generatePermissionCode(PermissionResource.USER, PermissionAction.LIST),
    name: '查看用户列表',
    description: '查看系统用户列表',
    resource: PermissionResource.USER,
    action: PermissionAction.LIST,
    group: '用户管理',
  },
  {
    code: generatePermissionCode(PermissionResource.USER, PermissionAction.READ),
    name: '查看用户详情',
    description: '查看用户详细信息',
    resource: PermissionResource.USER,
    action: PermissionAction.READ,
    group: '用户管理',
  },
  {
    code: generatePermissionCode(PermissionResource.USER, PermissionAction.UPDATE),
    name: '编辑用户',
    description: '编辑用户信息',
    resource: PermissionResource.USER,
    action: PermissionAction.UPDATE,
    group: '用户管理',
  },
  {
    code: generatePermissionCode(PermissionResource.USER, PermissionAction.FREEZE),
    name: '冻结用户',
    description: '冻结用户账户',
    resource: PermissionResource.USER,
    action: PermissionAction.FREEZE,
    group: '用户管理',
  },
  {
    code: generatePermissionCode(PermissionResource.USER, PermissionAction.UNFREEZE),
    name: '解冻用户',
    description: '解冻用户账户',
    resource: PermissionResource.USER,
    action: PermissionAction.UNFREEZE,
    group: '用户管理',
  },
  {
    code: generatePermissionCode(PermissionResource.USER, PermissionAction.BAN),
    name: '封禁用户',
    description: '封禁用户账户',
    resource: PermissionResource.USER,
    action: PermissionAction.BAN,
    group: '用户管理',
  },
  {
    code: generatePermissionCode(PermissionResource.USER, PermissionAction.AUDIT),
    name: '审核用户',
    description: '审核用户实名认证',
    resource: PermissionResource.USER,
    action: PermissionAction.AUDIT,
    group: '用户管理',
  },

  // ========== 资产管理权限 ==========
  {
    code: generatePermissionCode(PermissionResource.ASSET, PermissionAction.CREATE),
    name: '创建资产',
    description: '发布新资产',
    resource: PermissionResource.ASSET,
    action: PermissionAction.CREATE,
    group: '资产管理',
  },
  {
    code: generatePermissionCode(PermissionResource.ASSET, PermissionAction.LIST),
    name: '查看资产列表',
    description: '查看资产列表',
    resource: PermissionResource.ASSET,
    action: PermissionAction.LIST,
    group: '资产管理',
  },
  {
    code: generatePermissionCode(PermissionResource.ASSET, PermissionAction.READ),
    name: '查看资产详情',
    description: '查看资产详细信息',
    resource: PermissionResource.ASSET,
    action: PermissionAction.READ,
    group: '资产管理',
  },
  {
    code: generatePermissionCode(PermissionResource.ASSET, PermissionAction.UPDATE),
    name: '编辑资产',
    description: '编辑资产信息',
    resource: PermissionResource.ASSET,
    action: PermissionAction.UPDATE,
    group: '资产管理',
  },
  {
    code: generatePermissionCode(PermissionResource.ASSET, PermissionAction.DELETE),
    name: '删除资产',
    description: '删除资产',
    resource: PermissionResource.ASSET,
    action: PermissionAction.DELETE,
    group: '资产管理',
  },
  {
    code: generatePermissionCode(PermissionResource.ASSET, PermissionAction.PUBLISH),
    name: '发布资产',
    description: '上架资产',
    resource: PermissionResource.ASSET,
    action: PermissionAction.PUBLISH,
    group: '资产管理',
  },
  {
    code: generatePermissionCode(PermissionResource.ASSET, PermissionAction.UNPUBLISH),
    name: '下架资产',
    description: '下架资产',
    resource: PermissionResource.ASSET,
    action: PermissionAction.UNPUBLISH,
    group: '资产管理',
  },
  {
    code: generatePermissionCode(PermissionResource.ASSET, PermissionAction.AUDIT),
    name: '审核资产',
    description: '审核资产发布',
    resource: PermissionResource.ASSET,
    action: PermissionAction.AUDIT,
    group: '资产管理',
  },

  // ========== 资产分类权限 ==========
  {
    code: generatePermissionCode(PermissionResource.ASSET_CATEGORY, PermissionAction.MANAGE),
    name: '管理资产分类',
    description: '管理资产分类（增删改查）',
    resource: PermissionResource.ASSET_CATEGORY,
    action: PermissionAction.MANAGE,
    group: '资产管理',
  },

  // ========== 租赁订单权限 ==========
  {
    code: generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.CREATE),
    name: '创建订单',
    description: '发起租赁订单',
    resource: PermissionResource.RENTAL_ORDER,
    action: PermissionAction.CREATE,
    group: '订单管理',
  },
  {
    code: generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.LIST),
    name: '查看订单列表',
    description: '查看租赁订单列表',
    resource: PermissionResource.RENTAL_ORDER,
    action: PermissionAction.LIST,
    group: '订单管理',
  },
  {
    code: generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.READ),
    name: '查看订单详情',
    description: '查看订单详细信息',
    resource: PermissionResource.RENTAL_ORDER,
    action: PermissionAction.READ,
    group: '订单管理',
  },
  {
    code: generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.ACCEPT),
    name: '接受订单',
    description: '出租方接受订单',
    resource: PermissionResource.RENTAL_ORDER,
    action: PermissionAction.ACCEPT,
    group: '订单管理',
  },
  {
    code: generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.REJECT),
    name: '拒绝订单',
    description: '出租方拒绝订单',
    resource: PermissionResource.RENTAL_ORDER,
    action: PermissionAction.REJECT,
    group: '订单管理',
  },
  {
    code: generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.CANCEL),
    name: '取消订单',
    description: '取消租赁订单',
    resource: PermissionResource.RENTAL_ORDER,
    action: PermissionAction.CANCEL,
    group: '订单管理',
  },
  {
    code: generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.COMPLETE),
    name: '完成订单',
    description: '确认订单完成',
    resource: PermissionResource.RENTAL_ORDER,
    action: PermissionAction.COMPLETE,
    group: '订单管理',
  },
  {
    code: generatePermissionCode(PermissionResource.RENTAL_ORDER, PermissionAction.MANAGE),
    name: '管理所有订单',
    description: '管理所有租赁订单（平台权限）',
    resource: PermissionResource.RENTAL_ORDER,
    action: PermissionAction.MANAGE,
    group: '订单管理',
  },

  // ========== 支付权限 ==========
  {
    code: generatePermissionCode(PermissionResource.PAYMENT, PermissionAction.PAY),
    name: '发起支付',
    description: '发起支付',
    resource: PermissionResource.PAYMENT,
    action: PermissionAction.PAY,
    group: '支付管理',
  },
  {
    code: generatePermissionCode(PermissionResource.PAYMENT, PermissionAction.LIST),
    name: '查看支付记录',
    description: '查看支付记录列表',
    resource: PermissionResource.PAYMENT,
    action: PermissionAction.LIST,
    group: '支付管理',
  },
  {
    code: generatePermissionCode(PermissionResource.REFUND, PermissionAction.CREATE),
    name: '发起退款',
    description: '发起退款申请',
    resource: PermissionResource.REFUND,
    action: PermissionAction.CREATE,
    group: '支付管理',
  },
  {
    code: generatePermissionCode(PermissionResource.REFUND, PermissionAction.AUDIT),
    name: '审核退款',
    description: '审核退款申请',
    resource: PermissionResource.REFUND,
    action: PermissionAction.AUDIT,
    group: '支付管理',
  },
  {
    code: generatePermissionCode(PermissionResource.SETTLEMENT, PermissionAction.MANAGE),
    name: '管理结算',
    description: '管理资金结算',
    resource: PermissionResource.SETTLEMENT,
    action: PermissionAction.MANAGE,
    group: '支付管理',
  },

  // ========== 争议权限 ==========
  {
    code: generatePermissionCode(PermissionResource.DISPUTE, PermissionAction.CREATE),
    name: '发起争议',
    description: '发起争议工单',
    resource: PermissionResource.DISPUTE,
    action: PermissionAction.DISPUTE,
    group: '争议管理',
  },
  {
    code: generatePermissionCode(PermissionResource.DISPUTE, PermissionAction.LIST),
    name: '查看争议列表',
    description: '查看争议工单列表',
    resource: PermissionResource.DISPUTE,
    action: PermissionAction.LIST,
    group: '争议管理',
  },
  {
    code: generatePermissionCode(PermissionResource.DISPUTE, PermissionAction.ARBITRATE),
    name: '仲裁争议',
    description: '处理和仲裁争议',
    resource: PermissionResource.DISPUTE,
    action: PermissionAction.ARBITRATE,
    group: '争议管理',
  },

  // ========== 角色权限管理 ==========
  {
    code: generatePermissionCode(PermissionResource.ROLE, PermissionAction.MANAGE),
    name: '管理角色',
    description: '管理系统角色（增删改查）',
    resource: PermissionResource.ROLE,
    action: PermissionAction.MANAGE,
    group: '系统管理',
  },
  {
    code: generatePermissionCode(PermissionResource.PERMISSION, PermissionAction.LIST),
    name: '查看权限列表',
    description: '查看系统权限列表',
    resource: PermissionResource.PERMISSION,
    action: PermissionAction.LIST,
    group: '系统管理',
  },

  // ========== 系统配置权限 ==========
  {
    code: generatePermissionCode(PermissionResource.SYSTEM_CONFIG, PermissionAction.MANAGE),
    name: '管理系统配置',
    description: '管理系统配置项',
    resource: PermissionResource.SYSTEM_CONFIG,
    action: PermissionAction.MANAGE,
    group: '系统管理',
  },
  {
    code: generatePermissionCode(PermissionResource.AUDIT_LOG, PermissionAction.LIST),
    name: '查看操作日志',
    description: '查看系统操作日志',
    resource: PermissionResource.AUDIT_LOG,
    action: PermissionAction.LIST,
    group: '系统管理',
  },

  // ========== 超级权限 ==========
  {
    code: generatePermissionCode(PermissionResource.ALL, PermissionAction.MANAGE),
    name: '超级管理权限',
    description: '拥有系统所有权限',
    resource: PermissionResource.ALL,
    action: PermissionAction.MANAGE,
    group: '超级权限',
  },
];

/**
 * 权限代码映射（便于快速查找）
 */
export const PERMISSION_CODES = SYSTEM_PERMISSIONS.reduce(
  (acc, permission) => {
    acc[permission.code] = permission;
    return acc;
  },
  {} as Record<string, PermissionDefinition>,
);
