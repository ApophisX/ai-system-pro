import dayjs, { Dayjs } from 'dayjs';
import { RentalType } from '@/modules/asset/enums/rental-type.enum';
import { RentalPlanPeriodDaysMap } from '@/modules/asset/constant/rental-plan.constant';

/** 租赁周期时间单位：与 dayjs.add 一致 */
export type RentalPeriodUnit = 'hour' | 'day';

/** 订单租期计算结果（创建订单、确认收货共用） */
export interface RentalPeriodTimeResult {
  /** 租赁开始时间（dayjs，便于后续计算各期） */
  startDate: Dayjs;
  /** 租赁结束时间（dayjs） */
  endDate: Dayjs;
  /** 单期时长（duration * periodDays，用于 add 的数值） */
  periodDuration: number;
  /** 单期单位 hour | day */
  periodUnit: RentalPeriodUnit;
}

/** 某一期账单的时间计算结果 */
export interface PaymentPeriodTimeResult {
  startTime: Date;
  endTime: Date;
  payableTime: Date;
}

/**
 * 根据租赁类型与租期计算订单的租赁开始/结束时间及单期参数。
 * 供「创建订单」「确认收货」等流程共用，后续改规则只改此处。
 *
 * @param startAt 租赁开始时刻（创建时来自 dto，确认收货时为当前时间）
 * @param duration 租期数量（如 3 天、2 周）
 * @param rentalPeriod 分期期数（整租为 1）
 * @param rentalType 租赁类型（小时/日/周/月等）
 */
export function computeRentalPeriodTime(
  startAt: Date,
  duration: number,
  rentalPeriod: number,
  rentalType: RentalType,
): RentalPeriodTimeResult {
  const periodDays = RentalPlanPeriodDaysMap[rentalType] ?? 1;
  const periodDuration = duration * periodDays;
  const periodUnit: RentalPeriodUnit = rentalType === RentalType.HOURLY ? 'hour' : 'day';
  const startDate = dayjs(startAt);
  const endDate = startDate.add(periodDuration * rentalPeriod, periodUnit);
  return { startDate, endDate, periodDuration, periodUnit };
}

/**
 * 计算某一期账单的开始时间、结束时间、应付款时间。
 * 与 computeRentalPeriodTime 配套使用，保证创建订单与确认收货逻辑一致。
 *
 * @param periodIndex 期数（1-based）
 * @param startDate 租赁开始时间（dayjs）
 * @param periodDuration 单期时长
 * @param periodUnit 单期单位
 * @param endDate 订单租赁结束时间（用于整租后付费的 payableTime）
 * @param isPostPayment 是否后付费
 * @param isInstallment 是否分期
 */
export function computePaymentPeriodTime(
  periodIndex: number,
  startDate: Dayjs,
  periodDuration: number,
  periodUnit: RentalPeriodUnit,
  endDate: Dayjs,
  isPostPayment: boolean,
  isInstallment: boolean,
): PaymentPeriodTimeResult {
  const paymentStartTime = startDate.add(periodDuration * (periodIndex - 1), periodUnit);
  const paymentEndTime = startDate.add(periodDuration * periodIndex, periodUnit);

  /** 当天最后一刻 23:59:59.000，避免 endOf('day') 的 23:59:59.999 被 MySQL timestamp 四舍五入成次日 00:00:00 */
  const endOfDay = (d: Dayjs) => d.hour(23).minute(59).second(59).millisecond(0);

  let payableTime: Date;
  if (isPostPayment) {
    payableTime = isInstallment ? endOfDay(paymentEndTime).toDate() : endDate.toDate();
  } else {
    payableTime = isInstallment ? endOfDay(paymentStartTime).toDate() : paymentStartTime.toDate();
  }

  return {
    startTime: paymentStartTime.toDate(),
    endTime: paymentEndTime.toDate(),
    payableTime,
  };
}
