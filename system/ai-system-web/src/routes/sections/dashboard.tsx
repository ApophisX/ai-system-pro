import type { RouteObject } from 'react-router';

import { lazy } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { AuthGuard } from 'src/auth/guard';

import { LoadingScreenSuspenseOutlet } from '../components/route-outlet';

// ----------------------------------------------------------------------

// const IndexPage = lazy(() => import('src/pages/dashboard/one'));
// const PageTwo = lazy(() => import('src/pages/dashboard/two'));
// const PageThree = lazy(() => import('src/pages/dashboard/three'));
// const PageFour = lazy(() => import('src/pages/dashboard/four'));
// const PageFive = lazy(() => import('src/pages/dashboard/five'));
// const PageSix = lazy(() => import('src/pages/dashboard/six'));
const PageEnterprise = lazy(() => import('src/pages/dashboard/management/enterprise'));
const PageDepositAudit = lazy(() => import('src/pages/dashboard/management/order/deposit-audit'));
const PageAssetList = lazy(() => import('src/pages/dashboard/management/asset/list/index'));
const PageReviewList = lazy(() => import('src/pages/dashboard/management/review/list/index'));
const PageReportList = lazy(() => import('src/pages/dashboard/management/report/list/index'));
const PageUserList = lazy(() => import('src/pages/dashboard/management/user/list/index'));
const PageCommunityList = lazy(() => import('src/pages/dashboard/management/community'));
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
      // { element: <PageEnterprise />, index: true },
      // { path: 'two', element: <PageTwo /> },
      // { path: 'three', element: <PageThree /> },
      // {
      //   path: 'group',
      //   children: [
      //     { element: <PageFour />, index: true },
      //     { path: 'five', element: <PageFive /> },
      //     { path: 'six', element: <PageSix /> },
      //   ],
      // },
      {
        path: 'management',
        children: [
          // 企业管理
          { path: 'enterprise', element: <PageEnterprise /> },
          // 订单管理
          { path: 'order', children: [{ path: 'deposit-audit', element: <PageDepositAudit /> }] },
          // 资产管理
          { path: 'asset', children: [{ path: 'list', element: <PageAssetList /> }] },
          // 评论管理
          { path: 'review', children: [{ path: 'list', element: <PageReviewList /> }] },
          // 举报管理
          { path: 'report', children: [{ path: 'list', element: <PageReportList /> }] },
          // 用户管理
          { path: 'user', children: [{ path: 'list', element: <PageUserList /> }] },
          // 社区管理
          { path: 'community', element: <PageCommunityList /> },
        ],
      },
    ],
  },
];
