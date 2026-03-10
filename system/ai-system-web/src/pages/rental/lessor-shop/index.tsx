'use client';

import { LessorShopView } from 'src/sections/rental/lessor-shop/view/lessor-shop-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '店铺信息',
  description: '浏览出租方的全部出租资产，扫码或通过链接访问',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <LessorShopView />
    </>
  );
}
