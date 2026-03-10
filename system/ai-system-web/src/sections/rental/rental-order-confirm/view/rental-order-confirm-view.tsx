import React, { useEffect } from 'react';

import { Box, Stack } from '@mui/material';

import { useRouter, useParams } from 'src/routes/hooks';

import { useGetAssetDetail } from 'src/actions/assets';

import { MyAppBar } from 'src/components/custom/my-app-bar';
import { EmptyContent } from 'src/components/empty-content';
import { MobileLayout } from 'src/components/custom/layout';

import { useAuthContext } from 'src/auth/hooks';

import { RentalOrderConfirmContent } from '../rental-order-confirm-content';

// ----------------------------------------------------------------------

export const RentalOrderConfirmView: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;

  const { data: assetDetail, dataLoading } = useGetAssetDetail(false, assetId);

  const { user, checkUserSession } = useAuthContext();

  const handleSuccess = (orderId: string) => {
    // TODO: 跳转到订单详情页或支付页面
    // router.push(paths.order.detail(orderId));
    // 或者跳转到支付页面
    // router.push(paths.payment.order(orderId));
    router.back();
  };

  useEffect(() => {
    checkUserSession?.();
  }, [checkUserSession]);

  if (dataLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <MyAppBar appTitle="订单确认" />
        <Stack spacing={1.5} sx={{ pt: 1.5 }}>
          <Box sx={{ height: 200, bgcolor: 'background.paper' }} />
          <Box sx={{ height: 300, bgcolor: 'background.paper' }} />
          <Box sx={{ height: 400, bgcolor: 'background.paper' }} />
        </Stack>
      </Box>
    );
  }

  if (!assetDetail) {
    return <EmptyContent title="资产不存在" />;
  }

  return (
    <MobileLayout appTitle="订单确认" containerProps={{ sx: { px: 0, pb: 22 } }}>
      <RentalOrderConfirmContent assetDetail={assetDetail} onSuccess={handleSuccess} />
    </MobileLayout>
  );
};
