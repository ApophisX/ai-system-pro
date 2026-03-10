'use client';

import { MessageCenterView } from 'src/sections/message/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '消息中心',
  description: '查看所有系统消息和订单消息',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <MessageCenterView />
    </>
  );
}
