import * as z from 'zod';

import { CONFIG } from 'src/global-config';

import { WithdrawChannelEnum } from '../enum/withdraw-channel-enum';

const MIN_WITHDRAW_AMOUNT = CONFIG.withdraw.minAmount;

export const WITHDRAW_CHANNELS = [
  { value: 'wechat', label: '微信' },
  { value: 'alipay', label: '支付宝' },
  { value: 'bank', label: '银行卡' },
] as const;

export type WithdrawChannel = (typeof WITHDRAW_CHANNELS)[number]['value'];

export const ApplyWithdrawSchema = z
  .object({
    amount: z
      .union([z.number(), z.string()])
      .transform((val) => (typeof val === 'string' ? Number.parseFloat(val) || 0 : val))
      .pipe(
        z.number().min(MIN_WITHDRAW_AMOUNT, { message: `提现金额不能低于 ¥${MIN_WITHDRAW_AMOUNT}` })
      ),
    withdrawChannel: z.enum(WithdrawChannelEnum, { error: '请选择提现方式' }),
    targetAccount: z.string().max(100),
    bankBranchAddress: z.string().max(200).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.withdrawChannel === 'bank' && !data.targetAccount?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: '请输入银行卡号',
        path: ['targetAccount'],
      });
    }
    if (data.withdrawChannel === 'bank' && !data.bankBranchAddress?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: '请填写开户行地址（如：中国工商银行深圳科技园支行）',
        path: ['bankBranchAddress'],
      });
    }
  });

export type ApplyWithdrawSchemaType = z.infer<typeof ApplyWithdrawSchema>;
