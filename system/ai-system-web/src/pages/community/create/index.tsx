'use client';

import { CreateCommunityView } from 'src/sections/community/create/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '创建社区',
  description: '创建您的社区，聚合租赁商品和电商商品，与志同道合的用户一起分享。',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <CreateCommunityView />
    </>
  );
}
