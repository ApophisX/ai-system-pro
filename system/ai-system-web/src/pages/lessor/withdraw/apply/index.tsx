'use client';

import LessorWithdrawApplyView from 'src/sections/lessor/withdraw/view/lessor-withdraw-apply-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '申请提现',
  description: '填写提现金额和账户信息，申请提现',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <LessorWithdrawApplyView />
    </>
  );
}
