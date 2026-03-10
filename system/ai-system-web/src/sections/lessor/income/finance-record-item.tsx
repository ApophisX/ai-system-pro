import type { Theme } from '@mui/material';
import type { IconifyName } from 'src/components/iconify';

import { m } from 'framer-motion';
import { varAlpha } from 'minimal-shared/utils';

import { Box, Stack, Typography } from '@mui/material';

import { fDateTime } from 'src/utils';

import { Iconify } from 'src/components/iconify';
import { CurrencyTypography } from 'src/components/custom';
import { HorizontalStack } from 'src/components/custom/layout';

type FinanceRecordItemProps = {
  item: MyApi.OutputFinanceDto;
  index: number;
};

function getStatusColor(item: MyApi.OutputFinanceDto, reversed: boolean = false) {
  switch (item.status) {
    case 'pending':
      return 'warning.main';
    case 'confirmed':
      return item.isIncome && reversed ? 'error.main' : 'success.main';
    default:
      return 'text.disabled';
  }
}
function getStatusBgColor(theme: Theme, item: MyApi.OutputFinanceDto) {
  switch (item.status) {
    case 'pending':
      return varAlpha(theme.vars.palette.warning.mainChannel, 0.15);
    case 'confirmed':
      return item.isIncome
        ? varAlpha(theme.vars.palette.success.mainChannel, 0.15)
        : varAlpha(theme.vars.palette.error.mainChannel, 0.15);
    default:
      return varAlpha(theme.vars.palette.grey['500Channel'], 0.15);
  }
}

function getStatusIcon(item: MyApi.OutputFinanceDto): IconifyName {
  switch (item.status) {
    case 'pending':
      return 'material-symbols:arming-countdown-outline';
    case 'confirmed':
      return item.isIncome ? 'eva:checkmark-circle-2-outline' : 'eva:external-link-fill';
    default:
      return 'solar:close-circle-bold';
  }
}

export function FinanceRecordItem({ item, index }: FinanceRecordItemProps) {
  return (
    <Stack
      key={item.id}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ p: 2 }}
      component={m.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: (index % 10) * 0.05 }}
      spacing={1}
    >
      <HorizontalStack>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: (theme) => getStatusBgColor(theme, item),
            color: getStatusColor(item),
            flexShrink: 0,
          }}
        >
          <Iconify
            icon={getStatusIcon(item)}
            width={24}
            sx={{
              color: item.direction === 'expense' && item.isConfirmed ? 'error.main' : undefined,
            }}
          />
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', wordBreak: 'break-all' }}>
            {item.isIncome ? item.incomeTypeLabel : item.expenseTypeLabel}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {fDateTime(item.confirmedAt || item.businessOccurredAt)}
          </Typography>
        </Box>
      </HorizontalStack>

      <Stack sx={{ textAlign: 'right', flexShrink: 0 }}>
        <CurrencyTypography
          color={getStatusColor(item, true)}
          currency={item.amount}
          fontSize={16}
          isNegative={item.isExpense}
          disableDivide
          showSign={item.isIncome}
          slotProps={{
            integer: {
              sx: {
                fontWeight: 700,
                textDecoration: item.isCancelled ? 'line-through' : 'none',
              },
            },
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {item.statusLabel}
        </Typography>
      </Stack>
    </Stack>
  );
}
