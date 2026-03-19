import type { RouteObject } from 'react-router';

import { lazy } from 'react';

import { CONFIG } from 'src/global-config';

import { AuthGuard } from 'src/auth/guard';

import { SplashScreenSuspenseOutlet } from '../components/route-outlet';

// ----------------------------------------------------------------------

const PageMessageCenter = lazy(() => import('src/pages/message/center'));
const PageMessageList = lazy(() => import('src/pages/message'));

// ----------------------------------------------------------------------

export const messageRoutes: RouteObject[] = [
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
];
