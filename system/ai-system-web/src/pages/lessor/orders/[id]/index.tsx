'use client';

import { LessorOrderDetailView } from 'src/sections/lessor/orders/view/lessor-order-detail-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '订单详情',
  description: '查看出租订单的详细信息',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <LessorOrderDetailView />
    </>
  );
}

