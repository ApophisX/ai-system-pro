'use client';

import { LessorOrderManagementView } from "src/sections/lessor/orders/view";



// ----------------------------------------------------------------------

const metadata = {
  title: '订单管理',
  description: '处理出租订单，确认发货和收货',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <LessorOrderManagementView />
    </>
  );
}
