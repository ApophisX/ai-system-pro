'use client';

import { RentalCategoryView } from 'src/sections/rental/rental-category/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '租赁分类',
  description: '浏览所有租赁分类，找到您需要的商品类别，轻松租赁心仪物品！',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <RentalCategoryView />
    </>
  );
}
