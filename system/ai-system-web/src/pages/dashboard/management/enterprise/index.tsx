import { CONFIG } from 'src/global-config';

import { EnterpriseManagementView } from 'src/sections/dashboard/enterprise/view/enterprise-management-view';

// ----------------------------------------------------------------------

const metadata = {
  title: `企业管理 | 后台 - ${CONFIG.appName}`,
  description: '企业认证申请查看与审核',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <EnterpriseManagementView />
    </>
  );
}
