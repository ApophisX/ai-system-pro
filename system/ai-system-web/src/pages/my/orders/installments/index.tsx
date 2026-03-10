'use client';

import { InstallmentDetailView } from 'src/sections/order/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '分期详情',
  description: '查看订单分期支付详情',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <InstallmentDetailView readonly={false} />
    </>
  );
}
