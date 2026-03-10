'use client';

import { SettingsView } from 'src/sections/my/settings/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '设置',
  description: '设置 - 管理账户安全、通用设置和隐私选项',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <SettingsView />
    </>
  );
}
