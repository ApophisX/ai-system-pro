'use client';

import { HomeView } from 'src/sections/home/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '首页',
  description:
    '欢迎来到藏宝壳！在这里，您可以轻松发布和查找您所需要租赁的物品。无论是电子设备、家具还是其他各类物品，我们都致力于为您提供一个便捷、安全的平台，帮助您快速找到心仪的租赁物品。开始探索吧！',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <HomeView />
    </>
  );
}
