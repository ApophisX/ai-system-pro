'use client';

import { CreateRentalReviewView } from 'src/sections/rental-review/view/create-rental-review-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '写评价',
  description: '对已完成的租赁订单发表评价',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <CreateRentalReviewView />
    </>
  );
}
