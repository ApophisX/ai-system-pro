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
  [AssetStatus.DRAFT]: '草稿',
  [AssetStatus.AVAILABLE]: '可出租',
  [AssetStatus.OFFLINE]: '下架',
};
