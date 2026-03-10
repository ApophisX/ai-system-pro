import { EnterpriseVerifyView } from 'src/sections/my/enterprise-verify/view';

// ----------------------------------------------------------------------

const metadata = {
  // title: '企业认证',
  // description: '企业认证 - 完成企业认证，入驻平台成为商户',
  title: '合作商认证',
  description: '合作商认证 - 完成合作商认证，入驻平台成为合作商',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <EnterpriseVerifyView />
    </>
  );
}
