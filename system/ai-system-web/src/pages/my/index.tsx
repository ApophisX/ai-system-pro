'use client';

import { MyView } from 'src/sections/my/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '我的',
  description: '个人中心 - 查看我的资产、订单、收入等信息',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <MyView />
    </>
  );
}
