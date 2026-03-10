'use client';

import { CommunityAssetsView } from 'src/sections/community/assets/view';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

const metadata = {
  title: '社区商品',
  description: '浏览社区内的租赁商品和电商商品。',
};

export default function Page() {
  return (
    <AuthGuard>
      <>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <CommunityAssetsView />
      </>
    </AuthGuard>
  );
}
