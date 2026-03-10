import type { StackProps, ContainerProps } from '@mui/material';
import type { MyAppBarProps } from '../my-app-bar';

import { useState, useEffect } from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';

import { Stack, Container } from '@mui/material';

import { useSearchParams } from 'src/routes/hooks';

import { usePlatform } from 'src/hooks/use-platform';

import { setSession } from 'src/auth/context/jwt';

import { MyAppBar } from '../my-app-bar';
import { PullingContent } from '../pull-to-refresh-loading';

type MobileLayoutProps = {
  children: React.ReactNode;
  appTitle?: any;
  appBarProps?: Partial<MyAppBarProps>;
  containerProps?: ContainerProps;
  onRefresh?: () => Promise<any>;
  bottomContent?: React.ReactNode;
} & StackProps;

export function MobileLayout({
  children,
  appTitle,
  appBarProps,
  containerProps,
  onRefresh,
  bottomContent,
  ...stackProps
}: MobileLayoutProps) {
  const searchParams = useSearchParams();
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const [isInitialized, setIsInitialized] = useState(false);
  const { isInWeChatMiniProgram } = usePlatform();

  useEffect(() => {
    if (accessToken && refreshToken) {
      setSession(accessToken, refreshToken);
    }
    setIsInitialized(true);
  }, [accessToken, refreshToken]);
  return (
    <Stack
      {...stackProps}
      sx={{
        minHeight: '100vh',
        pt: appBarProps?.extra
          ? isInWeChatMiniProgram
            ? { xs: 6 }
            : { xs: 13, sm: 14, md: 15 }
          : isInWeChatMiniProgram && typeof appTitle === 'string'
            ? { xs: 0 }
            : { xs: 7, sm: 8 },
        ...stackProps.sx,
        '& .ptr': {
          // display: 'flex',
          // flexDirection: 'column',
        },
        '& .ptr, & .ptr__children': {
          overflow: 'auto',
          height: 'auto',
          minHeight: '100%',
          touchAction: 'pan-y',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {appTitle && <MyAppBar appTitle={appTitle} {...appBarProps} />}

      {onRefresh ? (
        <Container
          sx={{ px: 0, py: 0, flex: 1, display: 'flex', flexDirection: 'column' }}
          maxWidth="lg"
        >
          <PullToRefresh
            onRefresh={onRefresh}
            maxPullDownDistance={200}
            pullDownThreshold={100}
            resistance={2}
            pullingContent={<PullingContent />}
          >
            <Container {...containerProps} sx={{ py: 2, flex: 1, ...containerProps?.sx }}>
              {children}
            </Container>
          </PullToRefresh>
        </Container>
      ) : (
        <Container maxWidth="lg" {...containerProps} sx={{ py: 2, flex: 1, ...containerProps?.sx }}>
          {children}
        </Container>
      )}

      {bottomContent}
    </Stack>
  );
}
