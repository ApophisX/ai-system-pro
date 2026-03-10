'use client';

import LessorAssetsView from 'src/sections/lessor/assets/view/lessor-assets-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '我的资产',
  description: '管理我发布的租赁资产',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <LessorAssetsView />
    </>
  );
}
