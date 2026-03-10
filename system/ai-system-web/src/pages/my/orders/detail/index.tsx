'use client';

import { OrderDetailView } from 'src/sections/order/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '订单详情',
  description: '查看订单详细信息',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <OrderDetailView />
    </>
  );
}
