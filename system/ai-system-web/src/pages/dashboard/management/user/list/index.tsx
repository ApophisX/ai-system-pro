'use client';

import { CONFIG } from 'src/global-config';

import { AdminUserListView } from 'src/sections/dashboard/user/view/admin-user-list-view';

// ----------------------------------------------------------------------

const metadata = {
  title: `用户管理 | 后台 - ${CONFIG.appName}`,
  description: '平台用户管理 - 查看、封禁、解封、冻结、解冻用户',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <AdminUserListView />
    </>
  );
}
