import type { Resolver } from 'react-hook-form';

import { m } from 'framer-motion';
import { debounce } from 'es-toolkit';
import { useForm } from 'react-hook-form';
import { Image, RefreshCw } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { Box, Card, Chip, Stack, Alert, alpha, Button, Typography } from '@mui/material';

import { formatCode } from 'src/utils/format-text';
import { combineImageUrls } from 'src/utils/upload';

import API from 'src/services/API';
import { ossUploader } from 'src/lib/oss-uploader';
import { useGetAssetInventory } from 'src/actions/assets';

import { toast } from 'src/components/snackbar';
import { FadeInPaper } from 'src/components/custom';
import { Form, Field } from 'src/components/hook-form';
import { Image as MuiImage } from 'src/components/image';
import { varFade } from 'src/components/animate/variants/fade';

import { OrderLesseeInfoSection } from 'src/sections/order/components';

import {
  RebindAssetFormSchema,
  type RebindAssetFormSchemaType,
} from './schema/rebind-asset-form-schema';

// ----------------------------------------------------------------------

type Props = {
  order: MyApi.OutputRentalOrderDto;
  onSuccess?: () => void;
};

export function RebindAssetFormContent({ order, onSuccess }: Props) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceSearch, setInstanceSearch] = useState('');
  const isComposingRef = useRef(false);

  const currentInventoryId = order.inventoryId ?? '';

  const { data: instances, dataLoading: instancesLoading } = useGetAssetInventory({
    assetId: order.assetId,
    status: 'available',
    keyword: instanceSearch,
    pageSize: 10,
  });

  // 排除当前已绑定的实例，换绑不能选同一个
  const availableInstances = useMemo(
    () => instances.filter((e) => e.id !== currentInventoryId),
    [instances, currentInventoryId]
  );

  const methods = useForm<RebindAssetFormSchemaType>({
    resolver: zodResolver(RebindAssetFormSchema) as Resolver<RebindAssetFormSchemaType>,
    defaultValues: {
      inventoryId: '',
      reason: '',
      evidenceUrls: [],
      description: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    getValues,
  } = methods;

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setInstanceSearch(value);
      }, 1000),
    []
  );

  const handleInputChange = useCallback(
    (event: React.SyntheticEvent, value: string, reason: string) => {
      if (isComposingRef.current) return;
      if (reason === 'input') {
        debouncedSearch(value);
      } else if (reason === 'clear') {
        setInstanceSearch('');
        debouncedSearch.cancel();
      }
    },
    [debouncedSearch]
  );

  useEffect(
    () => () => {
      debouncedSearch.cancel();
    },
    [debouncedSearch]
  );

  const handleRemoveFile = useCallback(
    (inputFile: File | string) => {
      const files = getValues('evidenceUrls') || [];
      setValue(
        'evidenceUrls',
        files.filter((f) => f !== inputFile),
        { shouldValidate: true }
      );
    },
    [getValues, setValue]
  );

  const onSubmit = handleSubmit(
    async (data) => {
      try {
        setErrorMessage(null);

        let evidenceUrls: string[] = [];
        const rawFiles = data.evidenceUrls ?? [];
        if (rawFiles.length > 0) {
          const newFiles = rawFiles.filter((f): f is File => f instanceof File) as File[];
          const existing = rawFiles.filter((f): f is string => typeof f === 'string') as string[];

          const uploadResults = await ossUploader.uploadFiles(newFiles, {
            uploadPath: '/xuwu/order-rebind-asset',
          });
          const { imagePaths, imageUrls } = combineImageUrls(existing, uploadResults);
          setValue('evidenceUrls', imageUrls);
          evidenceUrls = imagePaths;
        }

        if (!data.inventoryId) {
          toast.error('请选择要换绑的资产实例', { id: 'rebind-asset-form-error' });
          return;
        }

        if (data.inventoryId === currentInventoryId) {
          toast.error('请选择与当前不同的资产实例', { id: 'rebind-asset-form-error' });
          return;
        }

        const body: MyApi.RebindAssetInventoryDto = {
          inventoryId: data.inventoryId,
          ...(data.reason?.trim() && { reason: data.reason.trim() }),
          ...(data.description?.trim() && { description: data.description.trim() }),
          ...(evidenceUrls.length > 0 && { evidenceUrls }),
        };

        await API.AppRentalOrderLessor.AppRentalOrderLessorControllerRebindAssetInventoryV1(
          { id: order.id },
          body
        );

        onSuccess?.();
      } catch (e) {
        console.error(e);
        setErrorMessage('换绑失败，请稍后重试');
      }
    },
    (error) => {
      toast.error('请检查表单后重试', { id: 'rebind-asset-form-error' });
      setErrorMessage('请检查表单后重试');
    }
  );

  const currentInventory = order.inventory;

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={2.5} sx={{ pb: 14 }}>
        {/* 订单信息摘要 */}
        <Card
          component={m.div}
          variants={varFade('in')}
          initial="initial"
          animate="animate"
          sx={{
            p: 2.5,
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
            background: (theme) =>
              `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.dark, 0.04)} 100%)`,
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
              }}
            >
              <RefreshCw size={20} style={{ color: 'var(--mui-palette-primary-main)' }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" color="text.secondary">
                订单号
              </Typography>
              <Typography variant="subtitle1" fontWeight={700} noWrap>
                {order.orderNo}
              </Typography>
            </Box>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
          >
            <Stack>
              <Typography variant="subtitle2" fontWeight={700}>
                {order.assetSnapshot?.name ?? '资产'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {order.rentalPlanSnapshot.name}
              </Typography>
            </Stack>
            <Chip
              label={`¥${order.rentalAmount?.toLocaleString() ?? 0}`}
              size="small"
              color="primary"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Card>

        {/* 当前绑定的资产实例 */}
        {currentInventory && (
          <Card
            component={m.div}
            variants={varFade('in')}
            initial="initial"
            animate="animate"
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.4)}`,
              background: (theme) => alpha(theme.palette.warning.main, 0.04),
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              当前绑定的资产实例
            </Typography>
            <Stack direction="row" alignItems="center" spacing={2}>
              {currentInventory.images?.[0] ? (
                <MuiImage
                  alt=""
                  src={currentInventory.images[0]}
                  sx={{ width: 64, height: 64, borderRadius: 1.5 }}
                />
              ) : (
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 1.5,
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image size={32} style={{ color: 'var(--mui-palette-grey-500)' }} />
                </Box>
              )}
              <Stack sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {currentInventory.instanceName ?? '未命名'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentInventory.instanceCode}
                </Typography>
              </Stack>
            </Stack>
          </Card>
        )}

        {/* 租客信息 */}
        <Card
          component={m.div}
          variants={varFade('in')}
          initial="initial"
          animate="animate"
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <OrderLesseeInfoSection order={order} />
        </Card>

        {/* 选择新资产实例 */}
        <Card
          component={m.div}
          variants={varFade('in')}
          initial="initial"
          animate="animate"
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            选择新的资产实例
          </Typography>

          <Field.Autocomplete
            name="inventoryId"
            options={availableInstances.map((e) => e.id)}
            noOptionsText={
              instanceSearch.trim() || !availableInstances.length ? '未找到可用实例' : '搜索中...'
            }
            loadingText="搜索中..."
            loading={instancesLoading}
            getOptionLabel={(opt: string) => {
              const instance = availableInstances.find((e) => e.id === opt);
              if (!instance) return '';
              return `${instance.instanceName ?? '未命名'} · ${formatCode(instance.instanceCode)}`;
            }}
            placeholder="输入资产编码或名称搜索"
            isOptionEqualToValue={(a, b) => a === b}
            renderOption={(props, opt) => {
              const instance = availableInstances.find((e) => e.id === opt)!;
              return (
                <Box component="li" {...props} key={instance.id}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                    {instance.images?.[0] ? (
                      <MuiImage
                        alt=""
                        src={instance.images[0]}
                        sx={{ width: 48, height: 48, borderRadius: 1.5 }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1.5,
                          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Image size={24} style={{ color: 'var(--mui-palette-grey-500)' }} />
                      </Box>
                    )}
                    <Stack sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap>
                        {formatCode(instance.instanceCode, 8)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {instance.instanceName ?? '—'}
                      </Typography>
                    </Stack>
                    <Chip label="可用" size="small" color="success" variant="soft" />
                  </Stack>
                </Box>
              );
            }}
            onInputChange={handleInputChange}
            onCompositionStart={() => (isComposingRef.current = true)}
            onCompositionEnd={() => (isComposingRef.current = false)}
            helperText="请选择要换绑的资产实例，所选实例须为「可用」状态，且不能与当前实例相同"
          />
        </Card>

        {/* 换绑留痕图片 */}
        <Card
          component={m.div}
          variants={varFade('in')}
          initial="initial"
          animate="animate"
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            换绑凭证材料（可选）
          </Typography>
          <Field.Upload
            name="evidenceUrls"
            accept={{ 'image/*': [] }}
            multiple
            maxFiles={9}
            maxSize={10 * 1024 * 1024}
            helperText="可上传换绑凭证照片，用于记录与争议追溯，最多 9 张，单个最大 10MB。"
            miniMode
            onRemove={handleRemoveFile}
          />
        </Card>

        {/* 换绑原因/备注 */}
        <Card
          component={m.div}
          variants={varFade('in')}
          initial="initial"
          animate="animate"
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            换绑原因/备注（可选）
          </Typography>
          <Field.Text
            name="reason"
            placeholder="如：原实例损坏、更换为更优实例等"
            multiline
            minRows={3}
            maxRows={6}
            slotProps={{
              input: { inputProps: { maxLength: 500 } },
            }}
            helperText="填写换绑原因，便于后续追溯，最多500字"
          />
        </Card>

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
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          zIndex: 10,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          size="large"
          type="submit"
          color="primary"
          disabled={isSubmitting}
          loading={isSubmitting}
          loadingIndicator="换绑中..."
          sx={{
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          确认换绑
        </Button>
      </Box>
    </Form>
  );
}
