import { CONFIG } from 'src/global-config';

import { AdminAssetListView } from 'src/sections/dashboard/asset/view/admin-asset-list-view';

// ----------------------------------------------------------------------

const metadata = {
  title: `资产管理 | 后台 - ${CONFIG.appName}`,
  description: '平台资产管理 - 审核、下架资产',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <AdminAssetListView />
    </>
  );
}
