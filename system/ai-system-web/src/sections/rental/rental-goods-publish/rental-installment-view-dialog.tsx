import type { GridColDef } from '@mui/x-data-grid';
import type { DialogProps } from '@toolpad/core/useDialogs';
import type { RentalPlanSchemaType } from './new-eidt-rental-form';

import dayjs from 'dayjs';
import { useMemo } from 'react';

import { DataGrid } from '@mui/x-data-grid';
import { Box, Stack, Typography } from '@mui/material';

import { fCurrency } from 'src/utils/format-number';

import { Scrollbar } from 'src/components/scrollbar';
import { MyDialog } from 'src/components/custom/my-dialog';

import { RENTAL_TYPE_DAYS_DICT } from '../constants/rental-plan';

type PayloadData = {
  plan: RentalPlanSchemaType;
  startDate?: Date;
};
// 查看分期计划弹框
export function InstallmentPlanPreviewDialog(props: DialogProps<PayloadData, void>) {
  const { open, onClose, payload } = props;
  const { plan, startDate = new Date() } = payload;
  const { rentalPeriod, rentalType, price } = plan;
  const columns = useMemo(
    () =>
      [
        {
          field: 'period',
          headerName: '期数',
          width: 80,
          align: 'center',
          headerAlign: 'center',
        },
        {
          field: 'paymentDate',
          headerName: '应付时间',
          flex: 1,
          align: 'center',
          headerAlign: 'center',
          renderCell: (params) => (
            <Stack height={64} alignItems="center" justifyContent="center">
              <Typography variant="body2">{params.value.split(' ')[0]}</Typography>
              <Typography variant="body2">{params.value.split(' ')[1]}</Typography>
            </Stack>
          ),
        },
        {
          field: 'amount',
          headerName: '支付金额',
          width: 120,
          align: 'center',
          headerAlign: 'center',
        },
      ] as GridColDef[],
    []
  );
  const rows = useMemo(() => {
    const data = [];
    const days = RENTAL_TYPE_DAYS_DICT[rentalType];
    const now = dayjs(startDate);
    for (let i = 0; i < rentalPeriod; i++) {
      data.push({
        id: i + 1,
        period: i + 1,
        paymentDate: (i > 0
          ? now.add(i * days, 'day').endOf('day')
          : now.add(i * days, 'day')
        ).format('YYYY-MM-DD HH:mm:ss'),
        amount: fCurrency(price),
      });
    }
    return data;
  }, [rentalType, startDate, rentalPeriod, price]);

  return (
    <MyDialog
      open={open}
      onClose={() => onClose?.()}
      cancelButtonProps={{ sx: { display: 'none' } }}
      okButtonProps={{ onClick: () => onClose?.() }}
      dialogTitle="分期计划"
      slotProps={{
        paper: {
          sx: {
            border: (theme) => `1px solid ${theme.vars.palette.divider}`,
          },
        },
      }}
    >
      <Box sx={{ py: 0, height: '60vh' }}>
        {/* 没有分页，隐藏筛选烂 */}
        <DataGrid
          showCellVerticalBorder
          showColumnVerticalBorder
          rows={rows}
          rowHeight={64}
          columns={columns}
          hideFooterPagination
          showToolbar={false}
          disableColumnSorting
          disableColumnFilter
          disableColumnResize
          disableColumnMenu
          disableColumnSelector
        />
        <Typography variant="body2" sx={{ color: 'info.main', m: 2 }}>
          具体时间以实际收货时间为准
        </Typography>
      </Box>
    </MyDialog>
  );
}
