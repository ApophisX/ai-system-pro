'use client';

import { BindAssetView } from 'src/sections/lessor/orders/bind-asset/bind-asset-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '绑定资产',
  description: '为订单绑定资产实例',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <BindAssetView />
    </>
  );
}
