import type { DialogProps } from '@toolpad/core/useDialogs';

import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Chip, Stack, Alert, Skeleton, Typography, AlertTitle } from '@mui/material';

import API from 'src/services/API';
import { fDate, fCurrency, fDateTime } from 'src/utils';

import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';
import { Scrollbar } from 'src/components/scrollbar';
import { FormDialog, FormDialogContent } from 'src/components/custom/form-dialog';

import {
  RENTAL_TYPE_UNIT_LABELS,
  RENTAL_TYPE_UNIT_LABELS2,
} from 'src/sections/rental/constants/rental-plan';

// ----------------------------------------------------------------------

type RenewFormValues = zod.infer<typeof RenewFormSchema>;

const RenewFormSchema = zod.object({
  duration: zod.coerce
    .number({ error: '请输入续租时长' })
    .int('续租时长必须为整数')
    .min(1, '续租时长最少为1'),
  userRemark: zod.string().max(200, { message: '备注不能超过200个字符' }).optional(),
});

type DialogPayload = {
  order: MyApi.OutputRentalOrderDto;
  onSuccess?: () => void;
};

// ----------------------------------------------------------------------

export function RenewOrderDialogForm(
  props: DialogProps<DialogPayload, MyApi.OutputRentalOrderDto | undefined>
) {
  const { open, onClose, payload } = props;
  const { order, onSuccess } = payload || {};

  const rentalPlan = order?.rentalPlanSnapshot;
  const rentalType = rentalPlan?.rentalType || 'daily';
  const unitLabel = RENTAL_TYPE_UNIT_LABELS[rentalType] || '天';
  const unitLabel2 = RENTAL_TYPE_UNIT_LABELS2[rentalType] || '天';
  const minDuration = rentalPlan?.minPeriod || 1;
  const maxDuration =
    rentalPlan?.maxPeriod && rentalPlan.maxPeriod > 0 ? rentalPlan.maxPeriod : 9999;

  const defaultValues: RenewFormValues = {
    duration: minDuration,
    userRemark: '',
  };

  const methods = useForm<RenewFormValues>({
    resolver: zodResolver(RenewFormSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control } = methods;

  // 监听 duration 变化，用于预计算
  const watchedDuration = useWatch({ control, name: 'duration' });

  // 续租预计算查询
  const {
    data: preview,
    isLoading: previewLoading,
    isError: previewError,
  } = useQuery({
    queryKey: ['renew-preview', order?.id, watchedDuration],
    queryFn: () =>
      API.RentalOrderRenew.RentalOrderRenewControllerRenewPreviewV1({
        orderId: order!.id,
        duration: watchedDuration,
      }),
    select: (res) => res.data.data,
    enabled: !!order?.id && !!watchedDuration && watchedDuration >= minDuration,
    staleTime: 10 * 1000,
    retry: 1,
  });

  // 当 minDuration 变化时重置
  useEffect(() => {
    if (open) {
      reset({ duration: minDuration, userRemark: '' });
    }
  }, [open, minDuration, reset]);

  const onSubmit = handleSubmit(async (data) => {
    if (!order?.id) return;
    try {
      const response = await API.RentalOrderRenew.RentalOrderRenewControllerRenewV1(
        { orderId: order.id },
        {
          duration: data.duration,
          userRemark: data.userRemark || undefined,
        },
        { fetchOptions: { useApiMessage: true } }
      );
      reset();
      onSuccess?.();
      await onClose(response.data.data);
    } catch (error) {
      console.error('续租申请失败:', error);
    }
  });

  const handleClose = useCallback(() => {
    reset();
    onClose(undefined);
  }, [reset, onClose]);

  const canSubmit = preview?.canRenew !== false && !previewLoading;

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      methods={methods}
      onSubmit={onSubmit}
      scroll="paper"
      dialogTitle="续租"
      okButtonText="确认续租"
      okButtonProps={{
        color: 'primary',
        disabled: !canSubmit,
      }}
      slotProps={{
        paper: {
          sx: {
            border: (theme) => `1px solid ${theme.vars.palette.divider}`,
          },
        },
      }}
    >
      <Scrollbar sx={{ maxHeight: '70vh' }}>
        <FormDialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* 当前订单信息 */}
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
              }}
            >
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    当前租赁方案
                  </Typography>
                  <Chip label={rentalPlan?.name || '-'} size="small" color="info" variant="soft" />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    单价
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {fCurrency(rentalPlan?.price)}/{unitLabel}
                  </Typography>
                </Stack>
                {order?.endDate && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      当前到期时间
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {fDateTime(order.endDate)}
                    </Typography>
                  </Stack>
                )}
                {order && order.renewalCount > 0 && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      已续租次数
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {order.renewalCount} 次
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>

            {/* 续租时长选择 */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                续租时长
              </Typography>
              <Field.Number
                name="duration"
                label="续租时长"
                min={minDuration}
                max={maxDuration}
                unit={unitLabel2}
                disabled={!canSubmit}
              />
              {minDuration > 1 && (
                <Typography
                  variant="caption"
                  sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}
                >
                  最短续租 {minDuration} {unitLabel2}
                </Typography>
              )}
            </Box>

            {/* 续租预计算结果 */}
            {watchedDuration >= minDuration && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <Iconify icon="solar:bill-list-bold-duotone" sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    费用明细
                  </Typography>
                </Stack>

                {previewLoading ? (
                  <Stack spacing={1}>
                    <Skeleton variant="text" width="100%" height={24} />
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="60%" height={24} />
                  </Stack>
                ) : previewError ? (
                  <Alert severity="error" variant="outlined" sx={{ py: 0.5 }}>
                    获取费用预估失败，请调整续租时长后重试
                  </Alert>
                ) : preview && !preview.canRenew ? (
                  <Alert severity="warning" variant="outlined" sx={{ py: 0.5 }}>
                    <AlertTitle sx={{ mb: 0 }}>暂时无法续租</AlertTitle>
                    {preview.message || '当前订单状态不支持续租，请联系客服'}
                  </Alert>
                ) : preview ? (
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        续租租金
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {fCurrency(preview.renewalAmount)}
                      </Typography>
                    </Stack>
                    {preview.platformFee > 0 && (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          平台服务费
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {fCurrency(preview.platformFee)}
                        </Typography>
                      </Stack>
                    )}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{
                        pt: 1,
                        borderTop: (theme) => `1px dashed ${theme.palette.divider}`,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        续租应付总额
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'error.main' }}>
                        {fCurrency(preview.totalAmount)}
                      </Typography>
                    </Stack>
                    {preview.newEndDate && (
                      <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          续租后到期时间
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, color: 'success.main' }}
                        >
                          {order.isInstallment
                            ? dayjs(preview.newEndDate).endOf('day').format('YYYY-MM-DD HH:mm:ss')
                            : fDateTime(preview.newEndDate)}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                ) : null}
              </Box>
            )}

            {/* 备注 */}
            <Field.Text
              name="userRemark"
              label="备注（选填）"
              placeholder="如有特殊需求请在此说明"
              multiline
              minRows={3}
              maxRows={6}
              helperText="最多200个字符"
              slotProps={{ input: { inputProps: { maxLength: 200 } } }}
            />
          </Stack>
        </FormDialogContent>
      </Scrollbar>
    </FormDialog>
  );
}
