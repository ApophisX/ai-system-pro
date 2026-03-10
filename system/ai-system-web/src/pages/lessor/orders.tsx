'use client';

import LessorOrderListView from 'src/sections/lessor/orders/view/lessor-order-list-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '出租订单',
  description: '查看和管理我的所有出租订单',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <LessorOrderListView />
    </>
  );
}
