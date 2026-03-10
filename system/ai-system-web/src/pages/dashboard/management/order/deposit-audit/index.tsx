import { CONFIG } from 'src/global-config';

import { DepositAuditView } from 'src/sections/dashboard/order/deposit-audit/view/deposit-audit-view';

// ----------------------------------------------------------------------

const metadata = {
  title: `押金审核 | 后台 - ${CONFIG.appName}`,
  description: '争议押金扣款审核',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <DepositAuditView />
    </>
  );
}
