'use client';

import { useParams } from 'src/routes/hooks';

import { RentalGoodsPublishView } from 'src/sections/rental/rental-goods-publish/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '资产编辑',
  description: '编辑我发布的资产',
};

export default function Page() {
  const { id = '' } = useParams();
  const assetId = id as string;
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <RentalGoodsPublishView id={assetId} />
    </>
  );
}
