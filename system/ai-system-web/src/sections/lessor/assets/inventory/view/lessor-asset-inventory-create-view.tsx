import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useParams } from 'src/routes/hooks/use-params';

import { MobileLayout } from 'src/components/custom/layout';

import { InventoryInstanceFormContent } from '../inventory-instance-form-content';

// ----------------------------------------------------------------------

export function LessorAssetInventoryCreateView() {
  const { id = '' } = useParams();
  const assetId = id as string;
  const router = useRouter();

  const handleSuccess = () => {
    router.replace(paths.lessor.assets.inventory.list(assetId));
  };

  return (
    <MobileLayout appTitle="创建实例">
      <InventoryInstanceFormContent assetId={assetId} onSuccess={handleSuccess} />
    </MobileLayout>
  );
}
