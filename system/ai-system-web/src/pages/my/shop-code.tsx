// ----------------------------------------------------------------------

import { ShopCodeView } from 'src/sections/my/shop-code/view';

const metadata = {
  title: '二维码',
  description: '二维码 - 查看我的二维码，邀请好友注册体验，赢取积分奖励',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <ShopCodeView />
    </>
  );
}
