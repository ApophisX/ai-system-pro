import { Stack, Skeleton, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter, useParams } from 'src/routes/hooks';

import { ORDER_EVENT_NAME } from 'src/constants';
import { useGetAssetInventory } from 'src/actions/assets';
import { useGetLessorOrderDetail } from 'src/actions/order';

import { MobileLayout } from 'src/components/custom/layout';
import { ListEmptyContent } from 'src/components/empty-content';

import { RebindAssetFormContent } from './rebind-asset-form-content';

// ----------------------------------------------------------------------

const Layout = ({ children }: { children: React.ReactNode }) => (
  <MobileLayout appTitle="换绑资产" containerProps={{ sx: { px: 2 } }}>
    {children}
  </MobileLayout>
);

export function RebindAssetView() {
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
        <ListEmptyContent title="无法换绑" description="该订单暂无关联资产，无法进行换绑操作" />
      </Layout>
    );
  }

  if (!order.inventoryId || !order.inventory) {
    return (
      <Layout>
        <ListEmptyContent
          title="无法换绑"
          description="该订单尚未绑定资产实例，请先进行绑定操作"
          action={
            <Typography variant="body2" color="text.secondary">
              换绑仅适用于已绑定实例的订单
            </Typography>
          }
        />
      </Layout>
    );
  }

  return <RebindAssetViewContent order={order} onSuccess={handleSuccess} />;
}

type RebindAssetViewContentProps = {
  order: MyApi.OutputRentalOrderDto;
  onSuccess: () => void;
};

function RebindAssetViewContent({ order, onSuccess }: RebindAssetViewContentProps) {
  const inventory = useGetAssetInventory({
    assetId: order.assetId,
    status: 'available',
    pageSize: 10,
  });
  const { data: instances, dataLoading: instancesLoading, isFirstDataLoading } = inventory;
  const currentInventoryId = order.inventoryId ?? '';
  const availableInstances = instances.filter((e) => e.id !== currentInventoryId);

  return (
    <Layout>
      {isFirstDataLoading || instancesLoading ? (
        <Stack spacing={3} sx={{ py: 3 }}>
          <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" height={150} sx={{ borderRadius: 2 }} />
        </Stack>
      ) : availableInstances.length === 0 ? (
        <ListEmptyContent
          title="暂无可换绑的实例"
          description="该资产下暂无其他「可用」状态的实例，无法进行换绑。如需换绑，请先在资产管理中创建或调整实例状态。"
        />
      ) : (
        <RebindAssetFormContent order={order} onSuccess={onSuccess} />
      )}
    </Layout>
  );
}
