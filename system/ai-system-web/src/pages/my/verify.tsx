import { VerifyView } from 'src/sections/my/verify/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '实名认证',
  description: '实名认证 - 完善个人信息，提升账户安全性',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <VerifyView />
    </>
  );
}
