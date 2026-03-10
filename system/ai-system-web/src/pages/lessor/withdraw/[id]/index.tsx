'use client';

import { useParams } from 'react-router';

import LessorWithdrawDetailView from 'src/sections/lessor/withdraw/view/lessor-withdraw-detail-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '提现详情',
  description: '查看提现单详情和状态',
};

export default function Page() {
  const params = useParams();
  const id = params.id;

  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      {id && <LessorWithdrawDetailView />}
    </>
  );
}
