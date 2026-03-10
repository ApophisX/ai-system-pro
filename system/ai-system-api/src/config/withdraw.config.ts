/**
 * 提现配置
 *
 * 风控规则：单笔/单日限制
 */
import { registerAs } from '@nestjs/config';

export const WITHDRAW_CONFIG_KEY = 'withdraw';

export const withdrawConfig = registerAs(WITHDRAW_CONFIG_KEY, () => ({
  /** 单笔最低提现金额（元） */
  minAmountPerOrder: parseFloat(process.env.WITHDRAW_MIN_AMOUNT || '0.01'),
  /** 单笔最高提现金额（元） */
  maxAmountPerOrder: parseFloat(process.env.WITHDRAW_MAX_AMOUNT || '50000'),
  /** 单日累计提现限额（元） */
  maxAmountPerDay: parseFloat(process.env.WITHDRAW_MAX_AMOUNT_PER_DAY || '100000'),
  /** 单日提现次数限制 */
  maxCountPerDay: parseInt(process.env.WITHDRAW_MAX_COUNT_PER_DAY || '10', 10),
  /** 打款超时补偿扫描阈值（分钟） */
  processingTimeoutMinutes: parseInt(process.env.WITHDRAW_PROCESSING_TIMEOUT_MINUTES || '30', 10),
}));

export type WithdrawConfig = ReturnType<typeof withdrawConfig>;
