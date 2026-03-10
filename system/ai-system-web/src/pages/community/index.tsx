'use client';

import { CommunityListView } from 'src/sections/community/list/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '社区',
  description: '发现和加入感兴趣的社区，浏览社区内的租赁商品和电商商品。',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <CommunityListView />
    </>
  );
}
