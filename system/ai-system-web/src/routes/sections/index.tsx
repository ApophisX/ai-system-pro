import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';

import { SplashScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

import { authRoutes } from './auth';
import { rentalRoutes } from './rental';
import { lessorRoutes } from './lessor';
import { communityRoutes } from './community';
import { dashboardRoutes } from './dashboard';
import { SplashScreenSuspenseOutlet } from '../components/route-outlet';

// ----------------------------------------------------------------------

const Page404 = lazy(() => import('src/pages/error/404'));
const PageHome = lazy(() => import('src/pages/home'));
const PageContactList = lazy(() => import('src/pages/contact'));
const PageContactEdit = lazy(() => import('src/pages/contact/edit'));
const PageMy = lazy(() => import('src/pages/my'));
const PageMyOrders = lazy(() => import('src/pages/my/orders'));
const PageMyOrderDetail = lazy(() => import('src/pages/my/orders/detail'));
const PageMyOrderReview = lazy(() => import('src/pages/my/orders/review'));
const PageMyOrderInstallments = lazy(() => import('src/pages/my/orders/installments'));
const PageMyOrderDepositRecords = lazy(() => import('src/pages/my/orders/deposit-records'));
const PageMyOrderPayments = lazy(() => import('src/pages/my/orders/payments'));
const PageMyOrderRefundRecords = lazy(() => import('src/pages/my/orders/refund-records'));
const PageMyDeposit = lazy(() => import('src/pages/my/deposit'));
const PageMyFavorites = lazy(() => import('src/pages/my/favorites'));
const PageMyVerify = lazy(() => import('src/pages/my/verify'));
const PageMyEnterpriseVerify = lazy(() => import('src/pages/my/enterprise-verify'));
const PageMyCredit = lazy(() => import('src/pages/my/credit'));
const PageMyInvite = lazy(() => import('src/pages/my/invite'));
const PageMerchantInvite = lazy(() => import('src/pages/my/merchant-invite'));
const PageMySettings = lazy(() => import('src/pages/my/settings'));
const PageMyHelp = lazy(() => import('src/pages/my/help'));
const PageMyTerms = lazy(() => import('src/pages/my/terms/[type]'));
const PageMyProfileEdit = lazy(() => import('src/pages/my/profile-edit'));
const PageMyShopCode = lazy(() => import('src/pages/my/shop-code'));

const PageMessageCenter = lazy(() => import('src/pages/message/center'));
const PageMessageList = lazy(() => import('src/pages/message'));

const PagePaymentSuccess = lazy(() => import('src/pages/payment/success'));
const PagePaymentFailure = lazy(() => import('src/pages/payment/failure'));
const PagePaymentProcessing = lazy(() => import('src/pages/payment/processing'));

export const routesSection: RouteObject[] = [
  {
    path: '/',
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: [
      {
        element: <PageHome />,
        index: true,
      },
    ],
  },

  // 消息中心
  {
    path: '/message',
    element: CONFIG.auth.skip ? (
      <SplashScreenSuspenseOutlet />
    ) : (
      <AuthGuard>
        <SplashScreenSuspenseOutlet />
      </AuthGuard>
    ),
    children: [
      { element: <PageMessageList />, index: true },
      // { path: 'detail/:id', element: <PageMessageDetail /> },
      { path: 'index', element: <PageMessageList /> },
      { path: 'center', element: <PageMessageCenter /> },
    ],
  },

  // 支付相关页面
  {
    path: '/payment',
    children: [
      { path: 'success', element: <PagePaymentSuccess /> },
      { path: 'failure', element: <PagePaymentFailure /> },
      { path: 'processing', element: <PagePaymentProcessing /> },
    ],
  },

  // 我的相关页面
  {
    path: '/my',
    element: CONFIG.auth.skip ? (
      <SplashScreenSuspenseOutlet />
    ) : (
      <AuthGuard>
        <SplashScreenSuspenseOutlet />
      </AuthGuard>
    ),
    children: [
      { element: <PageMy />, index: true },
      { path: 'orders', element: <PageMyOrders /> },
      { path: 'orders/:id', element: <PageMyOrderDetail /> },
      { path: 'orders/:id/review', element: <PageMyOrderReview /> },
      { path: 'orders/:id/installments', element: <PageMyOrderInstallments /> },
      { path: 'orders/:id/deposit-records', element: <PageMyOrderDepositRecords /> },
      { path: 'orders/:id/payments', element: <PageMyOrderPayments /> },
      { path: 'orders/:id/refund-records', element: <PageMyOrderRefundRecords /> },
      { path: 'deposit', element: <PageMyDeposit /> },
      { path: 'favorites', element: <PageMyFavorites /> },
      { path: 'verify', element: <PageMyVerify /> },
      { path: 'enterprise-verify', element: <PageMyEnterpriseVerify /> },
      { path: 'credit', element: <PageMyCredit /> },
      { path: 'invite', element: <PageMyInvite /> },
      { path: 'merchant-invite', element: <PageMerchantInvite /> },
      { path: 'shop-code', element: <PageMyShopCode /> },
      { path: 'settings', element: <PageMySettings /> },
      { path: 'help', element: <PageMyHelp /> },
      { path: 'terms/:type', element: <PageMyTerms /> },
      { path: 'profile-edit', element: <PageMyProfileEdit /> },
      {
        path: 'contact',
        children: [
          { index: true, element: <PageContactList /> },
          { path: 'edit/:id?', element: <PageContactEdit /> },
        ],
      },
    ],
  },

  // 租赁相关页面
  ...rentalRoutes,

  // 社区相关页面
  ...communityRoutes,

  // 出租方相关页面
  ...lessorRoutes,

  // Auth
  ...authRoutes,

  // Dashboard
  ...dashboardRoutes,

  // No match
  { path: '*', element: <Page404 /> },
];
