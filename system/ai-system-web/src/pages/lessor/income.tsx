'use client';

import LessorIncomeView from 'src/sections/lessor/income/view/lessor-income-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '收入明细',
  description: '查看我的出租收入和结算记录',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <LessorIncomeView />
    </>
  );
}
