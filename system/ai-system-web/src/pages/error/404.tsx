import { CONFIG } from 'src/global-config';

import { NotFoundView } from 'src/sections/error';

// ----------------------------------------------------------------------

const metadata = { title: `页面未找到 | 错误 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <NotFoundView />
    </>
  );
}
