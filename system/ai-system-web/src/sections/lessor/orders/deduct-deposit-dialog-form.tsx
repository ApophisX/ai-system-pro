import type { DialogProps } from '@toolpad/core/useDialogs';

import { z as zod } from 'zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { varAlpha } from 'minimal-shared/utils';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Stack, Alert, Typography } from '@mui/material';

import { combineImageUrls } from 'src/utils/upload';

import API from 'src/services/API';
import { ossUploader } from 'src/lib/oss-uploader';

import { Field } from 'src/components/hook-form';
import { Scrollbar } from 'src/components/scrollbar';
import { FormDialog, FormDialogContent } from 'src/components/custom/form-dialog';

// ----------------------------------------------------------------------

const createDeductDepositFormSchema = (depositAmount: number) =>
  zod
    .object({
      amount: zod
        .union([zod.string(), zod.number()])
        .transform((val) => {
          if (typeof val === 'string') {
            const num = parseFloat(val);
            return isNaN(num) ? 0 : num;
          }
          return val;
        })
        .pipe(zod.number().min(0.01, '扣款金额必须大于0').max(999999, '扣款金额不能超过999999元')),
      reason: zod.string().min(1, '扣款原因不能为空').max(100, '扣款原因不能超过100个字符'),
      description: zod.string().min(1, '扣款说明不能为空').max(500, '扣款说明不能超过500个字符'),
      evidenceUrls: zod
        .array(zod.union([zod.instanceof(File), zod.string()]))
        .min(1, '请至少上传一个凭证文件')
        .max(9, '最多只能上传9张凭证'),
    })
    .refine(
      (data) => {
        if (typeof data.amount === 'number' && data.amount > depositAmount) {
          return false;
        }
        return true;
      },
      {
        message: `扣款金额不能超过用户支付的押金金额 ¥${depositAmount}`,
        path: ['amount'],
      }
    );

export type DeductDepositFormSchemaType = zod.infer<
  ReturnType<typeof createDeductDepositFormSchema>
>;

type DialogPayload = {
  orderId: string;
  depositAmount: number;
  callback?: () => void;
};

export function DeductDepositDialogForm(props: DialogProps<DialogPayload, void>) {
  const { open, onClose, payload } = props;

  const { orderId, depositAmount, callback } = payload || {};

  const schema = createDeductDepositFormSchema(depositAmount || 0);

  const defaultValues: DeductDepositFormSchemaType = {
    amount: 0,
    reason: '',
    description: '',
    evidenceUrls: [],
  };

  const methods = useForm<DeductDepositFormSchemaType>({
    resolver: zodResolver(schema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, getValues, setValue } = methods;

  const handleRemoveFile = useCallback(
    (inputFile: File | string) => {
      const files = getValues('evidenceUrls') || [];
      const filtered = files.filter((file) => file !== inputFile);
      setValue('evidenceUrls', filtered);
    },
    [setValue, getValues]
  );

  const onSubmit = handleSubmit(async (data) => {
    try {
      // 验证扣款金额
      if (data.amount > depositAmount) {
        methods.setError('amount', {
          type: 'manual',
          message: `扣款金额不能超过用户支付的押金金额 ¥${depositAmount}`,
        });
        return;
      }

      // 上传凭证文件到 OSS
      let evidenceUrls: string[] = [];

      if (data.evidenceUrls && data.evidenceUrls.length > 0) {
        const newFiles = data.evidenceUrls.filter(
          (file: File | string) => file instanceof File
        ) as File[];
        const existingFiles = data.evidenceUrls.filter(
          (file: File | string) => typeof file === 'string'
        ) as string[];

        // 上传新文件
        const uploadResults = await ossUploader.uploadFiles(newFiles, {
          uploadPath: '/xuwu/order',
        });
        const combinedResult = combineImageUrls(existingFiles, uploadResults);
        setValue('evidenceUrls', combinedResult.imageUrls);
        evidenceUrls = [...combinedResult.imagePaths];
      }

      // 调用押金扣除申请 API
      await API.AppRentalOrderLessor.AppRentalOrderLessorControllerDeductDepositV1(
        { id: orderId! },
        {
          amount: data.amount,
          reason: data.reason,
          description: data.description,
          evidenceUrls,
        },
        { fetchOptions: { useApiMessage: true } }
      );

      reset();
      callback?.();
      onClose();
    } catch (error) {
      console.error('申请押金扣除失败:', error);
      // 失败后也要调用成功回调，避免页面状态不一致
      callback?.();
    }
  });

  const handleClose = useCallback(() => {
    reset();
    onClose?.();
  }, [reset, onClose]);

  return (
    <FormDialog
      open={open}
      methods={methods}
      onSubmit={onSubmit}
      scroll="paper"
      onClose={handleClose}
      dialogTitle="申请押金扣除"
      okButtonText="提交申请"
      okButtonProps={{
        color: 'primary',
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
            <Alert severity="warning">
              温馨提示：提交押金扣除申请后，须经用户确认，审核通过后扣除金额将转入您的账户。请确保填写的扣款原因及凭证真实、充分，且扣款金额不得超过用户实际支付的押金。
            </Alert>

            {/* 用户支付的押金金额提示 */}
            <Box
              sx={(theme) => ({
                p: 2,
                borderRadius: 1.5,
                bgcolor: varAlpha(theme.vars.palette.info.mainChannel, 0.08),
                border: `1px solid ${varAlpha(theme.vars.palette.info.mainChannel, 0.2)}`,
              })}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  用户支付的押金金额
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  ¥{depositAmount}
                </Typography>
              </Stack>
            </Box>

            <Field.Text
              name="amount"
              label="扣款金额（元）"
              placeholder="请手动输入扣款金额"
              type="number"
              helperText={`扣款金额不能超过用户支付的押金金额 ¥${depositAmount}`}
            />

            <Field.Text
              name="reason"
              label="扣款原因（必填）"
              placeholder="请说明扣款原因，如：商品损坏、逾期归还等"
              helperText="请简要说明扣款原因，最多100个字符"
              slotProps={{
                input: { inputProps: { maxLength: 100 } },
              }}
            />

            <Field.Text
              name="description"
              label="扣款说明（必填）"
              placeholder="请详细说明扣款情况"
              multiline
              minRows={3}
              maxRows={6}
              helperText="请详细说明扣款情况，包括具体原因、损失程度等，最多500个字符"
              slotProps={{
                input: { inputProps: { maxLength: 500 } },
              }}
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                上传凭证
              </Typography>
              <Field.Upload
                accept={{ 'image/*': [], 'video/*': [] }}
                helperText="支持上传图片和视频，至少1个文件，最多9个文件，单个文件最大10M"
                name="evidenceUrls"
                onRemove={handleRemoveFile}
                miniMode
                multiple
                maxFiles={9}
                maxSize={10 * 1024 * 1024}
              />
            </Box>
          </Stack>
        </FormDialogContent>
      </Scrollbar>
    </FormDialog>
  );
}
