'use client';

import { RentalGoodsDetailView } from 'src/sections/rental/rental-goods-detail/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '商品详情',
  description: '查看租赁商品详细信息，包括价格、租金、商品描述等',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <RentalGoodsDetailView />
    </>
  );
}
