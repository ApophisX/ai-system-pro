import { useEffect } from 'react';

import { Box, Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { BackgroundBox } from 'src/components/custom';
import { ListEmptyContent } from 'src/components/empty-content';

import { GoodsWaterfall } from 'src/sections/rental/rental-goods';

import { useAuthContext } from 'src/auth/hooks';
import { setSession } from 'src/auth/context/jwt';

import { BottomNav } from '../bottom-nav';
import { SearchHeader } from '../search-header';
import { CategoryGrid } from '../category-grid';

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
    <Box sx={{ minHeight: '100vh', pt: { xs: 7, md: 8 } }}>
      <BackgroundBox />
      {/* 吸顶头部 */}
      <SearchHeader
        onSearchClick={() => {
          router.push(`${paths.rental.goods.root}?autoFocus=true`);
        }}
      />

      <Box sx={{ flex: 1, pt: 2, pb: 14 }}>
        <Container>
          {/* 1. 高频品类入口 - 渐次入场 */}
          <CategoryGrid />

          {/* 2. 场景化卡片 - 横向滑动或大图 */}
          {/* <ScenarioCards /> */}

          {/* 3. 智能推荐 - 带有 Tab 切换动画 */}
          {/* <SmartRecommendations /> */}
        </Container>

        <Container>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 4 }}>
            热门推荐
          </Typography>
        </Container>
        <Box sx={{ overflow: 'hidden', width: '100%' }}>
          <GoodsWaterfall
            category="all"
            sortBy="createdAt"
            slot={{
              emptyContent: (
                <ListEmptyContent title="暂无商品" description="该地区暂无商品，换个地区看看吧~" />
              ),
            }}
          />
        </Box>
      </Box>

      {/* 固定底部导航 */}
      <BottomNav />
    </Box>
  );
};
