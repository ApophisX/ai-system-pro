'use client';

import { CommunitySearchListView } from 'src/sections/community/list/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '社区搜索',
  description: '搜索社区，发现和加入感兴趣的社区。',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <CommunitySearchListView />
    </>
  );
}
