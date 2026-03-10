import type { Resolver } from 'react-hook-form';

import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import { Add, Save } from '@mui/icons-material';
import { Box, Stack, Paper, Alert, Button, MenuItem, Typography } from '@mui/material';

import { combineImageUrls } from 'src/utils/upload';

import API from 'src/services/API';
import { ossUploader } from 'src/lib/oss-uploader';
import { AssetInventoryStatus, AssetInventoryStatusLabels } from 'src/constants/asset-inventory';

import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';

import {
  InventoryInstanceFormSchema,
  type InventoryInstanceFormSchemaType,
} from './schema/inventory-instance-form-schema';

// ----------------------------------------------------------------------

const defaultValues: InventoryInstanceFormSchemaType = {
  isBatchCreate: false,
  quantity: 1,
  codePrefix: '',
  instanceCode: '',
  instanceName: '',
  status: AssetInventoryStatus.AVAILABLE,
  images: [],
};

type Props = {
  assetId: string;
  instance?: MyApi.OutputAssetInventoryDto;
  onSuccess?: () => void;
};

export function InventoryInstanceFormContent({ assetId, instance, onSuccess }: Props) {
  const { user } = useAuthContext();
  const isPartner = user?.isEnterpriseVerified || false;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isEdit = !!instance;

  const methods = useForm<InventoryInstanceFormSchemaType>({
    resolver: zodResolver(InventoryInstanceFormSchema) as Resolver<InventoryInstanceFormSchemaType>,
    defaultValues,
    values: instance
      ? {
          isBatchCreate: false,
          quantity: 1,
          codePrefix: '',
          instanceCode: instance.instanceCode ?? '',
          instanceName: instance.instanceName ?? '',
          status: instance.status as AssetInventoryStatus,
          images: (instance.images ?? []) as (File | string)[],
        }
      : undefined,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
    getValues,
    setValue,
  } = methods;

  const isBatchCreate = watch('isBatchCreate');
  const codePrefix = watch('codePrefix');
  const instanceCode = watch('instanceCode');

  const handleRemoveImage = useCallback(
    (item: File | string) => {
      const prev = getValues('images') ?? [];
      setValue(
        'images',
        prev.filter((x) => x !== item),
        { shouldValidate: true }
      );
    },
    [getValues, setValue]
  );

  const onSubmit = handleSubmit(
    async (data) => {
      try {
        setErrorMessage(null);

        const rawImages = data.images ?? [];
        const files = rawImages.filter((x): x is File => x instanceof File);
        const existing = rawImages.filter((x): x is string => typeof x === 'string');
        const uploadFiles = await ossUploader.uploadFiles(files, {
          uploadPath: '/xuwu/asset-inventory',
        });
        const { imagePaths, imageUrls } = combineImageUrls(existing, uploadFiles);
        setValue('images', imageUrls);
        const basePayload = {
          assetId,
          instanceName: data.instanceName?.trim() || undefined,
          status: data.status,
          attributes: {} as Record<string, any>,
          images: imagePaths.length > 0 ? imagePaths : undefined,
        };
        // 编辑
        if (isEdit) {
          await API.AppAssetInventory.AppAssetInventoryControllerUpdateV1(
            { id: instance.id },
            {
              instanceName: basePayload.instanceName,
              status: basePayload.status,
              images: basePayload.images,
            }
          );
        } else {
          // 创建
          const addPayload = {
            ...basePayload,
            quantity: data.quantity,
            codePrefix: data.codePrefix,
            instanceCode: data.instanceCode ?? '',
          };
          await API.AppAssetInventory.AppAssetInventoryControllerCreateV1(addPayload);
        }
        onSuccess?.();
      } catch (e) {
        console.error(e);
        setErrorMessage('操作失败，请稍后重试');
      }
    },
    () => setErrorMessage('请检查表单后重试')
  );

  if (!isPartner) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        暂不支持创建实例，请联系客服
      </Alert>
    );
  }

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={2.5} sx={{ pb: 14 }}>
        {!isEdit && (
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.vars.palette.divider}`,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight={700}>
                {isBatchCreate ? '批量创建' : '单个创建'}
              </Typography>
              <Field.Switch name="isBatchCreate" label="" />
            </Stack>
          </Paper>
        )}

        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.vars.palette.divider}`,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            基本信息
          </Typography>
          <Stack spacing={3}>
            {isBatchCreate && (
              <Field.Text
                name="quantity"
                label="批量创建数量"
                type="number"
                placeholder="如 5"
                slotProps={{
                  input: {
                    inputProps: { min: 1, max: 100, maxLength: 3, inputMode: 'numeric' },
                  },
                }}
              />
            )}
            <Field.Text
              name="codePrefix"
              label="编号前缀（选填）"
              placeholder="如 SN、BK，最多 8 个字符"
              slotProps={{
                input: { inputProps: { maxLength: 8 } },
              }}
              helperText={
                isBatchCreate
                  ? `实例编号将根据前缀 + 序号自动生成（${codePrefix ? `${codePrefix}00001、${codePrefix}00002…` : '如 SN00001、SN00002…'}）`
                  : undefined
              }
            />
            {!isEdit && !isBatchCreate && (
              <Field.Text
                name="instanceCode"
                label="实例编号（选填）"
                placeholder="该资产下唯一编号，如 00001、00002"
                disabled={!isEdit && isBatchCreate}
                slotProps={{
                  input: { inputProps: { maxLength: 24 } },
                }}
                helperText={
                  isBatchCreate
                    ? undefined
                    : instanceCode
                      ? `实例编号：${codePrefix || ''}${instanceCode}，该资产下唯一`
                      : `系统自动生成${codePrefix ? `以${codePrefix}开头的` : ''}编号，区分大小写`
                }
              />
            )}
            <Field.Text
              name="instanceName"
              label="实例名称（选填）"
              placeholder="如 设备A、仓库1号位"
              slotProps={{
                input: { inputProps: { maxLength: 200 } },
              }}
            />
            <Field.Select name="status" label="状态" placeholder="请选择状态">
              {(
                Object.keys(
                  AssetInventoryStatusLabels
                ) as (keyof typeof AssetInventoryStatusLabels)[]
              ).map((k) => (
                <MenuItem key={k} value={k}>
                  {AssetInventoryStatusLabels[k]}
                </MenuItem>
              ))}
            </Field.Select>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.vars.palette.divider}`,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            实例图片（选填）
          </Typography>
          <Field.Upload
            name="images"
            multiple
            maxFiles={9}
            maxSize={10 * 1024 * 1024}
            accept={{ 'image/*': [] }}
            helperText="最多上传 9 张图片，仅支持图片格式，单张最大 10M"
            miniMode
            onRemove={handleRemoveImage}
          />
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.vars.palette.divider}`,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            实例备注
          </Typography>
          <Field.Text
            name="remark"
            placeholder="如 设备A、仓库1号位"
            multiline
            rows={4}
            slotProps={{
              input: { inputProps: { maxLength: 200 } },
            }}
          />
        </Paper>

        {errorMessage && (
          <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}
      </Stack>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          p: 2,
          bgcolor: 'background.paper',
          borderTop: (theme) => `1px solid ${theme.vars.palette.divider}`,
          zIndex: 10,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          size="large"
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
          startIcon={isEdit ? <Save /> : <Add />}
          loadingIndicator="提交中..."
          sx={{
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          {isEdit ? '保存修改' : '创建实例'}
        </Button>
      </Box>
    </Form>
  );
}
