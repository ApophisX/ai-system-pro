import type { RentalType, OverdueFeeUnit } from '../constants/rental-plan';

import { z as zod } from 'zod';
import { Save } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDialogs } from '@toolpad/core/useDialogs';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRef, useState, useEffect, useCallback } from 'react';

import { CloudUpload } from '@mui/icons-material';
import {
  Box,
  Stack,
  Paper,
  Alert,
  Button,
  styled,
  Divider,
  Container,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { usePlatform } from 'src/hooks/use-platform';

import { combineImageUrls } from 'src/utils/upload';

import API from 'src/services/API';
import { ossUploader } from 'src/lib/oss-uploader';
import { useGetAssetCategories } from 'src/actions/asset-categories';
import { navigateTo, navigateBack, getMiniProgramWebviewUrl } from 'src/lib/bridge';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { EmptyContent } from 'src/components/empty-content';
import { HelperText } from 'src/components/hook-form/help-text';

import { ContactSelectDrawer } from 'src/sections/contact';
import { ContactCard } from 'src/sections/contact/contact-card';
import { useAssetStatus } from 'src/sections/lessor/assets/hooks/use-asset-status';

import { useAuthContext } from 'src/auth/hooks';

import { PricePlanCard } from './price-plan-card';
import { RentalPlanCard } from './rental-plan-card';
import { NewEditPricePlanDialog } from './new-edit-price-plan-dialog';
import { NewEditRentalPlanDialog } from './new-edit-rental-plan-dialog';
import {
  RENTAL_TYPE_LABELS,
  OVERDUEFEE_UNIT_DICT,
  DELIVERY_METHOD_OPTIONS,
} from '../constants/rental-plan';

// ----------------------------------------------------------------------

const FormItemPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: Number(theme.shape.borderRadius) * 2,
  boxShadow: theme.vars.customShadows.card,
}));

// ----------------------------------------------------------------------

export type RentalGoodsPublishSchemaType = zod.infer<typeof RentalGoodsPublishSchema>;

export type RentalPlanSchemaType = zod.infer<typeof RentalPlanSchema>;

export const RentalPlanSchema = zod
  .object({
    id: zod.any().optional(),
    rentalType: zod.enum(Object.keys(RENTAL_TYPE_LABELS) as RentalType[], {
      message: '请选择租赁方式',
    }),
    name: zod.string().min(1, { message: '方案名称不能为空' }),
    sortOrder: zod.number(),
    price: zod.coerce.number<number>().min(0.01, { message: '价格必须大于0' }),
    deposit: zod.coerce.number<number>().min(0, { message: '押金不能为负数' }),
    penaltyFee: zod.coerce.number<number>().min(0, { message: '违约金不能为负数' }),
    overdueFee: zod.coerce.number<number>().min(0, { message: '逾期费用不能为负数' }),
    minPeriod: zod.coerce.number<number>().min(1, { message: '起租数不能小于1' }),
    maxPeriod: zod.coerce.number<number>().min(0, { message: '最大租期不能小于0' }),
    overdueFeeUnit: zod
      .enum(Object.keys(OVERDUEFEE_UNIT_DICT) as OverdueFeeUnit[], {
        message: '请选择逾期计费方式',
      })
      .default('day'),
    // 是否开启分期
    isInstallment: zod.boolean().default(false),
    // 分期期数
    rentalPeriod: zod.coerce.number<number>().default(1),
    // 顾客租满时间、资产归属顾客
    transferOwnershipAfterRental: zod.boolean().default(false),
    attributes: zod.record(zod.string(), zod.string()).optional(),
  })
  .superRefine((data, ctx) => {
    // 按周租，最大分期不能超过156期
    // 按月租，最大分期不能超过36期
    // 按季度租，最大分期不能超过12期
    // 按年租，最大分期不能超过3期
    if (data.rentalType === 'weekly') {
      if (data.rentalPeriod > 156) {
        ctx.addIssue({
          code: 'custom',
          message: '按周租，最大分期不能超过156期',
          path: ['rentalPeriod'],
        });
      }
    } else if (data.rentalType === 'monthly') {
      if (data.rentalPeriod > 36) {
        ctx.addIssue({
          code: 'custom',
          message: '按月租，最大分期不能超过36期',
          path: ['rentalPeriod'],
        });
      }
    } else if (data.rentalType === 'quarterly') {
      if (data.rentalPeriod > 12) {
        ctx.addIssue({
          code: 'custom',
          message: '按季度租，最大分期不能超过12期',
          path: ['rentalPeriod'],
        });
      }
    } else if (data.rentalType === 'yearly') {
      if (data.rentalPeriod > 3) {
        ctx.addIssue({
          code: 'custom',
          message: '按年租，最大分期不能超过3期',
          path: ['rentalPeriod'],
        });
      }
    }

    if (data.isInstallment && data.penaltyFee > data.price) {
      ctx.addIssue({
        code: 'custom',
        message: '违约金不能大于每期的租金',
        path: ['penaltyFee'],
      });
    }

    if (data.isInstallment && data.rentalPeriod < 2) {
      ctx.addIssue({
        code: 'custom',
        message: '分期期数至少为2期',
        path: ['rentalPeriod'],
      });
    } else if (data.rentalPeriod < 1) {
      ctx.addIssue({
        code: 'custom',
        message: '分期期数至少为1期',
        path: ['rentalPeriod'],
      });
    }
  });

export const RentalGoodsPublishSchema = zod
  .object({
    name: zod
      .string()
      .min(1, { message: '商品名称不能为空' })
      .max(50, { message: '商品名称不能超过50个字符' }),
    // 可以为null
    categoryId: zod.string().nullable().optional(),
    description: zod
      .string()
      .min(10, { message: '商品描述至少10个字符' })
      .max(500, { message: '商品描述不能超过500个字符' })
      .optional(),
    images: zod
      .array(zod.union([zod.instanceof(File), zod.string()]))
      .min(1, { message: '请至少上传一张商品图片' })
      .max(9, { message: '最多上传9张图片' }),
    detailImages: zod.array(zod.union([zod.instanceof(File), zod.string()])).optional(),

    creditFreeDeposit: zod.boolean().default(false),

    requireElectronicSignature: zod.boolean().default(false),

    isMallProduct: zod.string().default('false'),
    autoDelivery: zod.boolean().default(false),

    rentalPlans: zod.array(RentalPlanSchema).min(1, { message: '请至少添加一种租赁方式' }),

    deliveryMethods: zod.array(zod.string()).min(1, { message: '请选择送货方式' }),
    deliveryFee: zod.coerce.number<number>().min(0, { message: '配送费不能为负数' }),
    deposit: zod.coerce.number<number>().min(0, { message: '押金不能为负数' }),
    availableQuantity: zod.coerce
      .number<number>()
      .int()
      .min(0, { message: '可租数量不能为负数' })
      .max(200, { message: '200' }),

    contactWechat: zod.string().optional(),
    notes: zod.string().max(200, { message: '其他说明不能超过200个字符' }).optional(),
    requireRealName: zod.boolean().default(false),
    tags: zod.array(zod.string()).max(5, { message: '最多选择5个标签' }).optional(),
    contactId: zod.string().min(1, { message: '请选择地址' }),
    specifications: zod.array(zod.object({ key: zod.string(), value: zod.string() })).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.categoryId) {
      ctx.addIssue({
        code: 'custom',
        message: '请选择商品分类',
        path: ['categoryId'],
      });
    }
  });

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

// 默认租赁方案
export const DefaultRentalPlanValue: RentalPlanSchemaType = {
  rentalType: 'monthly',
  price: 99,
  deposit: 0,
  name: '按月租赁',
  overdueFee: 3.3,
  penaltyFee: 0,
  rentalPeriod: 1,
  overdueFeeUnit: 'day',
  transferOwnershipAfterRental: false,
  isInstallment: false,
  sortOrder: 0,
  minPeriod: 1,
  maxPeriod: 0,
};

export const DefaultBuyRentalPlanValue: RentalPlanSchemaType = {
  ...DefaultRentalPlanValue,
  rentalType: 'buy',
  name: '方案1',
  overdueFee: 0,
  maxPeriod: 1,
};

const defaultValues: RentalGoodsPublishSchemaType = {
  specifications: [],
  name: '',
  categoryId: '',
  description: '',
  images: [],
  detailImages: [],
  rentalPlans: [DefaultRentalPlanValue],
  contactId: '',
  contactWechat: '',
  notes: '',
  requireRealName: false,
  tags: [],
  deliveryMethods: ['same-city-delivery', 'express-delivery'],
  deliveryFee: 0,
  availableQuantity: 1,
  deposit: 0,
  creditFreeDeposit: false,
  isMallProduct: 'false',
  autoDelivery: false,
  requireElectronicSignature: false,
};

export function NewEditRentalForm({ asset }: { asset?: MyApi.OutputAssetDetailDto }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const urlParams = useSearchParams();
  const communityId = urlParams.get('communityId') || undefined;

  const { user } = useAuthContext();

  const isFirst = useRef(true);

  // 是否是合作伙伴
  const isPartner = user?.isEnterpriseVerified || false;

  const { data: assetCategories } = useGetAssetCategories();

  const { isInWeChatMiniProgram } = usePlatform();

  const methods = useForm({
    resolver: zodResolver(RentalGoodsPublishSchema),
    defaultValues,
    values: asset
      ? {
          isMallProduct: (asset.isMallProduct || false).toString(),
          name: asset.name,
          categoryId: asset.categoryId,
          description: asset.description,
          images: asset.images,
          detailImages: asset.detailImages,
          contactId: asset.contactId,
          contactWechat: asset.contactWeChat,
          notes: asset.notes,
          requireRealName: asset.requireRealName || false,
          tags: asset.customTags,
          deliveryMethods: asset.deliveryMethods,
          deliveryFee: asset.deliveryFee,
          availableQuantity: asset.availableQuantity || 1,
          deposit: asset.deposit || 0,
          specifications: asset.specifications || [],
          creditFreeDeposit: asset.creditFreeDeposit || false,
          autoDelivery: asset.autoDelivery || false,
          requireElectronicSignature: asset.requireElectronicSignature || false,
          rentalPlans: asset.rentalPlans.map(
            (plan) =>
              ({
                id: plan.id,
                rentalType: plan.rentalType,
                name: plan.name || '',
                sortOrder: plan.sortOrder,
                minPeriod: plan.minPeriod || 1,
                maxPeriod: plan.maxPeriod || 0,
                rentalPeriod: plan.rentalPeriod,
                overdueFeeUnit: plan.overdueFeeUnit,
                transferOwnershipAfterRental: plan.transferOwnershipAfterRental || false,
                isInstallment: plan.isInstallment || false,
                penaltyFee: plan.penaltyFee || 0,
                overdueFee: plan.overdueFee || 0,
                deposit: plan.deposit || 0,
                price: plan.price || 0,
                attributes: plan.attributes || undefined,
              }) as RentalPlanSchemaType
          ),
        }
      : undefined,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    control,
    watch,
    reset,
    getValues,
    setValue,
    clearErrors,
  } = methods;

  const dialogs = useDialogs();

  const {
    fields: rentalListFields,
    append: appendRentalList,
    remove: removeRentalList,
    move: moveRentalList,
  } = useFieldArray({
    control,
    name: 'rentalPlans',
    keyName: 'id',
  });

  const {
    fields: specificationFields,
    append: appendSpecification,
    remove: removeSpecification,
  } = useFieldArray({
    control,
    name: 'specifications',
    keyName: 'id',
  });
  const { isOnline } = useAssetStatus(asset);

  const images = watch('images');
  const isMallProduct = watch('isMallProduct') === 'true';
  const [contact, setContact] = useState<MyApi.OutputContactDto | null>(asset?.contact || null);
  const publishRef = useRef<boolean>(false);
  const detailImages = watch('detailImages');

  // 移除商品图片
  const handleRemoveFile = useCallback(
    (inputFile: File | string) => {
      const filtered = images && images?.filter((file) => file !== inputFile);
      setValue('images', filtered);
    },
    [setValue, images]
  );

  // 移除详情图片
  const handleRemoveDetailFile = useCallback(
    (inputFile: File | string) => {
      const filtered = detailImages && detailImages?.filter((file) => file !== inputFile);
      setValue('detailImages', filtered);
    },
    [setValue, detailImages]
  );

  // 选择联系地址
  const handleSelectContact = useCallback(() => {
    dialogs.open(
      ContactSelectDrawer,
      { data: contact },
      {
        onClose: async (data) => {
          if (data) {
            setContact(data);
            setValue('contactId', data.id);
            clearErrors('contactId');
          }
        },
      }
    );
  }, [contact, clearErrors, dialogs, setValue]);

  // 提交表单
  const onSubmit = handleSubmit(
    async (data) => {
      if (isOnline) {
        toast.error('资产已发布，无法编辑');
        return;
      }
      try {
        setErrorMessage(null);
        const {
          data: { data: creationStats },
        } = await API.AppAsset.AppAssetControllerGetCreationStatsV1({
          fetchOptions: {
            showSuccess: false,
          },
        });

        if (!asset) {
          let errMsg = '';
          if (creationStats.totalCount >= creationStats.maxTotalCount) {
            errMsg = `您已达到最大资产创建数量，请稍后再试`;
          }
          if (creationStats.todayCount >= creationStats.maxDailyCount) {
            errMsg = `您今天已达到最大资产创建数量，请稍后再试`;
          }
          if (errMsg) {
            toast.error(errMsg);
            setErrorMessage(errMsg);
            return;
          }
        }

        const imageFiles = data.images.filter((file) => file instanceof File) as File[];
        const imageUrls = data.images.filter((url) => typeof url === 'string') as string[];
        const detailImageFiles = data.detailImages?.filter(
          (file) => file instanceof File
        ) as File[];
        const detailImageUrls = data.detailImages?.filter(
          (url) => typeof url === 'string'
        ) as string[];

        const [uploadFiles, uploadDetailFiles] = await Promise.all([
          ossUploader.uploadFiles(imageFiles, { uploadPath: '/xuwu/assets' }),
          ossUploader.uploadFiles(detailImageFiles, { uploadPath: '/xuwu/assets' }),
        ]);

        const imageResult = combineImageUrls(imageUrls, uploadFiles);
        const detailImageResult = combineImageUrls(detailImageUrls, uploadDetailFiles);

        setValue('images', imageResult.imageUrls);
        setValue('detailImages', detailImageResult.imageUrls);

        const body = {
          ...data,
          isMallProduct: data.isMallProduct === 'true',
          sortOrder: asset?.sortOrder || 0,
          categoryId: data.categoryId!,
          publish: publishRef.current,
          images: imageResult.imagePaths,
          detailImages: detailImageResult.imagePaths,
          rentalPlans: data.rentalPlans.map((plan, index) => ({
            ...plan,
            id: asset ? plan.id : undefined,
            sortOrder: index + 1,
          })),
          communityId,
        };
        if (asset) {
          await API.AppAsset.AppAssetControllerUpdateAssetV1({ id: asset.id }, body);
        } else {
          await API.AppAsset.AppAssetControllerCreateAssetV1(body);
        }
        if (isInWeChatMiniProgram) {
          if (asset) {
            router.back();
          } else {
            navigateTo(getMiniProgramWebviewUrl(paths.lessor.assets.root));
          }
        } else {
          router.back();
        }
        reset();
        setValue('contactId', contact?.id || '');
      } catch {
        setErrorMessage('创建失败，请稍后再试');
      }
    },
    (err) => {
      console.log(err);
      const message = Object.values(err)
        .map((error) => error.message)
        .join('\n');
      toast.error(message);
    }
  );

  // 配送信息字段
  const deliveryFields = (
    <>
      <Stack direction="row" spacing={1}>
        {/* 送货方式 */}
        <Field.MultiSelect
          fullWidth
          name="deliveryMethods"
          label="送货方式"
          options={DELIVERY_METHOD_OPTIONS}
          slotProps={{
            inputLabel: { shrink: true },
          }}
        />
        {/* 配送费   */}
        <Field.Text
          fullWidth
          name="deliveryFee"
          label="配送费"
          type="number"
          slotProps={{
            htmlInput: {
              inputMode: 'decimal',
            },
            input: {
              inputMode: 'decimal',
              startAdornment: <InputAdornment position="start">¥</InputAdornment>,
            },
          }}
        />
      </Stack>
      <Field.Text
        name="availableQuantity"
        label="可用数量"
        type="number"
        disabled={!!asset}
        slotProps={{
          htmlInput: {
            inputMode: 'decimal',
          },
          input: {
            inputMode: 'decimal',
          },
          inputLabel: { shrink: true },
        }}
      />
    </>
  );

  useEffect(() => {
    if (isFirst.current) {
      setTimeout(() => {
        isFirst.current = false;
      }, 500);
    }
  }, []);

  useEffect(() => {
    if (isFirst.current) {
      return;
    }
    if (isMallProduct) {
      setValue('rentalPlans', [DefaultBuyRentalPlanValue]);
    } else {
      setValue('rentalPlans', [DefaultRentalPlanValue]);
      setValue('autoDelivery', false);
    }
    setValue('requireElectronicSignature', false);
  }, [isMallProduct, setValue]);

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Box component={Stack} spacing={3} sx={{ px: 0, pb: 14 }}>
        {/* 商品图片 */}
        <FormItemPanel>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
            资产图片
          </Typography>
          <Field.Upload
            accept={{ 'image/*': [] }}
            helperText="最多上传9张图片，单张图片最大10M"
            name="images"
            onRemove={handleRemoveFile}
            miniMode
            multiple
            maxFiles={9}
            maxSize={10 * 1024 * 1024}
          />

          <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 700 }}>
            详情图片
          </Typography>
          <Field.Upload
            accept={{ 'image/*': [] }}
            helperText="最多上传9张图片，单张图片最大10M"
            name="detailImages"
            onRemove={handleRemoveDetailFile}
            miniMode
            multiple
            maxFiles={9}
            maxSize={10 * 1024 * 1024}
          />
        </FormItemPanel>

        {/* 基本信息 */}
        <FormItemPanel>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
            基本信息
          </Typography>
          <Stack spacing={2.5}>
            <Field.Text
              name="name"
              label="商品名称"
              placeholder="请输入商品名称"
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <Field.Autocomplete
              name="categoryId"
              label="商品分类"
              placeholder="请选择商品分类"
              noOptionsText="暂无分类"
              options={assetCategories.map((c) => c.id)}
              getOptionLabel={(categoryId) =>
                assetCategories.find((c) => c.id === categoryId)?.name || ''
              }
              slotProps={{
                textField: {
                  InputLabelProps: { shrink: true },
                },
              }}
            />

            <Field.Autocomplete
              name="tags"
              label="商品标签"
              placeholder="请选择商品标签"
              freeSolo
              multiple
              options={[]}
              slotProps={{
                textField: {
                  InputLabelProps: { shrink: true },
                },
              }}
            />

            <Field.Text
              name="description"
              label="商品描述"
              placeholder="详细描述您的商品，包括品牌、型号、使用情况等"
              multiline
              rows={4}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            {isPartner && (
              <Field.RadioGroup
                row
                name="isMallProduct"
                label="商品类型"
                options={[
                  { label: '租赁商品', value: 'false' },
                  { label: '商城商品', value: 'true' },
                ]}
              />
            )}
          </Stack>
        </FormItemPanel>

        {/* 资产规格 */}
        <FormItemPanel>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h6">资产规格</Typography>
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="mingcute:add-line" width={16} height={16} />}
              disabled={specificationFields.length >= 20}
              onClick={() => {
                appendSpecification({ key: '', value: '' });
              }}
            >
              添加规格
            </Button>
          </Stack>
          <Stack spacing={2.5}>
            {specificationFields.map((field, index) => (
              <Stack key={index} direction="row" alignItems="center" spacing={1}>
                <Field.Text
                  name={`specifications.${index}.key`}
                  label="规格名称"
                  placeholder={index === 0 ? '如：品牌、型号、颜色等' : '请输入规格名称'}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <Field.Text
                  name={`specifications.${index}.value`}
                  label="规格值"
                  placeholder={index === 0 ? '如：苹果、17 Pro、红色等' : '请输入规格值'}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <IconButton
                  color="error"
                  onClick={() => {
                    removeSpecification(index);
                  }}
                  sx={{ width: 32, height: 32 }}
                >
                  <Iconify icon="solar:trash-bin-trash-bold" width={16} height={16} />
                </IconButton>
              </Stack>
            ))}
          </Stack>
          {specificationFields.length === 0 && (
            <Box>
              <EmptyContent
                title="暂无规格"
                slotProps={{
                  img: { sx: { width: 1, maxWidth: 80 } },
                }}
              />
            </Box>
          )}
        </FormItemPanel>

        {/* 租赁信息 */}
        {isMallProduct ? (
          <FormItemPanel>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                价格方案
              </Typography>
              <Button
                startIcon={<Iconify icon="mingcute:add-line" width={16} height={16} />}
                variant="contained"
                disabled={rentalListFields.length >= 9}
                size="small"
                color="primary"
                onClick={() => {
                  dialogs.open(NewEditPricePlanDialog, undefined, {
                    onClose: async (data) => {
                      if (data) {
                        appendRentalList({
                          ...DefaultBuyRentalPlanValue,
                          ...data,
                          sortOrder: rentalListFields.length,
                        });
                      }
                    },
                  });
                }}
              >
                添加方案
              </Button>
            </Stack>
            <Stack spacing={1}>
              {rentalListFields.map((field, index) => (
                <PricePlanCard
                  key={field.id}
                  index={index}
                  count={rentalListFields.length}
                  onEdit={() => {
                    const plan = getValues(`rentalPlans.${index}`);

                    dialogs.open(NewEditPricePlanDialog, plan, {
                      onClose: async (data) => {
                        if (data) {
                          setValue(`rentalPlans.${index}`, {
                            ...DefaultBuyRentalPlanValue,
                            ...plan,
                            ...data,
                          });
                        }
                      },
                    });
                  }}
                  onDelete={() => removeRentalList(index)}
                />
              ))}
            </Stack>
            <Divider sx={{ my: 3 }} />

            <Stack spacing={2}>{deliveryFields}</Stack>

            <Field.Switch name="autoDelivery" label="自动发货" sx={{ ml: -1.5, mt: 1 }} />
          </FormItemPanel>
        ) : (
          <FormItemPanel>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                租赁方案
              </Typography>
              <Button
                startIcon={<Iconify icon="mingcute:add-line" width={16} height={16} />}
                variant="contained"
                disabled={rentalListFields.length >= 5}
                size="small"
                color="primary"
                onClick={() => {
                  dialogs.open(NewEditRentalPlanDialog, undefined, {
                    onClose: async (data) => {
                      if (data) {
                        appendRentalList({
                          ...data,
                          sortOrder: rentalListFields.length,
                        });
                      }
                    },
                  });
                }}
              >
                添加方案
              </Button>
            </Stack>
            <Stack spacing={1}>
              {rentalListFields.map((field, index) => (
                <RentalPlanCard
                  key={field.id}
                  index={index}
                  count={rentalListFields.length}
                  onEdit={() => {
                    const rentalPlans = getValues(`rentalPlans.${index}`) as RentalPlanSchemaType;
                    dialogs.open(NewEditRentalPlanDialog, rentalPlans, {
                      onClose: async (data) => {
                        if (data) {
                          setValue(`rentalPlans.${index}`, { ...field, ...data });
                        }
                      },
                    });
                  }}
                  onDelete={() => {
                    removeRentalList(index);
                  }}
                  onMove={() => {
                    moveRentalList(index, 0);
                  }}
                />
              ))}
            </Stack>
            <Divider sx={{ my: 3 }} />

            {/* 押金、物流、免押、实名 */}
            <Stack spacing={2}>
              <Field.Text
                fullWidth
                name="deposit"
                label="押金"
                type="number"
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    inputProps: {
                      maxLength: 8,
                    },
                    startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                  },
                }}
              />
              {deliveryFields}
              <Stack>
                <Field.Switch name="requireRealName" label="是否需要实名认证" sx={{ ml: -1.5 }} />

                {!isMallProduct && (
                  <Field.Switch
                    name="requireElectronicSignature"
                    label="是否需要电子签名"
                    sx={{ ml: -1.5 }}
                  />
                )}

                {/* <Field.Switch name="creditFreeDeposit" label="是否支持信用免押" sx={{ ml: -1.5 }} /> */}
              </Stack>
            </Stack>
          </FormItemPanel>
        )}

        {/* 联系信息 */}
        <FormItemPanel>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              联系信息
            </Typography>
            {contact && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="mingcute:add-line" width={16} height={16} />}
                size="small"
                onClick={handleSelectContact}
              >
                选择联系地址
              </Button>
            )}
          </Stack>
          {/* 空地址 */}

          {contact ? (
            <ContactCard data={contact} />
          ) : (
            <EmptyContactBox hasError={!!errors.contactId?.message} onClick={handleSelectContact} />
          )}

          <HelperText errorMessage={errors.contactId?.message} disableGutters />
        </FormItemPanel>

        {/* 租赁说明 */}
        <FormItemPanel>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
            {isMallProduct ? '购买说明' : '租赁说明'}
          </Typography>
          <Field.Text
            name="notes"
            label={isMallProduct ? '购买说明（选填）' : '租赁说明（选填）'}
            placeholder={
              isMallProduct
                ? '请填写购买说明。例如：售后政策、发货时间、购买须知等（选填）'
                : '请补充完善租赁规则、注意事项、押金说明、违约处理、售后等说明（选填）'
            }
            multiline
            rows={4}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </FormItemPanel>

        {/* 错误提示 */}
        {!!errorMessage && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {/* 提交按钮 */}
        <Container
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            py: 2.5,
            backgroundColor: 'background.paper',
            zIndex: 99,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            {/* 保存草稿 */}
            <Button
              fullWidth
              size="large"
              variant="contained"
              color="secondary"
              disabled={isSubmitting}
              loading={isSubmitting && !publishRef.current}
              startIcon={<Save />}
              onClick={() => {
                publishRef.current = false;
                onSubmit();
              }}
            >
              保存草稿
            </Button>
            {/* 发布 */}
            <Button
              fullWidth
              size="large"
              color="primary"
              variant="contained"
              disabled={isSubmitting}
              loading={isSubmitting && publishRef.current}
              startIcon={<CloudUpload />}
              onClick={() => {
                publishRef.current = true;
                onSubmit();
              }}
            >
              立即发布
            </Button>
          </Stack>
        </Container>
      </Box>
    </Form>
  );
}

// ----------------------------------------------------------------------
/**
 * 空地址提示
 */
function EmptyContactBox({ hasError, onClick }: { hasError?: boolean; onClick?: () => void }) {
  return (
    <Box
      sx={{
        py: 2,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        border: '1px dashed',
        borderColor: hasError ? 'error.main' : 'divider',
        borderRadius: 2,
        bgcolor: 'background.neutral',
      }}
    >
      <Iconify
        icon="mdi:map-marker-off-outline"
        width={48}
        height={48}
        color="text.disabled"
        sx={{ mb: 1 }}
      />
      <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
        暂无地址
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', mb: 1 }}>
        请选择联系地址
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={onClick}
        startIcon={<Iconify icon="mingcute:add-line" width={18} height={18} />}
      >
        选择联系地址
      </Button>
    </Box>
  );
}
