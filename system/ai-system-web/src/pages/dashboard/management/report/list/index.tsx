'use client';

import { CONFIG } from 'src/global-config';

import { AdminReportListView } from 'src/sections/dashboard/report/view/admin-report-list-view';

// ----------------------------------------------------------------------

const metadata = {
  title: `举报管理 | 后台 - ${CONFIG.appName}`,
  description: '平台举报管理 - 审核举报、驳回、标记恶意举报',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <AdminReportListView />
    </>
  );
}
