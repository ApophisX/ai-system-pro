'use client';

import { LessorAssetInventoryCreateView } from 'src/sections/lessor/assets/inventory/view/lessor-asset-inventory-create-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '创建实例',
  description: '为资产创建可租赁的库存实例',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <LessorAssetInventoryCreateView />
    </>
  );
}
