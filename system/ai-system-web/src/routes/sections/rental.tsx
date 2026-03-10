import type { RouteObject } from 'react-router';

import { lazy } from 'react';

import { AuthGuard } from 'src/auth/guard';

import { SplashScreenSuspenseOutlet } from '../components/route-outlet';

// ----------------------------------------------------------------------

const PageRentalGoods = lazy(() => import('src/pages/rental/rental-goods'));
const PageRentalLessorShop = lazy(() => import('src/pages/rental/lessor-shop'));
const PageRentalCategory = lazy(() => import('src/pages/rental/rental-category'));
const PageRentalGoodsDetail = lazy(() => import('src/pages/rental/rental-goods-detail'));
const PageRentalOrderConfirm = lazy(() => import('src/pages/rental/rental-order-confirm'));
const PageRentalGoodsPublish = lazy(() => import('src/pages/rental/rental-goods-publish'));
const PageRentalReport = lazy(() => import('src/pages/rental/report'));
const PageRentalReportSuccess = lazy(() => import('src/pages/rental/report-success'));
const PageRentalReview = lazy(() => import('src/pages/rental/rental-review'));

// ----------------------------------------------------------------------

export const rentalRoutes: RouteObject[] = [
  {
    path: 'rental',
    element: <SplashScreenSuspenseOutlet />,
    children: [
      // 租赁商品页面
      {
        path: 'goods',
        element: <PageRentalGoods />,
      },
      // 出租方店铺（承租方扫码/链接查看出租方全部资产，公开访问）
      {
        path: 'shop/:lessorId',
        element: <PageRentalLessorShop />,
      },
      // 举报成功页面（需在举报表单之前，匹配更具体路径）
      {
        path: 'goods/:id/report/success',
        element: <PageRentalReportSuccess />,
      },
      // 举报页面（需要在详情页之前，避免路由冲突）
      {
        path: 'goods/:id/report',
        element: <PageRentalReport />,
      },
      // 租赁商品详情页面
      {
        path: 'goods/:id',
        element: <PageRentalGoodsDetail />,
      },
      // 租赁分类页面
      {
        path: 'category',
        element: <PageRentalCategory />,
      },
      // 租赁商品全部评价页面（通过 ?assetId=xxx 传参）
      {
        path: 'review',
        element: <PageRentalReview />,
      },
      // 租赁订单确认页面
      {
        path: 'order-confirm/:id',
        element: <AuthGuard><PageRentalOrderConfirm /></AuthGuard>,
      },
      // 发布租赁商品页面
      {
        path: 'goods-publish',
        element: (
          <AuthGuard>
            <PageRentalGoodsPublish />
          </AuthGuard>
        ),
      },
    ],
  },
];
