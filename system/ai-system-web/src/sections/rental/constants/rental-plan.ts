// export type RentalType = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type RentalType = MyApi.OutputAssetRentalPlanDto['rentalType'];
export type OverdueFeeUnit = 'hour' | 'day';

export const OVERDUEFEE_UNIT_DICT: Record<OverdueFeeUnit, string> = {
  hour: '小时',
  day: '天',
};
export const OVERDUEFEE_UNIT_OPTIONS = Object.entries(OVERDUEFEE_UNIT_DICT).map(
  ([value, label]) => ({
    value,
    label,
  })
);

export const RENTAL_TYPE_LABELS: Record<RentalType, string> = {
  hourly: '小时租',
  daily: '日租',
  weekly: '周租',
  monthly: '月租',
  quarterly: '季租',
  yearly: '年租',
  buy: '',
};
export const RENTAL_TYPE_OPTIONS: { value: RentalType; label: string }[] = Object.entries(
  RENTAL_TYPE_LABELS
).map(([value, label]) => ({
  value: value as RentalType,
  label,
}));

export const RENTAL_TYPE_DICT_LABEL: Record<RentalType, string> = {
  hourly: '每小时',
  daily: '每天',
  weekly: '每周',
  monthly: '每月',
  quarterly: '每季度',
  yearly: '每年',
  buy: '',
};

export const RENTAL_TYPE_UNIT_LABELS: Record<RentalType, string> = {
  hourly: '小时',
  daily: '天',
  weekly: '周',
  monthly: '月',
  quarterly: '季度',
  yearly: '年',
  buy: '',
};

export const RENTAL_TYPE_UNIT_LABELS2: Record<RentalType, string> = {
  hourly: '小时',
  daily: '天',
  weekly: '周',
  monthly: '个月',
  quarterly: '个季度',
  yearly: '年',
  buy: '',
};

export const RENTAL_TYPE_DAYS_DICT: Record<any, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

// ================================================

export const DELIVERY_METHOD_DICT: Record<string, string> = {
  'same-city-delivery': '同城配送',
  'self-pickup': '上门自提',
  'express-delivery': '快递配送',
  'mail-delivery': '邮寄配送',
  'cash-on-delivery': '到付',
  other: '其他',
} as const;

export const DELIVERY_METHOD_OPTIONS = Object.entries(DELIVERY_METHOD_DICT).map(
  ([value, label]) => ({
    value,
    label,
  })
);
