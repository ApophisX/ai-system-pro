/**
 * 资产实例状态枚举
 *
 * 与后端 AssetInventoryStatus 一致
 */
export enum AssetInventoryStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
  MAINTENANCE = 'maintenance',
  SOLD = 'sold',
  SCRAPED = 'scraped',
  DAMAGED = 'damaged',
  LOST = 'lost',
}

export const AssetInventoryStatusValues = Object.values(AssetInventoryStatus);

export const AssetInventoryStatusLabels: Record<AssetInventoryStatus, string> = {
  [AssetInventoryStatus.AVAILABLE]: '可用',
  [AssetInventoryStatus.RENTED]: '已占用',
  [AssetInventoryStatus.MAINTENANCE]: '维护中',
  [AssetInventoryStatus.SOLD]: '已出售',
  [AssetInventoryStatus.SCRAPED]: '已报废',
  [AssetInventoryStatus.DAMAGED]: '已损坏',
  [AssetInventoryStatus.LOST]: '已丢失',
};

export const AssetInventoryStatusColors: Record<
  AssetInventoryStatus,
  'success' | 'warning' | 'error' | 'default' | 'info'
> = {
  [AssetInventoryStatus.AVAILABLE]: 'success',
  [AssetInventoryStatus.RENTED]: 'warning',
  [AssetInventoryStatus.MAINTENANCE]: 'info',
  [AssetInventoryStatus.SOLD]: 'default',
  [AssetInventoryStatus.SCRAPED]: 'default',
  [AssetInventoryStatus.DAMAGED]: 'error',
  [AssetInventoryStatus.LOST]: 'error',
};
