'use client';

import { FavoriteListView } from 'src/sections/favorite/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '我的收藏',
  description: '查看我收藏的租赁资产',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <FavoriteListView />
    </>
  );
}
