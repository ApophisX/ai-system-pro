import { MerchantInviteView } from 'src/sections/my/merchant-invite/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '商户邀请',
  description: '商户邀请 - 邀请商户入驻，获得分润奖励',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <MerchantInviteView />
    </>
  );
}
