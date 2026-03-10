import type { RouteObject } from 'react-router';

import { lazy } from 'react';
import { Outlet } from 'react-router';

import { CONFIG } from 'src/global-config';

import { AuthGuard } from 'src/auth/guard';

import { SplashScreenSuspenseOutlet } from '../components/route-outlet';

// 出租方页面
const PageLessorAssets = lazy(() => import('src/pages/lessor/assets'));
const PageLessorOrders = lazy(() => import('src/pages/lessor/orders'));
const PageLessorOrderDetail = lazy(() => import('src/pages/lessor/orders/[id]'));
const PageLessorOrderBindAsset = lazy(() => import('src/pages/lessor/orders/[id]/bind-asset'));
const PageLessorOrderRebindAsset = lazy(() => import('src/pages/lessor/orders/[id]/rebind-asset'));
const PageLessorOrderInstallments = lazy(() => import('src/pages/lessor/orders/[id]/installments'));
const PageLessorOrdersManagement = lazy(() => import('src/pages/lessor/orders/management'));
const PageLessorIncome = lazy(() => import('src/pages/lessor/income'));
const PageLessorWithdraw = lazy(() => import('src/pages/lessor/withdraw'));
const PageLessorWithdrawApply = lazy(() => import('src/pages/lessor/withdraw/apply'));
const PageLessorWithdrawDetail = lazy(() => import('src/pages/lessor/withdraw/[id]'));
const PageLessorEvaluation = lazy(() => import('src/pages/lessor/evaluation'));
const PageLessorAssetsPreview = lazy(() => import('src/pages/lessor/assets-preview'));
const PageLessorAssetsEdit = lazy(() => import('src/pages/lessor/assets-edit'));
const PageLessorAssetsInventory = lazy(() => import('src/pages/lessor/assets-inventory'));
const PageLessorAssetsInventoryCreate = lazy(
  () => import('src/pages/lessor/assets-inventory-create')
);
const PageLessorAssetsInventoryEdit = lazy(() => import('src/pages/lessor/assets-inventory-edit'));
const PageLessorAssetsInventoryDetail = lazy(() => import('src/pages/lessor/assets-inventory-detail')
);

export const lessorRoutes: RouteObject[] = [
  {
    path: '/lessor',
    element: CONFIG.auth.skip ? (
      <SplashScreenSuspenseOutlet />
    ) : (
      <AuthGuard>
        <SplashScreenSuspenseOutlet />
      </AuthGuard>
    ),
    children: [
      { path: 'assets', element: <PageLessorAssets /> },
      { path: 'assets/:id/preview', element: <PageLessorAssetsPreview /> },
      {
        path: 'assets/:id/inventory', children: [
          {
            index: true,
            element: <PageLessorAssetsInventory />,
          },
          {
            path: 'create',
            element: <PageLessorAssetsInventoryCreate />,
          },
          {
            path: ':instanceId/edit',
            element: <PageLessorAssetsInventoryEdit />,
          },
          {
            path: ':instanceId',
            element: <PageLessorAssetsInventoryDetail />,
          },
        ]
      },
      { path: 'assets/:id/edit', element: <PageLessorAssetsEdit /> },
      {
        path: 'order',
        children: [
          { index: true, element: <PageLessorOrders /> },
          { path: 'list', element: <PageLessorOrders /> },
          { path: 'management', element: <PageLessorOrdersManagement /> },
          {
            path: 'detail/:id',
            element: <Outlet />,
            children: [
              { index: true, element: <PageLessorOrderDetail /> },
              { path: 'bind-asset', element: <PageLessorOrderBindAsset /> },
              { path: 'rebind-asset', element: <PageLessorOrderRebindAsset /> },
            ],
          },
          { path: 'installments/:id', element: <PageLessorOrderInstallments /> },
        ],
      },
      { path: 'income', element: <PageLessorIncome /> },
      {
        path: 'withdraw',
        children: [
          { index: true, element: <PageLessorWithdraw /> },
          { path: 'apply', element: <PageLessorWithdrawApply /> },
          { path: ':id', element: <PageLessorWithdrawDetail /> },
        ],
      },
      { path: 'evaluation', element: <PageLessorEvaluation /> },
    ],
  },
];
