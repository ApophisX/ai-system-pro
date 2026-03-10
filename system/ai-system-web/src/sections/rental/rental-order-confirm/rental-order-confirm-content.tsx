import 'dayjs/locale/zh-cn';

import type { Slide } from 'yet-another-react-lightbox';
import type { PaperProps, ButtonProps } from '@mui/material';
import type { EmptyContactBoxProps } from 'src/sections/contact/contact-card';

import dayjs from 'dayjs';
import { z as zod } from 'zod';
import Decimal from 'decimal.js';
import { m } from 'framer-motion';
import { delay } from 'es-toolkit';
import { Truck, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDialogs } from '@toolpad/core/useDialogs';
import { useForm, Controller } from 'react-hook-form';
import { useMemo, useState, useEffect, useCallback } from 'react';

import {
  Box,
  Chip,
  Grid,
  Alert,
  Paper,
  Stack,
  Badge,
  Avatar,
  Button,
  Divider,
  Skeleton,
  Checkbox,
  RadioGroup,
  Typography,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import API from 'src/services/API';
import {
  AssetInventoryStatusLabels,
  AssetInventoryStatusColors,
} from 'src/constants/asset-inventory';

import { Image } from 'src/components/image';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CurrencyTypography } from 'src/components/custom';
import { WebDialog } from 'src/components/custom/web-dialog';
import { HorizontalStack } from 'src/components/custom/layout';
import { Lightbox, useLightbox } from 'src/components/lightbox';
import { HelperText } from 'src/components/hook-form/help-text';
import { Form, Field, schemaUtils } from 'src/components/hook-form';
import { AutographDialog } from 'src/components/custom/autograph-dialog';

import { ContactCard, EmptyContactBox, withSelectContact } from 'src/sections/contact/contact-card';

import { useAuthContext } from 'src/auth/hooks';

import { FeeDetailButton } from './components/fee-detail-button';
import { RentalPlanOption } from './components/rental-plan-option';
import { InstallmentPlanPreviewDialog } from '../rental-goods-publish';
import {
  OVERDUEFEE_UNIT_DICT,
  RENTAL_TYPE_UNIT_LABELS,
  RENTAL_TYPE_UNIT_LABELS2,
} from '../constants/rental-plan';

dayjs.locale('zh-cn');

// ----------------------------------------------------------------------

export type RentalOrderFormSchemaType = zod.infer<ReturnType<typeof rentalOrderFormSchema>>;

export const rentalOrderFormSchema = (isMallProduct: boolean) =>
  zod
    .object({
      rentalPlanId: zod.coerce.number<number>().min(1, { message: '请选择租赁方案' }),
      duration: zod.union([zod.number().optional(), zod.string().optional()]),
      contactId: zod.string().optional(),
      contactName: zod.string().min(1, { message: '请输入联系人姓名' }),
      contactPhone: schemaUtils.phoneNumber(),
      needDelivery: zod.boolean().default(false),
      userRemark: zod.string().optional(),
      startAt: schemaUtils.date(),
    })
    .refine((data) => data.duration && Number(data.duration) > 0, {
      message: isMallProduct ? '购买数量不能为空' : '租赁时长不能为空',
      path: ['duration'],
    })
    .refine((data) => (data.needDelivery ? data.contactId : true), {
      message: '请选择联系地址',
      path: ['contactId'],
    });

// ----------------------------------------------------------------------

interface RentalOrderConfirmContentProps {
  assetDetail: MyApi.OutputAssetDetailDto;
  onSuccess?: (orderId: string) => void;
}

export function RentalOrderConfirmContent({ assetDetail }: RentalOrderConfirmContentProps) {
  const searchParams = useSearchParams();
  const inventoryCode = searchParams.get('inventoryCode');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [contact, setContact] = useState<MyApi.OutputContactDto | null>(null);
  const { value: isAgreed, onToggle: toggleIsAgreed, setValue: setIsAgreed } = useBoolean(false);

  const [termsAgreed, setTermsAgreed] = useState<[boolean, boolean]>([false, false]);

  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventoryCode', inventoryCode, assetDetail.id],
    queryFn: () =>
      API.AppAssetInventory.AppAssetInventoryControllerGetByInstanceCodeV1({
        inventoryCode: inventoryCode || '',
        assetId: assetDetail.id,
      }),
    enabled: !!inventoryCode,
    select: (res) => res.data.data,
  });

  const { data: defaultContact } = useQuery({
    queryKey: ['defaultContact'],
    queryFn: () => API.AppContact.AppContactControllerGetDefaultContactV1(),
    select: (res) => res.data.data,
  });

  const router = useRouter();

  const { user } = useAuthContext();

  // 是否是合作商，目前只有合作商可以下单支付
  const isPartner = assetDetail.owner?.isEnterpriseVerified || false;

  // 表单默认值
  const defaultValues: RentalOrderFormSchemaType = {
    rentalPlanId: assetDetail.rentalPlans[0].id,
    contactId: '',
    contactName: '',
    contactPhone: '',
    needDelivery: false,
    duration: 1,
    startAt: dayjs().add(3, 'hour').format('YYYY-MM-DD HH:mm:00'),
  };

  const methods = useForm({
    resolver: zodResolver(rentalOrderFormSchema(assetDetail.isMallProduct || false)),
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    control,
    setValue,
    getValues,
    formState: { isSubmitting, errors },
  } = methods;

  const dialogs = useDialogs();

  const watchedDuration = watch('duration') || 1;
  const watchedRentalPlanId = watch('rentalPlanId');
  const watchedNeedDelivery = watch('needDelivery');
  const duration = Number(watchedDuration);

  // 获取选中的租赁方案
  const selectedRentalPlan = useMemo(
    () => assetDetail.rentalPlans.find((plan) => plan.id === Number(watchedRentalPlanId)),
    [assetDetail.rentalPlans, watchedRentalPlanId]
  );

  // 计算每期租金（基于选中的租赁方案）
  const rentalAmount = useMemo(() => {
    if (!selectedRentalPlan || !watchedDuration) return new Decimal(0);
    const priceInYuan = new Decimal(selectedRentalPlan.price);
    if (selectedRentalPlan.isInstallment) {
      return priceInYuan;
    }
    const result = priceInYuan.times(watchedDuration);
    return result;
  }, [selectedRentalPlan, watchedDuration]);

  // 总租金金额
  const totalRentalAmount = useMemo(() => {
    if (selectedRentalPlan?.isInstallment) {
      return rentalAmount.times(selectedRentalPlan.rentalPeriod);
    }
    return rentalAmount;
  }, [rentalAmount, selectedRentalPlan?.isInstallment, selectedRentalPlan?.rentalPeriod]);

  // 配送费和押金
  const otherTotalAmount = useMemo(() => {
    let _deposit = new Decimal(assetDetail.deposit);
    if (watchedNeedDelivery) {
      _deposit = _deposit.plus(assetDetail.deliveryFee);
    }
    return _deposit;
  }, [assetDetail.deliveryFee, assetDetail.deposit, watchedNeedDelivery]);

  // 订单总金额、包含押金、配送费、平台服务费
  const totalAmount = useMemo(() => {
    if (selectedRentalPlan) {
      return rentalAmount.mul(selectedRentalPlan.rentalPeriod).plus(otherTotalAmount);
    }
    return new Decimal(0);
  }, [otherTotalAmount, rentalAmount, selectedRentalPlan]);

  // 分期首期金额金额
  const installmentTotalAmount = useMemo(() => {
    if (selectedRentalPlan) {
      return rentalAmount.plus(otherTotalAmount);
    }
    return new Decimal(0);
  }, [otherTotalAmount, rentalAmount, selectedRentalPlan]);

  // 租赁方式单位标签
  const rentalTypeUnitLabel = selectedRentalPlan?.rentalType
    ? RENTAL_TYPE_UNIT_LABELS[selectedRentalPlan.rentalType]
    : '';

  // 租赁期数标签
  const rentalPeriodLabel = useMemo(() => {
    if (selectedRentalPlan?.isInstallment) {
      return `${selectedRentalPlan?.rentalPeriod}期`;
    }
    if (selectedRentalPlan) {
      return `${duration}${RENTAL_TYPE_UNIT_LABELS2[selectedRentalPlan.rentalType]}`;
    }
    return '';
  }, [duration, selectedRentalPlan]);

  // 增强按钮
  const EnhancedButton = useMemo(() => withSelectContact<ButtonProps>(Button), []);

  // 增强空联系地址框
  const EnhancedEmptyContactBox = useMemo(
    () => withSelectContact<EmptyContactBoxProps>(EmptyContactBox),
    []
  );

  // 最小租赁时长
  const minPeriod = useMemo(() => selectedRentalPlan?.minPeriod || 1, [selectedRentalPlan]);
  const maxPeriod = useMemo(() => selectedRentalPlan?.maxPeriod || 9999, [selectedRentalPlan]);

  // 租赁方案费用信息
  const planFeeInfo = useMemo(() => {
    if (!selectedRentalPlan) return undefined;
    const text: string[] = [];
    if (selectedRentalPlan?.penaltyFee > 0) {
      text.push(`违约金：¥${selectedRentalPlan?.penaltyFee}`);
    }
    if (selectedRentalPlan?.overdueFee > 0) {
      text.push(
        `逾期费用：¥${selectedRentalPlan?.overdueFee}/${OVERDUEFEE_UNIT_DICT[selectedRentalPlan?.overdueFeeUnit]}`
      );
    }
    return text.join('，');
  }, [selectedRentalPlan]);

  // 表单提交
  const onSubmit = handleSubmit(
    async (data) => {
      if (!isAgreed) {
        toast.error(
          assetDetail?.isMallProduct ? '请同意支付协议和用户协议' : '请同意租赁协议和用户协议',
          { id: 'rental-order-confirm-error' }
        );
        return;
      }

      if (!contact && data.needDelivery) {
        toast.error('请选择联系地址', { id: 'rental-order-confirm-error' });
        return;
      }
      try {
        setErrorMessage(null);
        const params: MyApi.CreateRentalOrderDto = {
          assetId: assetDetail.id,
          rentalPlanId: data.rentalPlanId,
          duration: Number(data.duration),
          needDelivery: data.needDelivery,
          contactId: data.contactId,
          contactPhone: data.contactPhone,
          contactName: data.contactName,
          userRemark: data.userRemark,
          startAt: data.startAt as string,
          inventoryCode: inventoryCode || undefined,
        };
        const result = await API.AppRentalOrderLessee.AppRentalOrderLesseeControllerCreateOrderV1(
          params,
          {
            fetchOptions: {
              useApiMessage: true,
            },
          }
        );
        // const urlSearchParams = new URLSearchParams();
        // urlSearchParams.set('jumpTo', `${paths.my.orderDetail(result.data.data.id)}?payNow=true`);
        // router.replace(`${paths.my.root}?${urlSearchParams.toString()}`);
        router.replace(`${paths.my.orderDetail(result.data.data.id)}?payNow=true`);
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : '创建订单失败，请稍后重试', {
          id: 'rental-order-confirm-error',
        });
      }
    },
    (err) => {
      // console.log(err.contactId?.message);
      const message = Object.values(err)
        .map((error) => error.message)
        .join('\n');
      toast.error(message, { id: 'rental-order-confirm-error' });
    }
  );

  // 打开分期计划预览框
  const openInstallPlanPreviewDialog = useCallback(() => {
    if (!selectedRentalPlan) return;
    const startAt = (getValues('startAt') as string) || dayjs().format('YYYY-MM-DD HH:mm:00');
    dialogs.open(InstallmentPlanPreviewDialog, {
      plan: { ...selectedRentalPlan },
      startDate: dayjs(startAt).toDate(),
    });
  }, [selectedRentalPlan, getValues, dialogs]);

  // 设置最小租赁时长
  useEffect(() => {
    if (selectedRentalPlan) {
      setValue('duration', selectedRentalPlan.minPeriod);
    }
  }, [selectedRentalPlan, setValue]);

  // 设置联系人信息
  useEffect(() => {
    if (contact || user) {
      setValue('contactId', contact?.id);
      setValue('contactName', contact?.contactName || user?.profile?.realName || '');
      setValue('contactPhone', contact?.contactPhone || user?.phone || '');
    }
  }, [contact, setValue, user]);

  // 获取默认联系人
  useEffect(() => {
    if (defaultContact) {
      setContact(defaultContact);
    }
  }, [defaultContact, setValue]);

  useEffect(() => {
    if (termsAgreed[0] && termsAgreed[1]) {
      setIsAgreed(true);
    } else {
      setIsAgreed(false);
    }
  }, [termsAgreed, setIsAgreed]);

  // 封面图片
  const coverImage = assetDetail.coverImage || assetDetail.images?.[0] || '';

  if (!isPartner) {
    return (
      <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
        暂不支持下单支付，请联系客服
      </Alert>
    );
  }

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      {/* 商品信息卡片 */}
      <AnimatedPaper>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
          商品信息
        </Typography>
        <Stack direction="row" spacing={2}>
          <Image
            src={coverImage}
            alt={assetDetail.name}
            sx={{
              width: 100,
              height: 100,
              borderRadius: 2,
              flexShrink: 0,
              // bgcolor: 'background.default',
              backgroundColor: (theme) => theme.vars.palette.grey[200],
            }}
            slotProps={{ img: { sx: { objectFit: 'contain' } } }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={[(theme) => ({ ...theme.mixins.maxLine({ line: 2 }), fontWeight: 700, mb: 0.5 })]}
            >
              {assetDetail.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              {assetDetail.deposit === 0 && !assetDetail?.isMallProduct && (
                <Chip
                  icon={<Shield size={14} />}
                  label="免押金"
                  size="small"
                  sx={{
                    bgcolor: 'success.main',
                    color: '#fff',
                    fontWeight: 700,
                    '& .MuiChip-icon': { color: '#fff' },
                  }}
                />
              )}
              {assetDetail.customTags?.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{ bgcolor: 'primary.lighter', color: 'primary.main', fontWeight: 600 }}
                />
              ))}
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
              <Avatar src={assetDetail.owner?.avatar} sx={{ width: 24, height: 24 }} />
              <Typography variant="caption" color="text.secondary">
                {assetDetail.contactName}
              </Typography>
              {assetDetail.owner?.isVerified ? (
                <Chip label="已认证" size="small" sx={{ bgcolor: 'success.main', color: '#fff' }} />
              ) : (
                <Chip label="未认证" size="small" sx={{ bgcolor: 'error.main', color: '#fff' }} />
              )}
            </Stack>
          </Box>
        </Stack>
      </AnimatedPaper>

      {/* 实例信息 */}
      {inventoryCode && (
        <AnimatedPaper>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
            实例信息
          </Typography>
          {inventoryLoading ? (
            <AssetInstanceSkeleton />
          ) : (
            inventoryData && <AssetInstanceCard data={inventoryData} />
          )}
        </AnimatedPaper>
      )}

      {/* 租赁方案选择 */}
      {assetDetail.rentalPlans.length > 0 && selectedRentalPlan && (
        <AnimatedPaper>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2, height: 30 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {assetDetail?.isMallProduct ? '选择购买方案' : '选择租赁方案'}
            </Typography>
            {selectedRentalPlan?.isInstallment && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={openInstallPlanPreviewDialog}
              >
                查看分期计划
              </Button>
            )}
          </Stack>

          <Controller
            name="rentalPlanId"
            control={control}
            render={({ field }) => (
              <RadioGroup {...field}>
                <Grid container spacing={1.5}>
                  {assetDetail.rentalPlans.map((plan) => {
                    const isSelected = Number(watchedRentalPlanId) === plan.id;
                    return (
                      <Grid size={{ xs: 6, md: 4 }} key={plan.id}>
                        <RentalPlanOption
                          isMallProduct={!!assetDetail?.isMallProduct}
                          plan={plan}
                          isSelected={isSelected}
                          value={plan.id}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </RadioGroup>
            )}
          />

          {planFeeInfo && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {planFeeInfo}
            </Alert>
          )}

          {/* 租赁时长选择 */}
          {!selectedRentalPlan?.isInstallment && (
            <Stack direction="row" alignItems="stretch" spacing={1} sx={{ mt: 3 }}>
              <Button
                variant="soft"
                disabled={duration <= minPeriod}
                onClick={() => {
                  setValue('duration', duration > minPeriod ? duration - 1 : duration);
                }}
              >
                <Iconify icon="mingcute:minimize-line" />
              </Button>
              <Box flex={1}>
                <Field.Text
                  name="duration"
                  type="number"
                  label={assetDetail?.isMallProduct ? '购买数量' : '租赁时长'}
                  slotProps={{
                    input: {
                      readOnly: true,
                      inputProps: {
                        maxLength: 4,
                        style: { textAlign: 'center', fontWeight: 700, fontSize: 18 },
                      },
                      startAdornment: !assetDetail?.isMallProduct && (
                        <InputAdornment position="start">
                          <Iconify icon="solar:clock-circle-outline" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="subtitle1">{rentalTypeUnitLabel}</Typography>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
              <Button
                variant="soft"
                disabled={duration >= maxPeriod}
                onClick={() => {
                  const value = duration + 1;
                  setValue('duration', value > 999 ? 999 : value);
                }}
              >
                <Iconify icon="mingcute:add-line" />
              </Button>
            </Stack>
          )}

          {/* 开始时间：仅允许选择当前时间 1 小时后的时间 */}

          {!assetDetail?.isMallProduct && (
            <Field.DateTimePicker
              name="startAt"
              label="开始时间"
              minDateTime={dayjs().add(15, 'minutes')}
              localeText={{}}
              format="YYYY年MM月DD HH:mm"
              sx={{ mt: 3 }}
              slotProps={{}}
            />
          )}
        </AnimatedPaper>
      )}

      {/* 联系方式和收货地址 */}
      <AnimatedPaper>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
          联系方式
        </Typography>

        <Stack spacing={2}>
          {/* 联系电话 */}
          <Field.Text
            name="contactName"
            placeholder="请输入联系人姓名"
            slotProps={{
              input: {
                inputProps: { maxLength: 50 },
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:user-rounded-bold" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Field.Text
            name="contactPhone"
            placeholder="请输入联系电话"
            type="tel"
            slotProps={{
              input: {
                inputProps: {
                  maxLength: 11,
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:phone-bold" />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* 是否需要配送 */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <Truck size={18} color="#9ca3af" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    需要配送
                  </Typography>
                  {assetDetail.deliveryFee > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      运费 ¥{assetDetail.deliveryFee}
                    </Typography>
                  )}
                </Box>
              </Stack>
              <Field.Switch name="needDelivery" label="需要配送" />
            </Stack>
          </Box>

          {/* 收货地址 */}
          {/* 选择收货地址 */}
          {watchedNeedDelivery && (
            <>
              {contact ? (
                <>
                  <ContactCard data={contact} />
                  <EnhancedButton
                    selectedContact={contact}
                    variant="outlined"
                    onSelectContact={setContact}
                  >
                    选择联系地址
                  </EnhancedButton>
                </>
              ) : (
                <Box>
                  <EnhancedEmptyContactBox
                    hasError={!!errors.contactId}
                    onSelectContact={setContact}
                  />
                  <HelperText disableGutters error helperText={errors.contactId?.message} />
                </Box>
              )}
            </>
          )}
        </Stack>
      </AnimatedPaper>

      {/* 费用明细 */}
      <AnimatedPaper>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
          费用明细
        </Typography>

        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              {assetDetail?.isMallProduct ? '商品金额' : '租金'}
            </Typography>
            <Box flexGrow={1} />
            {selectedRentalPlan?.isInstallment && (
              <Chip
                label={
                  <HorizontalStack spacing={0.5}>
                    <Typography variant="caption">{selectedRentalPlan?.rentalPeriod}期</Typography>
                    <Iconify icon="solar:eye-bold" sx={{ width: 14 }} />
                  </HorizontalStack>
                }
                size="small"
                variant="filled"
                color="primary"
                sx={{ borderRadius: 0.5, height: 20, fontSize: 10 }}
                onClick={openInstallPlanPreviewDialog}
              />
            )}

            <Typography
              component={Stack}
              direction="row"
              alignItems="center"
              spacing={1}
              variant="body2"
              sx={{ fontWeight: 600, color: 'primary.main', cursor: 'pointer' }}
              onClick={openInstallPlanPreviewDialog}
            >
              ¥{totalRentalAmount.toFixed(2)}
            </Typography>
          </Stack>

          {assetDetail.deposit > 0 && (
            <HorizontalStack justifyContent="space-between">
              <HorizontalStack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  押金
                </Typography>
                {assetDetail.creditFreeDeposit && (
                  <Chip
                    label="支持信用免押"
                    size="small"
                    variant="filled"
                    color="primary"
                    sx={{ borderRadius: 0.5, height: 20, fontSize: 10 }}
                  />
                )}
              </HorizontalStack>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ¥{assetDetail.deposit}
              </Typography>
            </HorizontalStack>
          )}

          {watchedNeedDelivery && assetDetail.deliveryFee > 0 && (
            <HorizontalStack justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                配送费
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ¥{assetDetail.deliveryFee}
              </Typography>
            </HorizontalStack>
          )}

          <Divider sx={{ my: 0.5 }} />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              订单总额
            </Typography>
            <CurrencyTypography color="error.main" currency={totalAmount.toNumber()} />
          </Stack>

          {assetDetail.deposit > 0 && (
            <Alert severity="info" sx={{ mt: 1 }}>
              押金将在归还商品后 1-7 个工作日内退还
            </Alert>
          )}
        </Stack>
      </AnimatedPaper>

      {/* 费用明细 */}
      <AnimatedPaper>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
          备注信息（选填）
        </Typography>
        <Field.Text
          name="userRemark"
          placeholder="请输入备注信息"
          multiline
          rows={4}
          slotProps={{
            input: {
              inputProps: { maxLength: 500 },
            },
          }}
        />
      </AnimatedPaper>

      {/* 错误提示 */}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
          {errorMessage}
        </Alert>
      )}

      {/* 底部固定操作栏 */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'background.paper',
          borderTop: (theme) => `1px solid ${theme.vars.palette.divider}`,
          py: 2,
          zIndex: 1000,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                disabled={!termsAgreed[0] || !termsAgreed[1]}
                checked={isAgreed}
                onChange={toggleIsAgreed}
              />
            }
            label={
              <Box>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  onClick={
                    termsAgreed[0] && termsAgreed[1]
                      ? undefined
                      : (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toast.error('请先阅读并同意协议', { id: 'rental-order-confirm-error' });
                        }
                  }
                >
                  我已阅读并同意
                </Typography>
                <Typography
                  component="a"
                  variant="body2"
                  color="success.main"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dialogs.open(
                      WebDialog,
                      {
                        dialogProps: {
                          dialogTitle: assetDetail.isMallProduct ? '支付协议' : '租赁协议',
                        },
                        countdown: 3,
                        webUrl: assetDetail.isMallProduct
                          ? '/terms/purchase-agreement.html'
                          : '/terms/rental-agreement.html',
                      },
                      {
                        onClose: async (agreed) => {
                          setTermsAgreed((prev) => [agreed, prev[1]]);
                        },
                      }
                    );
                  }}
                >
                  {assetDetail.isMallProduct ? '《支付协议》' : '《租赁协议》'}
                </Typography>
                <Typography component="span" variant="body2" color="text.secondary">
                  和
                </Typography>
                <Typography
                  component="a"
                  variant="body2"
                  color="success.main"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dialogs.open(
                      WebDialog,
                      {
                        dialogProps: {
                          dialogTitle: '用户协议',
                        },
                        countdown: 3,
                        webUrl: '/terms/user-agreement.html',
                      },
                      {
                        onClose: async (agreed) => {
                          setTermsAgreed((prev) => [prev[0], agreed]);
                        },
                      }
                    );
                  }}
                >
                  《用户协议》
                </Typography>
              </Box>
            }
          />
        </Stack>
        <Divider sx={{ my: 2 }} />
        <HorizontalStack spacing={3} sx={{ px: 3, py: 1 }}>
          {selectedRentalPlan && (
            <FeeDetailButton
              assetDetail={assetDetail}
              rentalPlan={selectedRentalPlan}
              needDelivery={watchedNeedDelivery || false}
              duration={duration}
              amount={
                selectedRentalPlan?.isInstallment
                  ? installmentTotalAmount.toNumber()
                  : totalAmount.toNumber()
              }
            />
          )}
          <Button
            component={m.button}
            whileTap={{ scale: 0.98 }}
            variant="contained"
            color="primary"
            fullWidth
            size="xLarge"
            // type="submit"
            type="button"
            disabled={isSubmitting}
            sx={{ fontWeight: 700, flex: 1 }}
            onClick={() => {
              if (!isAgreed) {
                toast.error('请同意协议', { id: 'rental-order-confirm-error' });
                return;
              }
              if (assetDetail?.isMallProduct) {
                onSubmit();
              } else {
                dialogs.open(
                  AutographDialog,
                  {},
                  {
                    onClose: async (file: File | null) => {
                      if (file) {
                        // TODO 上传签名图片
                        console.log(file);
                        onSubmit();
                      }
                    },
                  }
                );
              }
            }}
          >
            {isSubmitting
              ? '提交中...'
              : assetDetail?.isMallProduct
                ? '立即购买'
                : `租${rentalPeriodLabel}`}
          </Button>
        </HorizontalStack>
      </Box>
    </Form>
  );
}

// ----------------------------------------------------------------------

interface AssetInstanceCardProps {
  data: MyApi.SimpleOutputAssetInventoryDto;
}

function AssetInstanceCard({ data }: AssetInstanceCardProps) {
  const displayName = data.instanceName || data.instanceCode || '资产实例';
  const instanceImage = data.images?.[0] || '';
  const imageCount = data.images?.length || 0;
  const statusKey = data.status as keyof typeof AssetInventoryStatusLabels;
  const statusLabel = statusKey ? AssetInventoryStatusLabels[statusKey] : data.status;
  const statusColor = (statusKey && AssetInventoryStatusColors[statusKey]) || 'default';

  const slides = useMemo<Slide[]>(
    () => (data.images || []).map((src) => ({ type: 'image' as const, src })),
    [data.images]
  );

  const lightbox = useLightbox(slides);
  const { setSlides } = lightbox;

  useEffect(() => {
    setSlides(slides);
  }, [setSlides, slides]);

  return (
    <Stack direction="row" spacing={2}>
      {instanceImage && (
        <>
          <Lightbox
            open={lightbox.open}
            close={lightbox.onClose}
            slides={lightbox.slides}
            index={lightbox.selected}
            disableZoom={false}
          />
          <Badge badgeContent={imageCount > 1 ? imageCount : undefined} color="error">
            <Image
              src={instanceImage}
              alt={displayName}
              onClick={() => lightbox.onOpen(instanceImage)}
              sx={{
                width: 60,
                height: 60,
                borderRadius: 1,
                flexShrink: 0,
                cursor: 'zoom-in',
                backgroundColor: (theme) => theme.vars.palette.grey[200],
              }}
              slotProps={{ img: { sx: { objectFit: 'contain' } } }}
            />
          </Badge>
        </>
      )}
      <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
        <HorizontalStack spacing={1}>
          <Typography
            variant="subtitle1"
            sx={[(theme) => ({ ...theme.mixins.maxLine({ line: 2 }), fontWeight: 700 })]}
          >
            {displayName}
          </Typography>
          <Chip
            label={statusLabel}
            size="small"
            color={statusColor}
            sx={{ fontWeight: 600, flexShrink: 0 }}
          />
        </HorizontalStack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          编号：{data.instanceCode}
        </Typography>
      </Stack>
    </Stack>
  );
}

function AssetInstanceSkeleton() {
  return (
    <Stack direction="row" spacing={2}>
      <Skeleton variant="rounded" width={60} height={60} sx={{ borderRadius: 2, flexShrink: 0 }} />
      <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
        <HorizontalStack spacing={1}>
          <Skeleton variant="rounded" width="50%" height={28} />
          <Skeleton variant="rounded" width={72} height={28} sx={{ borderRadius: 2 }} />
        </HorizontalStack>
        <Skeleton variant="text" width="100%" height={24} />
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function AnimatedPaper({ children, ...props }: PaperProps) {
  return (
    <Paper
      component={m.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      {...props}
      sx={{
        p: 2.5,
        mb: 2,
        borderRadius: 0,
        bgcolor: 'background.paper',
        borderTop: (theme) => `1px solid ${theme.vars.palette.divider}`,
        borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
        ...props.sx,
      }}
    >
      {children}
    </Paper>
  );
}
