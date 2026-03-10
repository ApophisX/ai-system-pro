import { Stack } from '@mui/material';

import { useGetOrderDetail } from 'src/actions/order';

import { MobileLayout } from 'src/components/custom/layout';

import { useRefreshOrder } from '../hook';
import { DepositDeductionCard } from '../components';

// ----------------------------------------------------------------------

/**
 * 订单押金记录页面视图
 * 页面内容由业务自行填充
 */
export function OrderDepositRecordsView({ id }: { id: string }) {
  const { data: order, mutate } = useGetOrderDetail(id);

  const firstDeposit = order?.deposits?.[0];

  useRefreshOrder({ mutate });

  if (!firstDeposit) {
    return null;
  }

  const deductions = firstDeposit.deductions;

  return (
    <MobileLayout appTitle="押金扣款记录">
      <Stack spacing={2}>
        {deductions.map((deduction) => (
          <DepositDeductionCard key={deduction.id} deduction={deduction} order={order} />
        ))}
      </Stack>
    </MobileLayout>
  );
}
