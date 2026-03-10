import { Stack, Button, Container, CircularProgress } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useParams } from 'src/routes/hooks/use-params';

import { useGetAssetInventoryById } from 'src/actions/assets';

import { Scrollbar } from 'src/components/scrollbar';
import { MobileLayout } from 'src/components/custom/layout';
import { EmptyContent } from 'src/components/empty-content';

import { InventoryInstanceFormContent } from '../inventory-instance-form-content';

// ----------------------------------------------------------------------

export function LessorAssetInventoryEditView() {
  const params = useParams();
  const assetId = (params.id ?? '') as string;
  const instanceId = (params.instanceId ?? '') as string;
  const router = useRouter();

  const { data: instance, dataLoading } = useGetAssetInventoryById(instanceId || null);

  const handleSuccess = () => {
    router.back();
  };

  if (dataLoading) {
    return (
      <MobileLayout appTitle="编辑实例" >
        <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
          <CircularProgress />
        </Stack>
      </MobileLayout>
    );
  }

  if (!instance) {
    return (
      <MobileLayout appTitle="编辑实例" >
        <EmptyContent
          title="实例不存在"
          description="该实例可能已删除"
          action={
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => router.replace(paths.lessor.assets.inventory.list(assetId))}
            >
              返回实例列表
            </Button>
          }
        />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      appTitle="编辑实例"
    >
      <InventoryInstanceFormContent
        assetId={assetId}
        instance={instance}
        onSuccess={handleSuccess}
      />
    </MobileLayout>
  );
}
