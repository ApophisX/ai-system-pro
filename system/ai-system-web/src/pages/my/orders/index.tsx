'use client';

import { OrderListView } from 'src/sections/order/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '我的订单',
  description: '查看和管理我的租赁订单',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <OrderListView />
    </>
  );
}
