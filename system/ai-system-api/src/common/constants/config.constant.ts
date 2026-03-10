import { RenewalPolicy } from '@/modules/rental-order/types/renewal.types';

export const DEFAULT_RENEWAL_POLICY: RenewalPolicy = {
  allowRenewal: true, // 允许续租
  maxRenewalTimes: 6, // 6次续租
  minDuration: 1, // 最小时长
  maxDuration: 9999, // 最大时长
  applyBeforeEndMinutes: 30 * 24 * 60, // 30 days 提前30天申请续租
};
