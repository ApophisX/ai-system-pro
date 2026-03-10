'use client';

import { OrderPaymentsView } from 'src/sections/order/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '支付明细',
  description: '查看订单已支付或部分支付的账单明细',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <OrderPaymentsView />
    </>
  );
}
