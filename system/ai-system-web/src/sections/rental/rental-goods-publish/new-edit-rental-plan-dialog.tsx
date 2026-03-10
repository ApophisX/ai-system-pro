import type { DialogProps } from '@toolpad/core/useDialogs';
import type { RentalType } from '../constants/rental-plan';
import type { RentalPlanSchemaType } from './new-eidt-rental-form';

import { useForm } from 'react-hook-form';
import { useRef, useMemo, useEffect } from 'react';
import { useDialogs } from '@toolpad/core/useDialogs';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Box,
  Stack,
  Button,
  MenuItem,
  Typography,
  ButtonBase,
  InputAdornment,
} from '@mui/material';

import { fNumber, fCurrency } from 'src/utils/format-number';

import { Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { FormDialog } from 'src/components/custom/form-dialog';

import { getOverdueTipText } from 'src/sections/order/components';

import { InstallmentPlanPreviewDialog } from './rental-installment-view-dialog';
import { RentalPlanSchema, DefaultRentalPlanValue } from './new-eidt-rental-form';
import {
  RENTAL_TYPE_OPTIONS,
  RENTAL_TYPE_DAYS_DICT,
  OVERDUEFEE_UNIT_OPTIONS,
  RENTAL_TYPE_UNIT_LABELS,
} from '../constants/rental-plan';

const RENTAL_TYPE_NAME_DICT: Record<RentalType, string> = {
  hourly: '按小时租赁',
  daily: '按天租赁',
  weekly: '按周租赁',
  monthly: '按月租赁',
  quarterly: '按季度租赁',
  yearly: '按年租赁',
  buy: '',
};

export function NewEditRentalPlanDialog(
  props: DialogProps<RentalPlanSchemaType | undefined, RentalPlanSchemaType | null>
) {
  const { open, onClose, payload } = props;

  const methods = useForm<RentalPlanSchemaType>({
    resolver: zodResolver(RentalPlanSchema as any),
    defaultValues: DefaultRentalPlanValue,
    values: payload,
  });

  const isFirst = useRef(true);

  const { watch } = methods;
  const rentalType = watch('rentalType') as RentalType;
  const overdueFeeUnit = watch('overdueFeeUnit');
  const price = watch('price') as number;
  const rentalPeriod = watch('rentalPeriod');
  const isInstallment = watch('isInstallment');
  const { setValue, handleSubmit, getValues } = methods;

  const dialogs = useDialogs();

  const onSubmit = handleSubmit(
    (data) => {
      onClose(data);
    },
    (error) => {
      console.log(error);
    }
  );

  const overduefeeUnitOptions = useMemo(() => {
    if (rentalType === 'hourly') {
      return OVERDUEFEE_UNIT_OPTIONS.filter((option) => option.value === 'hour');
    }
    return OVERDUEFEE_UNIT_OPTIONS;
  }, [rentalType]);

  const adornment1 = <InputAdornment position="start">¥</InputAdornment>;

  const adornment2 = (
    <InputAdornment position="start" sx={{ mr: 0.5 }}>
      /
    </InputAdornment>
  );

  // 是否可分期
  const canInstallment = useMemo(() => {
    if (['hourly', 'daily'].includes(rentalType) || !isInstallment) {
      return false;
    }
    return true;
  }, [rentalType, isInstallment]);

  // 分期期数帮助文本
  const installmentHelperText = useMemo(() => {
    const unit = RENTAL_TYPE_UNIT_LABELS[rentalType];
    return `${RENTAL_TYPE_DAYS_DICT[rentalType]}天/每期，总租金：${fCurrency(price)}/${unit} x ${rentalPeriod}期 = ${fCurrency(price * rentalPeriod)}`;
  }, [rentalType, price, rentalPeriod]);

  // 价格帮助文本
  const priceHelperText = useMemo(
    () =>
      rentalType === 'hourly'
        ? undefined
        : `日均：${fCurrency(price / RENTAL_TYPE_DAYS_DICT[rentalType])}，每小时：${fCurrency(price / (RENTAL_TYPE_DAYS_DICT[rentalType] * 24))}`,
    [rentalType, price]
  );

  useEffect(() => {
    if (isFirst.current) return;
    if (isInstallment) {
      setValue('rentalPeriod', 3);
      const _price = getValues('price');
      setValue('penaltyFee', Number(fNumber(_price * 0.3, { useGrouping: false })));
    } else {
      setValue('rentalPeriod', 1);
      setValue('penaltyFee', 0);
    }
  }, [isInstallment, setValue, getValues]);

  useEffect(() => {
    if (isFirst.current) return;

    if (rentalType === 'daily' || rentalType === 'hourly') {
      setValue('isInstallment', false);
    }

    if (rentalType === 'hourly') {
      setValue('overdueFeeUnit', 'hour');
    }
    const ip = getValues('rentalPeriod');

    if (rentalType === 'weekly' && ip > 52) {
      setValue('rentalPeriod', 52);
    }
    if (rentalType === 'monthly' && ip > 12) {
      setValue('rentalPeriod', 12);
    }
    if (rentalType === 'quarterly' && ip > 4) {
      setValue('rentalPeriod', 4);
    }
    if (rentalType === 'yearly' && ip > 3) {
      setValue('rentalPeriod', 3);
    }
    setValue('name', RENTAL_TYPE_NAME_DICT[rentalType] || '');
  }, [getValues, rentalType, setValue]);

  useEffect(() => {
    if (isFirst.current) return;

    if (price) {
      if (rentalType === 'hourly') {
        setValue('overdueFee', price);
      } else {
        let value: string = '0';
        if (overdueFeeUnit === 'hour') {
          value = fNumber(price / (RENTAL_TYPE_DAYS_DICT[rentalType] * 24), { useGrouping: false });
        } else {
          value = fNumber(price / RENTAL_TYPE_DAYS_DICT[rentalType], { useGrouping: false });
        }
        setValue('overdueFee', Number(value));
      }
    }
  }, [price, overdueFeeUnit, setValue, rentalType]);

  useEffect(() => {
    if (isFirst.current) return;
    if (!canInstallment) {
      setValue('rentalPeriod', 1);
    }
  }, [canInstallment, setValue]);

  useEffect(() => {
    setTimeout(() => {
      isFirst.current = false;
    }, 500);
  }, [payload]);

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
          {/* 是否分期 */}
          {!['hourly', 'daily'].includes(rentalType) && (
            <Box sx={{ flexShrink: 0, ml: -1.5 }}>
              <Field.Switch name="isInstallment" label="是否分期" />
            </Box>
          )}

          <Field.Text fullWidth name="name" label="方案名称" />

          {/* 价格 */}
          <Field.Text
            fullWidth
            name="price"
            label="价格"
            type="number"
            helperText={priceHelperText}
            slotProps={{
              input: {
                startAdornment: adornment1,
                inputProps: {
                  maxLength: 8,
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <Field.Select
                      name="rentalType"
                      sx={{
                        textAlign: 'right',
                        '& fieldset': { border: 'none' },
                      }}
                      slotProps={{
                        input: {
                          startAdornment: adornment2,
                        },
                      }}
                    >
                      {RENTAL_TYPE_OPTIONS.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {RENTAL_TYPE_UNIT_LABELS[type.value]}
                        </MenuItem>
                      ))}
                    </Field.Select>
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* 分期期数 */}
          {canInstallment && (
            <Field.Text
              fullWidth
              name="rentalPeriod"
              label="分期期数"
              type="number"
              helperText={installmentHelperText}
              slotProps={{
                htmlInput: {
                  inputMode: 'numeric',
                },
                input: {
                  inputMode: 'numeric',
                  inputProps: {
                    maxLength: 2,
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography variant="subtitle1">/ 期</Typography>
                        <Button
                          variant="text"
                          color="info"
                          size="small"
                          sx={{ px: 1 }}
                          startIcon={<Iconify icon="solar:eye-bold" width={16} height={16} />}
                          onClick={() => {
                            const values = getValues();
                            dialogs.open(InstallmentPlanPreviewDialog, {
                              plan: values,
                              startDate: new Date(),
                            });
                          }}
                        >
                          分期计划
                        </Button>
                      </Stack>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}

          {/* 押金 */}
          {/* <Field.Text
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
                startAdornment: adornment1,
              },
            }}
          /> */}

          {/* 起租 */}
          {!isInstallment && (
            <Field.Text
              fullWidth
              name="minPeriod"
              label={`起租${RENTAL_TYPE_UNIT_LABELS[rentalType]}数`}
              type="number"
              slotProps={{
                htmlInput: {
                  inputMode: 'numeric',
                },
                input: {
                  inputMode: 'numeric',
                  inputProps: { maxLength: 4 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant="subtitle1">
                        {RENTAL_TYPE_UNIT_LABELS[rentalType]}
                      </Typography>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}

          {/* 逾期 */}
          <Field.Text
            fullWidth
            name="overdueFee"
            label={
              <Typography variant="subtitle1" color="warning.main" fontWeight={600}>
                逾期费用
              </Typography>
            }
            helperText={getOverdueTipText(overdueFeeUnit)}
            type="number"
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                startAdornment: adornment1,
                inputProps: {
                  maxLength: 8,
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <Field.Select
                      name="overdueFeeUnit"
                      sx={{
                        textAlign: 'right',
                        '& fieldset': { border: 'none' },
                      }}
                      slotProps={{
                        input: {
                          startAdornment: adornment2,
                        },
                      }}
                    >
                      {overduefeeUnitOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Field.Select>
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* 违约金 */}
          {canInstallment && (
            <Field.Text
              fullWidth
              name="penaltyFee"
              label={
                <Typography variant="subtitle1" color="error.main" fontWeight={600}>
                  违约金
                </Typography>
              }
              helperText={
                <Stack direction="row" alignItems="center">
                  <Typography variant="caption">
                    建议违约金为租金的30%，建议价格：{fCurrency(price * 0.3)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="common.white"
                    component={ButtonBase}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: 'primary.main',
                      borderRadius: 0.5,
                      px: 1,
                      py: 0,
                      ml: 0.5,
                      flexShrink: 0,
                    }}
                    onClick={() => {
                      setValue('penaltyFee', Number(fNumber(price * 0.3, { useGrouping: false })));
                    }}
                  >
                    使用
                  </Typography>
                </Stack>
              }
              type="number"
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  inputProps: {
                    maxLength: 8,
                  },
                  startAdornment: adornment1,
                },
              }}
            />
          )}

          {/* 租满后资产归属顾客 */}
          <Field.Switch name="assetBelongToCustomer" label="租满后资产归属顾客" sx={{ ml: -1.5 }} />
        </Stack>
      </Scrollbar>
    </FormDialog>
  );
}
