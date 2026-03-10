/**
 * 首页相关类型定义
 */

export type RentalType = MyApi.OutputAssetRentalPlanDto['rentalType'];

export const RENTAL_TYPE_UNIT_LABELS: Record<RentalType, string> = {
  hourly: '小时',
  daily: '天',
  weekly: '周',
  monthly: '月',
  quarterly: '季度',
  yearly: '年',
  buy: '',
};

export interface CategoryItem {
  id: string;
  code: string;
  name?: string;
  icon?: string;
  sortOrder: number;
  displayOnHome: boolean;
}

export type AssetItem = MyApi.OutputAssetListItemDto;
