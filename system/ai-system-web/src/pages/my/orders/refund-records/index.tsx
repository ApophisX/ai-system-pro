'use client';

import { useParams } from 'react-router';

import { OrderRefundRecordsView } from 'src/sections/order/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '退款记录',
  description: '订单退款记录',
};

export default function Page() {
  const params = useParams();
  const id = params.id;

  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      {id && <OrderRefundRecordsView id={id} />}
    </>
  );
}
