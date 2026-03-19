import type { RouteObject } from 'react-router';

import { lazy } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { AuthGuard } from 'src/auth/guard';

import { LoadingScreenSuspenseOutlet } from '../components/route-outlet';

// ----------------------------------------------------------------------

const PageUserList = lazy(() => import('src/pages/dashboard/management/user/list/index'));
// ----------------------------------------------------------------------

const dashboardLayout = () => (
  <DashboardLayout>
    <LoadingScreenSuspenseOutlet />
  </DashboardLayout>
);

export const dashboardRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        path: 'management',
        children: [
          // 用户管理
          { path: 'user', children: [{ path: 'list', element: <PageUserList /> }] },
        ],
      },
    ],
  },
];
