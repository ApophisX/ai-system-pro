import Decimal from 'decimal.js';
/**
 * 计算逾期费用
 */

export function calculateOverdueAmount(minutes: number, fee: number | string, unit: 'day' | 'hour'): number {
  const overdueFee = new Decimal(Number(fee || 0));
  if (overdueFee.isZero()) {
    return 0;
  }
  if (unit === 'day') {
    const overdueDays = Math.ceil(minutes / (24 * 60));
    return overdueFee.mul(overdueDays).toNumber();
  } else if (unit === 'hour') {
    let hours = Math.floor(minutes / 60);
    const leftMinutes = minutes % 60;
    hours += leftMinutes > 0 && leftMinutes < 30 ? 0.5 : 1;
    return overdueFee.mul(hours).toNumber();
  }
  return 0;
}

export const calculateOverdueTime = (overdueMinutes: number, overdueFeeUnit: 'hour' | 'day'): number => {
  if (!overdueMinutes || overdueMinutes <= 0) return 0;

  if (overdueFeeUnit === 'hour') {
    // 小时数
    const hours = Math.floor(overdueMinutes / 60);
    const leftMinutes = overdueMinutes % 60;

    if (leftMinutes > 0 && leftMinutes < 30) {
      return hours + 0.5;
    }
    if (leftMinutes >= 30 && leftMinutes < 60) {
      return hours + 1;
    }
    return hours;
  }

  if (overdueFeeUnit === 'day') {
    // 天数
    const days = overdueMinutes / (60 * 24);
    // 不足1天，按1天计
    if (days <= 1) return 1;

    return Math.ceil(days);
  }

  // 默认情况，返回0
  return 0;
};
