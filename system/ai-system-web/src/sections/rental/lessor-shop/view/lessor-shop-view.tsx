import { useParams } from 'react-router';
import React, { useMemo, useEffect } from 'react';

import { Box } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useGetAssets } from 'src/actions/assets';
import { useGetCurrentArea } from 'src/layouts/global/hooks/use-area';

import { ListEmptyContent } from 'src/components/empty-content';

import { LessorShopHeader } from '../lessor-shop-header';
import { GoodsWaterfall } from '../../rental-goods/goods-waterfall';

// ----------------------------------------------------------------------

export function LessorShopView() {
  const params = useParams();
  const lessorId = params.lessorId;
  const router = useRouter();

  const emptyContent = useMemo(
    () => <ListEmptyContent title="该出租方暂无出租资产" description="去看看其他店铺吧~" />,
    []
  );

  useEffect(() => {
    if (!lessorId) {
      router.replace('/');
    }
  }, [lessorId, router]);

  if (!lessorId) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 18 }}>
        <ListEmptyContent title="链接无效" description="请通过正确的扫码或链接访问" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        overflowX: 'hidden',
      }}
    >
      <LessorShopHeaderWithData lessorId={lessorId} />

      <GoodsWaterfall
        category="all"
        sortBy="recommend"
        lessorId={lessorId}
        slot={{ emptyContent }}
      />
    </Box>
  );
}

/**
 * 带数据源的店铺头部，从首条资产获取出租方信息
 */
function LessorShopHeaderWithData({ lessorId }: { lessorId: string }) {
  const { currentArea } = useGetCurrentArea();

  const { allData: assets, dataLoading } = useGetAssets({
    page: 0,
    pageSize: 1,
    lessorId,
    provinceCode: currentArea.province?.value,
    cityCode: currentArea.city?.value,
    districtCode: currentArea.district?.value,
  });

  const owner = assets.length > 0 ? assets[0].owner : null;

  return <LessorShopHeader owner={owner} loading={dataLoading} />;
}
