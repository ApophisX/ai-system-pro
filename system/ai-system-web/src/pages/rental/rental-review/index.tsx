'use client';

import { RentalReviewListView } from 'src/sections/rental-review/view/rental-review-list-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '全部评价',
  description: '查看租赁商品的全部用户评价',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <RentalReviewListView />
    </>
  );
}
