/**
 * 资产状态枚举
 *
 * 定义资产生命周期状态
 */
export enum AssetInventoryStatus {
  /**
   * 可出租
   */
  AVAILABLE = 'available',

  /**
   * 出租中
   */
  RENTED = 'rented',

  /**
   * 维护中
   */
  MAINTENANCE = 'maintenance',

  /**
   * 已出售
   */
  SOLD = 'sold',

  /**
   * 已报废
   */
  SCRAPPED = 'scraped',

  /**
   * 已损坏
   */
  DAMAGED = 'damaged',

  /**
   * 已丢失
   */
  LOST = 'lost',
}

export const AssetInventoryStatusValues = Object.values(AssetInventoryStatus);

export const AssetInventoryStatusLabelMap: Record<AssetInventoryStatus, string> = {
  [AssetInventoryStatus.AVAILABLE]: '可用',
  [AssetInventoryStatus.RENTED]: '已出租',
  [AssetInventoryStatus.MAINTENANCE]: '维护中',
  [AssetInventoryStatus.SOLD]: '已出售',
  [AssetInventoryStatus.SCRAPPED]: '已报废',
  [AssetInventoryStatus.DAMAGED]: '已损坏',
  [AssetInventoryStatus.LOST]: '已丢失',
};
