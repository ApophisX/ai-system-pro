'use client';

import { CommunityDetailView } from 'src/sections/community/detail/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '社区详情',
  description: '查看社区详情',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <CommunityDetailView />
    </>
  );
}
