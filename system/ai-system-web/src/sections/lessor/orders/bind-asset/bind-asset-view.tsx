import { Stack, Skeleton, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter, useParams } from 'src/routes/hooks';

import { ORDER_EVENT_NAME } from 'src/constants';
import { useGetAssetInventory } from 'src/actions/assets';
import { useGetLessorOrderDetail } from 'src/actions/order';

import { MobileLayout } from 'src/components/custom/layout';
import { ListEmptyContent } from 'src/components/empty-content';

import { BindAssetFormContent } from './bind-asset-form-content';

// ----------------------------------------------------------------------

const Layout = ({ children }: { children: React.ReactNode }) => (
  <MobileLayout appTitle="绑定资产" containerProps={{ sx: { px: 2 } }}>
    {children}
  </MobileLayout>
);

export function BindAssetView() {
  const params = useParams();
  const orderId = (params.id ?? '') as string;
  const router = useRouter();

  const { data: order, dataLoading: orderLoading } = useGetLessorOrderDetail(orderId);

  const handleSuccess = () => {
    router.replace(paths.lessor.order.detail(orderId));
    window.dispatchEvent(new CustomEvent(ORDER_EVENT_NAME.REFRESH_RENTAL_ORDER));
  };

  if (orderLoading || !order) {
    return (
      <Layout>
        <Stack spacing={3}>
          <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" height={150} sx={{ borderRadius: 2 }} />
        </Stack>
      </Layout>
    );
  }

  if (!order.assetId) {
    return (
      <Layout>
        <ListEmptyContent title="无法绑定" description="该订单暂无关联资产，无法进行绑定操作" />
      </Layout>
    );
  }
  if (order.inventoryId) {
    return (
      <Layout>
        <ListEmptyContent
          title="已绑定"
          description="该订单已绑定资产实例，无法进行绑定操作"
          action={
            <Typography variant="body2" color="text.secondary">
              {order.inventory?.instanceName} - {order.inventory?.instanceCode}
            </Typography>
          }
        />
      </Layout>
    );
  }

  return <BindAssetViewContent order={order} onSuccess={handleSuccess} />;
}

type BindAssetViewContentProps = {
  order: MyApi.OutputRentalOrderDto;
  onSuccess: () => void;
};

function BindAssetViewContent({ order, onSuccess }: BindAssetViewContentProps) {
  const inventory = useGetAssetInventory({ assetId: order.assetId, status: 'available' });
  const { allData: instances, dataLoading: instancesLoading, isFirstDataLoading } = inventory;

  return (
    <Layout>
      {isFirstDataLoading || instancesLoading ? (
        <Stack spacing={3} sx={{ py: 3 }}>
          <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" height={150} sx={{ borderRadius: 2 }} />
        </Stack>
      ) : instances.length === 0 ? (
        <ListEmptyContent
          title="暂无可绑定的实例"
          description="该资产下暂无「可用」状态的实例，请先在资产管理中创建或调整实例状态"
        />
      ) : (
        <BindAssetFormContent order={order} onSuccess={onSuccess} />
      )}
    </Layout>
  );
}
