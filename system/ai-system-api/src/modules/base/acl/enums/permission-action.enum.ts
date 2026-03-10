/**
 * 权限动作枚举
 *
 * 定义系统中所有可执行的操作类型
 * 基于 CRUD + 业务特定操作
 */
export enum PermissionAction {
  // ========== 基础 CRUD 操作 ==========
  /** 创建 */
  CREATE = 'create',
  /** 读取 */
  READ = 'read',
  /** 更新 */
  UPDATE = 'update',
  /** 删除 */
  DELETE = 'delete',
  /** 列表查询 */
  LIST = 'list',

  // ========== 管理操作 ==========
  /** 管理（包含所有操作） */
  MANAGE = 'manage',
  /** 审核 */
  AUDIT = 'audit',
  /** 发布 */
  PUBLISH = 'publish',
  /** 下架 */
  UNPUBLISH = 'unpublish',

  // ========== 订单相关操作 ==========
  /** 接受订单 */
  ACCEPT = 'accept',
  /** 拒绝订单 */
  REJECT = 'reject',
  /** 取消 */
  CANCEL = 'cancel',
  /** 确认 */
  CONFIRM = 'confirm',
  /** 完成 */
  COMPLETE = 'complete',

  // ========== 支付相关操作 ==========
  /** 支付 */
  PAY = 'pay',
  /** 退款 */
  REFUND = 'refund',
  /** 结算 */
  SETTLE = 'settle',

  // ========== 用户相关操作 ==========
  /** 冻结 */
  FREEZE = 'freeze',
  /** 解冻 */
  UNFREEZE = 'unfreeze',
  /** 封禁 */
  BAN = 'ban',
  /** 解封 */
  UNBAN = 'unban',

  // ========== 争议相关操作 ==========
  /** 发起争议 */
  DISPUTE = 'dispute',
  /** 仲裁 */
  ARBITRATE = 'arbitrate',
}
