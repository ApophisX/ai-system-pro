'use client';

import { MyCommunityView } from 'src/sections/community/my/view';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

const metadata = {
  title: '我的社区',
  description: '查看我加入的社区和我创建的社区。',
};

export default function Page() {
  return (
    <AuthGuard>
      <>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <MyCommunityView />
      </>
    </AuthGuard>
  );
}
