'use client';

import { RebindAssetView } from 'src/sections/lessor/orders/rebind-asset/rebind-asset-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '换绑资产',
  description: '为订单换绑资产实例',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <RebindAssetView />
    </>
  );
}
