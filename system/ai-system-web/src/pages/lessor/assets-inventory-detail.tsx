'use client';

import { LessorAssetInventoryDetailView } from 'src/sections/lessor/assets/inventory/view/lessor-asset-inventory-detail-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '实例详情',
  description: '查看资产实例详情',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <LessorAssetInventoryDetailView />
    </>
  );
}
