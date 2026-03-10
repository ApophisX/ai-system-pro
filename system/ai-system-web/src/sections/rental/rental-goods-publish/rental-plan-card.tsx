import type { RentalGoodsPublishSchemaType } from './new-eidt-rental-form';

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { Paper, Stack, Button, Typography, Box, Chip } from '@mui/material';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { AmountTypography } from 'src/components/custom/amount-typography';

import {
  RENTAL_TYPE_LABELS,
  OVERDUEFEE_UNIT_DICT,
  RENTAL_TYPE_DAYS_DICT,
  RENTAL_TYPE_DICT_LABEL,
  RENTAL_TYPE_UNIT_LABELS,
} from '../constants/rental-plan';

type RentalPackageProps = {
  index: number;
  count: number;
  onEdit: () => void;
  onDelete: () => void;
  onMove: () => void;
};
export function RentalPlanCard({ index, count, onEdit, onDelete, onMove }: RentalPackageProps) {
  const { watch } = useFormContext<RentalGoodsPublishSchemaType>();
  const field = watch(`rentalPlans.${index}`);

  const descText = useMemo(() => {
    const desc: string[] = [];
    // if (field.deposit > 0) {
    //   desc.push(`押金 ${fCurrency(field.deposit)}`);
    // }
    if (field.overdueFee > 0) {
      desc.push(
        `逾期费 ${fCurrency(field.overdueFee)}/${OVERDUEFEE_UNIT_DICT[field.overdueFeeUnit]}`
      );
    }
    if (field.penaltyFee > 0) {
      desc.push(`违约金 ${fCurrency(field.penaltyFee)}`);
    }
    return desc.join('，');
  }, [field]);

  return (
    <Paper
      sx={{
        p: 2,
        border: (theme) => `1px dashed ${theme.vars.palette.divider}`,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6">{field.name ? field.name : `方案${index + 1}`}</Typography>
            {field.rentalPeriod > 1 && (
              <Label variant="soft" color="info">
                分 {field.rentalPeriod} 期
              </Label>
            )}
            {field.transferOwnershipAfterRental && (
              <Label variant="soft" color="info">
                租满即送
              </Label>
            )}
          </Stack>
          <Box>
            <AmountTypography
              color="error.main"
              amount={field.price}
              prefix="¥"
              unit={`/ ${RENTAL_TYPE_UNIT_LABELS[field.rentalType]}`}
              slotProps={{
                prefix: { color: 'text.secondary' },
              }}
            />
            {field.rentalPeriod > 1 && (
              <Typography component="div" variant="caption" color="text.secondary" fontWeight={600}>
                总租金 {fCurrency(field.price * field.rentalPeriod)}，日均{' '}
                {fCurrency(field.price / RENTAL_TYPE_DAYS_DICT[field.rentalType])}
              </Typography>
            )}
            {descText && (
              <Typography component="div" variant="caption" color="text.secondary" fontWeight={600}>
                {descText}
              </Typography>
            )}
          </Box>
        </Box>
        <Chip
          label={RENTAL_TYPE_LABELS[field.rentalType]}
          color="primary"
          size="small"
          variant="filled"
          sx={{ borderRadius: 0.5, alignSelf: 'flex-start' }}
        />
      </Stack>
      <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
        {index > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="eva:arrow-ios-upward-fill" width={16} height={16} />}
            onClick={onMove}
          >
            置顶
          </Button>
        )}
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="solar:pen-bold" width={16} height={16} />}
          onClick={onEdit}
        >
          编辑
        </Button>
        {count > 1 && (
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={16} height={16} />}
            onClick={onDelete}
          >
            删除
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
