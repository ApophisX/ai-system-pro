/**
 * 资产状态枚举
 *
 * 定义资产生命周期状态
 */
export enum AssetStatus {
  /**
   * 草稿
   */
  DRAFT = 'draft',

  /**
   * 可出租
   */
  AVAILABLE = 'available',

  /**
   * 下架
   */
  OFFLINE = 'offline',
}

export const AssetStatusValues = Object.values(AssetStatus);

export const AssetStatusLabels: Record<AssetStatus, string> = {
  [AssetStatus.DRAFT]: '待发布',
  [AssetStatus.AVAILABLE]: '展示中',
  [AssetStatus.OFFLINE]: '已下架',
};

export const AssetStatusColors: Record<AssetStatus, string> = {
  [AssetStatus.DRAFT]: 'default',
  [AssetStatus.AVAILABLE]: 'success',
  [AssetStatus.OFFLINE]: 'error',
};

// =============================== Asset Audit Status ===============================

/**
 * 资产审核状态枚举
 *
 * 定义资产审核流程的状态
 */
export enum AssetAuditStatus {
  /**
   * 待审核
   */
  PENDING = 'pending',

  /**
   * 审核中
   */
  AUDITING = 'auditing',

  /**
   * 审核通过
   */
  APPROVED = 'approved',

  /**
   * 审核拒绝
   */
  REJECTED = 'rejected',
}

export const AssetAuditStatusValues = Object.values(AssetAuditStatus);

export const AssetAuditStatusLabels = {
  [AssetAuditStatus.PENDING]: '审核中',
  [AssetAuditStatus.AUDITING]: '审核中',
  [AssetAuditStatus.APPROVED]: '审核通过',
  [AssetAuditStatus.REJECTED]: '未通过',
};

export const AssetAuditStatusColors: Record<AssetAuditStatus, any> = {
  [AssetAuditStatus.PENDING]: 'info',
  [AssetAuditStatus.AUDITING]: 'info',
  [AssetAuditStatus.APPROVED]: 'success',
  [AssetAuditStatus.REJECTED]: 'error',
};
