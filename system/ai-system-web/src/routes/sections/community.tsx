import type { RouteObject } from 'react-router';

import { lazy } from 'react';

import { AuthGuard } from 'src/auth/guard';

import { SplashScreenSuspenseOutlet } from '../components/route-outlet';

// ----------------------------------------------------------------------

const PageCommunityList = lazy(() => import('src/pages/community'));
const PageCommunitySearch = lazy(() => import('src/pages/community/search'));
const PageCommunityCreate = lazy(() => import('src/pages/community/create'));
const PageCommunityMy = lazy(() => import('src/pages/community/my'));
const PageCommunityDetail = lazy(() => import('src/pages/community/[id]'));
const PageCommunityAssets = lazy(() => import('src/pages/community/[id]/assets'));

// ----------------------------------------------------------------------

export const communityRoutes: RouteObject[] = [
  {
    path: 'community',
    element: <SplashScreenSuspenseOutlet />,
    children: [
      // 社区列表
      {
        index: true,
        element: <PageCommunityList />,
      },
      // 社区搜索
      {
        path: 'search',
        element: <PageCommunitySearch />,
      },
      // 创建社区（需在 :id 之前，避免 create 被当作 id）
      {
        path: 'create',
        element: (
          <AuthGuard>
            <PageCommunityCreate />
          </AuthGuard>
        ),
      },
      // 我的社区（我加入的/我创建的）
      {
        path: 'my',
        element: <PageCommunityMy />,
      },
      // 社区资产列表（需在 :id 之前，避免 assets 被当作 id）
      {
        path: ':id/assets',
        element: <PageCommunityAssets />,
      },
      // 社区详情
      {
        path: ':id',
        element: <PageCommunityDetail />,
      },
    ],
  },
];
