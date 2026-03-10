import type { DialogProps } from '@toolpad/core/useDialogs';

import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useEffect, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Stack, Alert, Typography, TextField } from '@mui/material';

import { fDateTime } from 'src/utils/format-time';
import { combineImageUrls } from 'src/utils/upload';

import API from 'src/services/API';
import { ossUploader } from 'src/lib/oss-uploader';

import { Field } from 'src/components/hook-form';
import { Scrollbar } from 'src/components/scrollbar';
import { FormDialog, FormDialogContent } from 'src/components/custom/form-dialog';

// ----------------------------------------------------------------------

const confirmReturnFormSchema = zod
  .object({
    action: zod.enum(['confirm', 'reject']),
    actualReturnedAt: zod
      .union([zod.string(), zod.date(), zod.any()])
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        const d = dayjs(val);
        return d.isValid() ? d.format() : val;
      }),
    evidenceUrls: zod
      .array(zod.union([zod.instanceof(File), zod.string()]))
      .max(9, '最多只能上传9个凭证')
      .optional()
      .default([]),
    description: zod.string().max(500, '说明不能超过500个字符').optional().default(''),
  })
  .refine(
    (data) =>
      data.action !== 'confirm' ||
      (data.actualReturnedAt && dayjs(data.actualReturnedAt).isValid()),
    { message: '请选择实际归还时间', path: ['actualReturnedAt'] }
  )
  .refine(
    (data) => data.action !== 'reject' || (data.description && data.description.trim().length > 0),
    { message: '请填写拒绝原因', path: ['description'] }
  );

export type ConfirmReturnFormSchemaType = zod.infer<typeof confirmReturnFormSchema>;

type DialogPayload = {
  orderId: string;
  /** 用户归还时间（租客提交的归还时间） */
  userReturnTime: string;
  callback?: () => void;
};

export function ConfirmReturnDialogForm(props: DialogProps<DialogPayload, void>) {
  const { open, onClose, payload } = props;

  const { orderId, userReturnTime, callback } = payload || {};

  const defaultActualTime =
    userReturnTime && dayjs(userReturnTime).isValid()
      ? dayjs(userReturnTime).format()
      : dayjs().format();

  const defaultValues: ConfirmReturnFormSchemaType = {
    action: 'confirm',
    actualReturnedAt: defaultActualTime,
    evidenceUrls: [],
    description: '',
  };

  const methods = useForm<ConfirmReturnFormSchemaType>({
    resolver: zodResolver(confirmReturnFormSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, getValues, setValue, watch, clearErrors } = methods;

  const actionValue = watch('action');
  const isConfirm = actionValue === 'confirm';

  useEffect(() => {
    if (open && userReturnTime) {
      const time = dayjs(userReturnTime).isValid()
        ? dayjs(userReturnTime).format()
        : dayjs().format();
      methods.reset({
        action: 'confirm',
        actualReturnedAt: time,
        evidenceUrls: [],
        description: '',
      });
    }
  }, [open, userReturnTime, methods]);

  useEffect(() => {
    clearErrors(['actualReturnedAt', 'description', 'evidenceUrls']);
  }, [actionValue, clearErrors]);

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
      methods.clearErrors();
      let evidenceUrls: string[] = [];

      if (data.action === 'reject' && !data.evidenceUrls?.length) {
        methods.setError('evidenceUrls', {
          message: '请上传凭证',
        });
        return;
      }

      if (data.evidenceUrls && data.evidenceUrls.length > 0) {
        const newFiles = data.evidenceUrls.filter(
          (file: File | string) => file instanceof File
        ) as File[];
        const existingFiles = data.evidenceUrls.filter(
          (file: File | string) => typeof file === 'string'
        ) as string[];

        const uploadResults = await ossUploader.uploadFiles(newFiles, {
          uploadPath: '/xuwu/order',
        });
        const combinedResult = combineImageUrls(existingFiles, uploadResults);
        evidenceUrls = combinedResult.imagePaths;
      }

      // 拒绝时使用用户归还时间，确认时使用表单填写的实际归还时间
      const actualReturnedAt =
        data.action === 'confirm' && data.actualReturnedAt
          ? typeof data.actualReturnedAt === 'string'
            ? data.actualReturnedAt
            : dayjs(data.actualReturnedAt).format()
          : userReturnTime && dayjs(userReturnTime).isValid()
            ? dayjs(userReturnTime).format()
            : dayjs().format();

      await API.AppRentalOrderLessor.AppRentalOrderLessorControllerConfirmReturnV1(
        { id: orderId! },
        {
          actualReturnedAt,
          confirmed: data.action === 'confirm',
          description: data.description?.trim() || undefined,
          evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined,
        },
        { fetchOptions: { useApiMessage: true } }
      );

      reset();
      callback?.();
      onClose();
    } catch (error) {
      console.error(isConfirm ? '确认归还失败:' : '拒绝归还失败:', error);
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
      dialogTitle="处理归还申请"
      okButtonText={isConfirm ? '确认归还' : '拒绝归还'}
      okButtonProps={{
        color: isConfirm ? 'primary' : 'error',
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
            <Alert severity="info">
              承租方已提交归还申请，请核实资产是否已实际归还。
              <br />
              若已验收归还，请选择「确认归还」；若承租方未实际归还（如恶意提交），请选择「拒绝归还」，
              <Typography component="span" color="error" variant="body2">
                拒绝后订单将进入争议状态，由平台协助处理。
              </Typography>
            </Alert>

            <Field.RadioGroup
              name="action"
              row
              label="处理方式"
              options={[
                { value: 'confirm', label: '确认归还' },
                { value: 'reject', label: '拒绝归还' },
              ]}
              slotProps={{
                formLabel: {
                  sx: { fontWeight: 600, mb: 0, color: 'inherit' },
                },
              }}
            />

            {/* 用户归还时间（只读展示） */}
            <Box>
              <TextField
                fullWidth
                label="用户归还时间"
                value={
                  userReturnTime && dayjs(userReturnTime).isValid()
                    ? fDateTime(userReturnTime)
                    : '—'
                }
                disabled
              />
              {/* <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                用户归还时间
              </Typography>
              <Box
                sx={(theme) => ({
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: varAlpha(theme.vars.palette.grey[500], 0.08),
                  border: `1px solid ${theme.vars.palette.divider}`,
                })}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {userReturnTime && dayjs(userReturnTime).isValid()
                    ? fDateTime(userReturnTime)
                    : '—'}
                </Typography>
              </Box> */}
            </Box>

            {isConfirm ? (
              <>
                {/* 实际归还时间（可修改） */}
                <Field.DateTimePicker
                  name="actualReturnedAt"
                  label="实际归还时间"
                  slotProps={{
                    textField: {
                      helperText:
                        '可修改为实际验收归还的时间，默认为用户归还时间，请与用户协商确定，避免计时偏差，引发纠纷。',
                    },
                  }}
                />

                {/* 归还凭证（可选） */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    归还凭证（可选）
                  </Typography>
                  <Field.Upload
                    accept={{ 'image/*': [], 'video/*': [] }}
                    helperText="支持上传图片和视频，最多9个文件，单个文件最大50M"
                    name="evidenceUrls"
                    onRemove={handleRemoveFile}
                    miniMode
                    multiple
                    maxFiles={9}
                    maxSize={50 * 1024 * 1024}
                  />
                </Box>

                {/* 归还说明（可选） */}
                <Field.Text
                  name="description"
                  label="归还说明（可选）"
                  placeholder="请填写归还时的说明，如验收情况等"
                  multiline
                  minRows={3}
                  maxRows={6}
                  helperText="最多500个字符"
                  slotProps={{
                    input: { inputProps: { maxLength: 500 } },
                  }}
                />
              </>
            ) : (
              <>
                {/* 拒绝原因（必填） */}
                <Field.Text
                  name="description"
                  label="拒绝原因（必填）"
                  placeholder="请说明拒绝归还的原因，如：承租方未实际归还资产、资产损坏未修复等"
                  multiline
                  minRows={3}
                  maxRows={6}
                  helperText="拒绝原因将作为争议处理依据，最多500个字符"
                  slotProps={{
                    input: { inputProps: { maxLength: 500 } },
                  }}
                />

                {/* 拒绝凭证（可选） */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    凭证（必填）
                  </Typography>
                  <Field.Upload
                    accept={{ 'image/*': [], 'video/*': [] }}
                    helperText="支持上传图片和视频作为拒绝依据，最多9个文件，单个文件最大50M"
                    name="evidenceUrls"
                    onRemove={handleRemoveFile}
                    miniMode
                    multiple
                    maxFiles={9}
                    maxSize={50 * 1024 * 1024}
                  />
                </Box>
              </>
            )}
          </Stack>
        </FormDialogContent>
      </Scrollbar>
    </FormDialog>
  );
}
