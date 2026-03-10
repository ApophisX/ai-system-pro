'use client';

import LessorWithdrawView from 'src/sections/lessor/withdraw/view/lessor-withdraw-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '提现',
  description: '提现管理 - 申请提现、查看提现记录',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <LessorWithdrawView />
    </>
  );
}
