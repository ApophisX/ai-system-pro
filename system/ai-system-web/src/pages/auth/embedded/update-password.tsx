import { Container, Stack } from '@mui/material';

import { CONFIG } from 'src/global-config';

import { AmplifyUpdatePasswordView } from 'src/auth/view/amplify';

// ----------------------------------------------------------------------

const metadata = { title: `修改密码  =- ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Stack justifyContent="center" alignItems="center">
          <AmplifyUpdatePasswordView showReturnLink={false} />
        </Stack>
      </Container>
    </>
  );
}
