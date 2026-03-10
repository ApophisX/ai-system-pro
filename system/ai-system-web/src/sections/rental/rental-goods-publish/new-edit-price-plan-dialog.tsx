import type { DialogProps } from '@toolpad/core/useDialogs';

import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';

import { Stack, Button, IconButton, Typography, InputAdornment } from '@mui/material';

import { toast } from 'src/components/snackbar';
import { Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { FormDialog } from 'src/components/custom/form-dialog';

// ----------------------------------------------------------------------

export const PricePlanSchema = zod
  .object({
    maxPeriod: zod.coerce.number<number>().min(0, { message: '最大购买数量不能小于0' }),
    minPeriod: zod.coerce.number<number>().min(0, { message: '最小购买数量不能小于0' }),

    name: zod
      .string()
      .min(1, { message: '方案名称不能为空' })
      .max(50, { message: '方案名称不能超过50个字符' }),
    price: zod.coerce
      .number<number>()
      .min(0.01, { message: '价格必须大于0' })
      .max(99999999, { message: '价格不能超过99999999' }),
    attributes: zod.array(zod.object({ key: zod.string(), value: zod.string() })).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.maxPeriod < data.minPeriod) {
      ctx.addIssue({
        code: 'custom',
        message: '最大购买数量不能小于最小购买数量',
        path: ['maxPeriod'],
      });
    }
  });

export type PricePlanSchemaType = zod.infer<typeof PricePlanSchema>;

/** 将 attributes 数组转为 Record，过滤空 key */
function attributesArrayToRecord(
  arr: { key: string; value: string }[] | undefined
): Record<string, string> | undefined {
  if (!arr?.length) return undefined;
  const entries = arr
    .filter((item) => item.key?.trim())
    .map((item) => [item.key.trim(), item.value?.trim() ?? '']);
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

/** 将 Record 转为 attributes 数组 */
function recordToAttributesArray(
  record: Record<string, string> | undefined
): { key: string; value: string }[] {
  if (!record || Object.keys(record).length === 0) return [];
  return Object.entries(record).map(([key, value]) => ({ key, value }));
}

export const DefaultPricePlanValue: PricePlanSchemaType = {
  name: '',
  price: 0,
  attributes: [],
  maxPeriod: 1,
  minPeriod: 1,
};

/** 弹框输出类型：与父表单 rentalPlans 的 buy 方案字段兼容 */
export type PricePlanOutputType = {
  name: string;
  price: number;
  attributes?: Record<string, string>;
  maxPeriod: number;
  minPeriod: number;
};

// ----------------------------------------------------------------------

export function NewEditPricePlanDialog(
  props: DialogProps<PricePlanOutputType | undefined, PricePlanOutputType | null>
) {
  const { open, onClose, payload } = props;

  const formPayload = payload
    ? {
        name: payload.name,
        price: payload.price,
        attributes: recordToAttributesArray(payload.attributes),
        maxPeriod: payload.maxPeriod,
        minPeriod: payload.minPeriod,
      }
    : undefined;

  const methods = useForm<PricePlanSchemaType>({
    resolver: zodResolver(PricePlanSchema) as any,
    defaultValues: DefaultPricePlanValue,
    values: formPayload,
  });

  const { handleSubmit } = methods;

  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute,
  } = useFieldArray({
    control: methods.control,
    name: 'attributes',
    keyName: 'id',
  });

  const onSubmit = handleSubmit(
    (data) => {
      const output: PricePlanOutputType = {
        name: data.name,
        price: data.price,
        attributes: attributesArrayToRecord(data.attributes),
        maxPeriod: data.maxPeriod,
        minPeriod: data.minPeriod,
      };
      onClose(output);
    },
    (error) => {
      const messages = Object.values(error)
        .map((value) => value.message)
        .join('\n');
      toast.error(messages, { id: 'price-plan-error' });
    }
  );

  return (
    <FormDialog
      open={open}
      onClose={() => onClose(null)}
      methods={methods}
      onSubmit={onSubmit}
      scroll="paper"
      dialogTitle={payload ? '编辑方案' : '添加方案'}
      slotProps={{
        paper: {
          sx: {
            border: (theme) => `1px solid ${theme.vars.palette.divider}`,
          },
        },
      }}
    >
      <Scrollbar sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Field.Text
            fullWidth
            name="name"
            label="方案名称"
            placeholder="请输入方案名称"
            slotProps={{
              input: {
                inputProps: {
                  maxLength: 50,
                },
              },
            }}
          />

          <Field.Text
            fullWidth
            name="price"
            label="价格"
            type="number"
            slotProps={{
              input: {
                inputProps: { maxLength: 8 },
                startAdornment: <InputAdornment position="start">¥</InputAdornment>,
              },
            }}
          />
          <Field.Number name="minPeriod" label="最小购买数量" min={1} max={9999} />

          <Field.Number name="maxPeriod" label="最大购买数量" min={1} max={9999} />

          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                属性
              </Typography>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={<Iconify icon="mingcute:add-line" width={16} height={16} />}
                disabled={attributeFields.length >= 20}
                onClick={() => appendAttribute({ key: '', value: '' })}
              >
                添加属性
              </Button>
            </Stack>
            {attributeFields.length > 0 ? (
              <Stack spacing={2}>
                {attributeFields.map((field, index) => (
                  <Stack key={field.id} direction="row" alignItems="center" spacing={1}>
                    <Field.Text
                      name={`attributes.${index}.key`}
                      label="属性名"
                      placeholder="如：颜色、尺寸"
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <Field.Text
                      name={`attributes.${index}.value`}
                      label="属性值"
                      placeholder="如：红色、XL"
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <IconButton
                      color="error"
                      onClick={() => removeAttribute(index)}
                      sx={{ width: 32, height: 32 }}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" width={16} height={16} />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <EmptyContent
                title="暂无属性"
                description="可添加规格属性，如颜色、尺寸等"
                slotProps={{
                  img: { sx: { width: 1, maxWidth: 80 } },
                }}
              />
            )}
          </Stack>
        </Stack>
      </Scrollbar>
    </FormDialog>
  );
}
