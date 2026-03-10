'use client';

import { PaymentProcessingView } from 'src/sections/payment/view/payment-processing-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '支付处理中',
  description: '支付处理中页面 - 正在处理您的支付请求',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <PaymentProcessingView />
    </>
  );
}
