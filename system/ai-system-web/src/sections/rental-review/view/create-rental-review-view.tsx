import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { Stack, Button, Skeleton, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import API from 'src/services/API';

import { FadeInPaper } from 'src/components/custom';
import { MobileLayout } from 'src/components/custom/layout';
import { EmptyContent } from 'src/components/empty-content';

import { CreateRentalReviewFormContent } from '../create-rental-review-form-content';

// ----------------------------------------------------------------------

export function CreateRentalReviewView() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id ?? '';

  const { data: orderRes, isLoading } = useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: () =>
      API.AppRentalOrderLessee.AppRentalOrderLesseeControllerGetOrderByIdV1({ id: orderId }),
    enabled: !!orderId,
  });
  const order = orderRes?.data?.data;

  if (!orderId) {
    return (
      <MobileLayout appTitle="写评价">
        <EmptyContent
          title="订单不存在"
          description="请从订单详情页进入"
          action={
            <Button variant="contained" onClick={() => router.replace(paths.my.orders)}>
              返回我的订单
            </Button>
          }
        />
      </MobileLayout>
    );
  }

  if (isLoading) {
    return (
      <MobileLayout appTitle="写评价">
        <Skeleton variant="rounded" height={400} />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout appTitle="写评价" containerProps={{ sx: { pb: 6 } }}>
        <FadeInPaper
          sx={{
            p: 3,
            borderRadius: 2,
            boxShadow: (theme) => theme.customShadows.z8,
          }}
        >
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              发表评价
            </Typography>
            <Typography variant="body2" color="text.secondary">
              您的评价将帮助其他用户更好地做出选择，感谢您的分享
            </Typography>
          </Stack>

          <CreateRentalReviewFormContent
            orderId={orderId}
            orderNo={order?.orderNo}
            assetName={order?.assetSnapshot?.name}
            onSuccess={router.back}
          />
        </FadeInPaper>
    </MobileLayout>
  );
}
