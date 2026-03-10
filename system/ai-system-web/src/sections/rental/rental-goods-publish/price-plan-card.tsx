import type { RentalGoodsPublishSchemaType } from './new-eidt-rental-form';

import { useFormContext } from 'react-hook-form';

import { Box, Paper, Stack, Button, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { CurrencyTypography, HorizontalStack } from 'src/components/custom';

type PricePlanCardProps = {
  index: number;
  count: number;
  onEdit: () => void;
  onDelete: () => void;
};

export function PricePlanCard({ index, count, onEdit, onDelete }: PricePlanCardProps) {
  const { watch } = useFormContext<RentalGoodsPublishSchemaType>();
  const field = watch(`rentalPlans.${index}`);

  const name = field?.name || '';
  const price = field?.price ?? 0;
  const attributes = field?.attributes as Record<string, string> | undefined;
  const attributesText =
    attributes && Object.keys(attributes).length > 0
      ? Object.entries(attributes)
          .filter(([k]) => k?.trim())
          .map(([k, v]) => `${k}: ${v}`)
          .join('、')
      : '';

  return (
    <Paper
      sx={{
        p: 2,
        border: (theme) => `1px dashed ${theme.vars.palette.divider}`,
      }}
    >
      <HorizontalStack justifyContent="space-between" sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {name || `方案${index + 1}`}
        </Typography>
        <CurrencyTypography fontSize={28} currency={price} disableDivide color="error.main" />
      </HorizontalStack>

      {attributesText && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {attributesText}
        </Typography>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {field?.minPeriod} 件起购，最多可购 {field?.maxPeriod} 件
      </Typography>
      <Stack justifyContent="flex-end" direction="row" spacing={1} sx={{ flexShrink: 0, mt: 1 }}>
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
