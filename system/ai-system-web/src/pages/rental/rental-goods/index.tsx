'use client';

import { RentalGoodsView } from 'src/sections/rental/rental-goods/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '租赁商品',
  description:
    '浏览海量优质租赁商品，覆盖电子数码、户外装备、摄影器材等多品类，芝麻免押，轻松租赁！',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <RentalGoodsView />
    </>
  );
}
