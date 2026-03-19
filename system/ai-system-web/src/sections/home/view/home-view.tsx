import { useEffect } from 'react';

import { Box } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { BackgroundBox } from 'src/components/custom';

import { useAuthContext } from 'src/auth/hooks';
import { setSession } from 'src/auth/context/jwt';

import { BottomNav } from '../bottom-nav';
import { SearchHeader } from '../search-header';

export const HomeView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const redirectUrl = searchParams.get('redirect_url');
  const { checkUserSession } = useAuthContext();

  useEffect(() => {
    if (accessToken && refreshToken) {
      setSession(accessToken, refreshToken);
      checkUserSession?.();
      window.history.replaceState({}, '', '/');
    } else if (redirectUrl) {
      // window.history.replaceState({}, '', '/');
      router.replace(redirectUrl);
    }
  }, [accessToken, checkUserSession, redirectUrl, refreshToken, router]);

  return (
    <Box sx={{ minHeight: '100vh', pt: { xs: 7, sm: 8 } }}>
      <BackgroundBox />
      {/* 吸顶头部 */}
      <SearchHeader
        onSearchClick={() => {
          router.push(`${paths.rental.goods.root}?autoFocus=true`);
        }}
      />

      <Box>Home Page</Box>

      {/* 固定底部导航 */}
      <BottomNav />
    </Box>
  );
};
