'use client';

import { DepositManagementView } from 'src/sections/deposit/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '押金管理',
  description: '查看和管理我的租赁押金',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <DepositManagementView />
    </>
  );
}
