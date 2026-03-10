'use client';

import { RentalGoodsPublishView } from 'src/sections/rental/rental-goods-publish/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '发布商品',
  description:
    '发布您的商品，让更多人了解并使用您的物品。填写商品信息，设置价格和条件，轻松开始您的业务。',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <RentalGoodsPublishView />
    </>
  );
}
