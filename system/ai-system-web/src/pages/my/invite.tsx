import { InviteView } from 'src/sections/my/invite/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '邀请好友',
  description: '邀请好友 - 邀请好友注册体验，赢取积分奖励',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <InviteView />
    </>
  );
}
