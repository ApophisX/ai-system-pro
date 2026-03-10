import { CONFIG } from 'src/global-config';

import { AmplifyUpdatePasswordView } from 'src/auth/view/amplify';

// ----------------------------------------------------------------------

const metadata = { title: `修改密码  =- ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <AmplifyUpdatePasswordView />
    </>
  );
}
