import { CONFIG } from 'src/global-config';

import { JwtSignInView } from 'src/auth/view/jwt';

// ----------------------------------------------------------------------

const metadata = { title: `登录 | Jwt - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <JwtSignInView />
    </>
  );
}
