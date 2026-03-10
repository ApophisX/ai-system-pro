import { useGetAssetDetail } from 'src/actions/assets';

import { MobileLayout } from 'src/components/custom/layout';
import { LoadingScreen } from 'src/components/loading-screen';

import { NewEditRentalForm } from '../new-eidt-rental-form';

type Props = {
  id?: string;
};
export function RentalGoodsPublishView({ id }: Props) {
  const { data: assetDetail, dataLoading } = useGetAssetDetail(true, id);

  return (
    <MobileLayout appTitle={id ? '编辑资产' : '发布资产'}>
      {/* 固定顶部导航栏 */}
      {dataLoading ? (
        <LoadingScreen />
      ) : (
        <NewEditRentalForm asset={assetDetail} />
      )}
    </MobileLayout>
  );
}
