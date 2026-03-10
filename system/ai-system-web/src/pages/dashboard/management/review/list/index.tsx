'use client';

import { CONFIG } from 'src/global-config';

import { AdminReviewListView } from 'src/sections/dashboard/review/view/admin-review-list-view';

// ----------------------------------------------------------------------

const metadata = {
  title: `评论管理 | 后台 - ${CONFIG.appName}`,
  description: '平台评论管理 - 审核、隐藏评价',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <AdminReviewListView />
    </>
  );
}
