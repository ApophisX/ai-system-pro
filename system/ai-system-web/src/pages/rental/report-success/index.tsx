'use client';

import { useEffect } from 'react';
import { useParams } from 'react-router';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { ReportSuccessView } from 'src/sections/rental/report/view/report-success-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '举报成功',
  description: '举报已成功提交，感谢您的反馈',
};

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.id ?? '';

  useEffect(() => {
    if (!assetId) {
      router.replace(paths.home.root);
    }
  }, [assetId, router]);

  if (!assetId) {
    return null;
  }

  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <ReportSuccessView assetId={assetId} />
    </>
  );
}
