'use client';

import { RentalOrderConfirmView } from 'src/sections/rental/rental-order-confirm/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '订单确认',
  description: '确认租赁商品订单信息，包括商品详情、租赁时间、费用明细和支付方式',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <RentalOrderConfirmView />
    </>
  );
}
