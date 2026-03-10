'use client';

import { RentalGoodsDetailLessorView } from 'src/sections/rental/rental-goods-detail/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '资产预览',
  description: '查看我发布的资产详情',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <RentalGoodsDetailLessorView />
    </>
  );
}
