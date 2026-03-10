'use client';

import { LessorAssetInventoryEditView } from 'src/sections/lessor/assets/inventory/view/lessor-asset-inventory-edit-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '编辑实例',
  description: '修改资产实例信息',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <LessorAssetInventoryEditView />
    </>
  );
}
