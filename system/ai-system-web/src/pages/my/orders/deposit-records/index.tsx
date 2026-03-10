'use client';

import { useParams } from 'react-router';

import { OrderDepositRecordsView } from 'src/sections/order/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '押金记录',
  description: '订单押金记录',
};

export default function Page() {
  const params = useParams();
  const id = params.id;

  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      {id && <OrderDepositRecordsView id={id} />}
    </>
  );
}
