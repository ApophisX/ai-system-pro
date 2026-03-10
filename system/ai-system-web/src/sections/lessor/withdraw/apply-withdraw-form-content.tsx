import type { Resolver } from 'react-hook-form';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Card, Stack, alpha, Button, Typography, InputAdornment } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import API from 'src/services/API';
import { CONFIG } from 'src/global-config';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { WithdrawChannelEnum } from './enum/withdraw-channel-enum';
import {
  WITHDRAW_CHANNELS,
  ApplyWithdrawSchema,
  type ApplyWithdrawSchemaType,
} from './schema/apply-withdraw-schema';

// ----------------------------------------------------------------------

type Props = {
  availableBalance: number;
  onSuccess?: () => void;
};

export function ApplyWithdrawFormContent({ availableBalance, onSuccess }: Props) {
  const router = useRouter();

  const methods = useForm<ApplyWithdrawSchemaType>({
    resolver: zodResolver(ApplyWithdrawSchema) as Resolver<ApplyWithdrawSchemaType>,
    defaultValues: {
      amount: '' as unknown as number,
      withdrawChannel: WithdrawChannelEnum.WECHAT,
      targetAccount: '',
      bankBranchAddress: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = methods;

  const withdrawChannel = watch('withdrawChannel');

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (data.amount > availableBalance) {
        toast.error('提现金额不能超过可提现余额');
        return;
      }

      const idempotencyKey = crypto.randomUUID();

      const payload: MyApi.CreateWithdrawDto = {
        amount: data.amount,
        withdrawChannel: data.withdrawChannel,
        targetAccount: data.withdrawChannel === 'bank' ? (data.targetAccount?.trim() ?? '') : '',
        idempotencyKey,
      };

      if (data.withdrawChannel === 'bank') {
        payload.bankBranchAddress = data.bankBranchAddress?.trim() ?? '';
      }

      const res = await API.AppWithdraw.AppWithdrawControllerApplyV1(payload);

      if (res?.data?.data) {
        onSuccess?.();
        router.push(paths.lessor.withdraw.detail(res.data.data.id));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '提现申请失败，请稍后重试';
      toast.error(msg);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Card sx={{ p: 2, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08) }}>
          <Typography variant="caption" color="text.secondary">
            可提现余额
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 'bold' }}>
            ¥{availableBalance.toFixed(2)}
          </Typography>
        </Card>

        <Field.Text
          name="amount"
          label="提现金额（元）"
          type="number"
          slotProps={{
            htmlInput: {
              max: availableBalance,
            },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Typography color="text.secondary">¥</Typography>
                </InputAdornment>
              ),
            },
          }}
        />

        <Field.RadioGroup
          name="withdrawChannel"
          label="提现方式"
          options={WITHDRAW_CHANNELS.map((c) => ({ value: c.value, label: c.label }))}
          row
          helperText={
            withdrawChannel === WithdrawChannelEnum.WECHAT
              ? '资金将自动打款至您绑定的微信零钱账户'
              : withdrawChannel === WithdrawChannelEnum.ALIPAY
                ? '资金将自动打款至您绑定的支付宝账户'
                : undefined
          }
        />

        {withdrawChannel === 'bank' && (
          <>
            <Field.Text
              name="targetAccount"
              label="银行卡号"
              placeholder="请输入银行卡号"
              helperText="提现将打款至该账户，请仔细核对"
            />
            <Field.Text
              name="bankBranchAddress"
              label="开户行地址"
              placeholder="如：中国工商银行深圳科技园支行"
              helperText="请填写完整的开户行名称，以便资金准确到账"
            />
          </>
        )}

        <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            返回
          </Button>
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={isSubmitting || availableBalance < CONFIG.withdraw.minAmount}
          >
            {isSubmitting ? '提交中...' : '确认提现'}
          </Button>
        </Box>
      </Stack>
    </Form>
  );
}
