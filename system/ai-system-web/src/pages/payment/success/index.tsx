'use client';

import { PaymentSuccessView } from 'src/sections/payment/view/payment-success-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '支付成功',
  description: '支付成功页面 - 您的订单已成功支付',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <PaymentSuccessView />
    </>
  );
}
