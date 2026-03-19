import type { RouteObject } from 'react-router';

import { lazy } from 'react';

import { CONFIG } from 'src/global-config';

import { AuthGuard } from 'src/auth/guard';

import { SplashScreenSuspenseOutlet } from '../components/route-outlet';

// ----------------------------------------------------------------------

const PageContactList = lazy(() => import('src/pages/contact'));
const PageContactEdit = lazy(() => import('src/pages/contact/edit'));
const PageMy = lazy(() => import('src/pages/my'));
const PageMyFavorites = lazy(() => import('src/pages/my/favorites'));
const PageMyVerify = lazy(() => import('src/pages/my/verify'));
const PageMyEnterpriseVerify = lazy(() => import('src/pages/my/enterprise-verify'));
const PageMyInvite = lazy(() => import('src/pages/my/invite'));
const PageMySettings = lazy(() => import('src/pages/my/settings'));
const PageMyHelp = lazy(() => import('src/pages/my/help'));
const PageMyTerms = lazy(() => import('src/pages/my/terms/[type]'));
const PageMyProfileEdit = lazy(() => import('src/pages/my/profile-edit'));
const PageMyShopCode = lazy(() => import('src/pages/my/shop-code'));

// ----------------------------------------------------------------------

export const myRoutes: RouteObject[] = [
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
      { path: 'favorites', element: <PageMyFavorites /> },
      { path: 'verify', element: <PageMyVerify /> },
      { path: 'enterprise-verify', element: <PageMyEnterpriseVerify /> },
      { path: 'invite', element: <PageMyInvite /> },
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
];
