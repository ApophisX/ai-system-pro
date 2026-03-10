'use client';

import { useParams } from 'react-router';

import { ReportView } from 'src/sections/rental/report/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '举报违规信息',
  description: '举报违规的资产发布信息，维护平台良好的租赁环境',
};

export default function Page() {
  const params = useParams();
  const assetId = params.id;

  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      {assetId && <ReportView assetId={assetId} />}
    </>
  );
}
