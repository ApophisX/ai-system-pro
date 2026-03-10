import { CONFIG } from 'src/global-config';

import { CommunityManagementView } from 'src/sections/dashboard/community/view';

// ----------------------------------------------------------------------

const metadata = {
  title: `社区管理 | 后台 - ${CONFIG.appName}`,
  description: '社区审核与管理',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <CommunityManagementView />
    </>
  );
}
