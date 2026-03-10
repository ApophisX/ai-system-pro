'use client';

import { LessorAssetInventoryView } from 'src/sections/lessor/assets/inventory/view/lessor-asset-inventory-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '资产实例',
  description: '查看资产下的所有实例及库存状态',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <LessorAssetInventoryView />
    </>
  );
}
