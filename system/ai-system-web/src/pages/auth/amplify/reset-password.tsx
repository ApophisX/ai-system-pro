import { CONFIG } from 'src/global-config';

import { AmplifyResetPasswordView } from 'src/auth/view/amplify';

// ----------------------------------------------------------------------

const metadata = { title: `忘记密码 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <AmplifyResetPasswordView />
    </>
  );
}
