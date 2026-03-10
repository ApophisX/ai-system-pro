'use client';

import { PaymentFailureView } from 'src/sections/payment/view/payment-failure-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '支付失败',
  description: '支付失败页面 - 支付未成功，请重试',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <PaymentFailureView />
    </>
  );
}
