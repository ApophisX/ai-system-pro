import { RentalType } from '../enums';

export const RentalPlanPeriodDaysMap: Record<RentalType, number> = {
  [RentalType.BUY]: 1,
  [RentalType.HOURLY]: 1,
  [RentalType.DAILY]: 1,
  [RentalType.WEEKLY]: 7,
  [RentalType.MONTHLY]: 30,
  [RentalType.QUARTERLY]: 90,
  [RentalType.YEARLY]: 365,
};

export const RentalPlanPeriodUnitMap = {
  [RentalType.HOURLY]: 'hour',
  [RentalType.DAILY]: 'day',
  [RentalType.WEEKLY]: 'week',
  [RentalType.MONTHLY]: 'month',
  [RentalType.QUARTERLY]: 'quarter',
  [RentalType.YEARLY]: 'year',
};

export const RentalPlanPeriodUnitLabelMap = {
  [RentalType.HOURLY]: '小时',
  [RentalType.DAILY]: '天',
  [RentalType.WEEKLY]: '周',
  [RentalType.MONTHLY]: '个月',
  [RentalType.QUARTERLY]: '个季度',
  [RentalType.YEARLY]: '年',
};
