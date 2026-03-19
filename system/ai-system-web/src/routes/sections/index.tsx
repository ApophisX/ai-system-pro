import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { SplashScreen } from 'src/components/loading-screen';

import { myRoutes } from './my';
import { authRoutes } from './auth';
import { messageRoutes } from './message';
import { paymentRoutes } from './payment';
import { dashboardRoutes } from './dashboard';

// ----------------------------------------------------------------------

const Page404 = lazy(() => import('src/pages/error/404'));
const PageHome = lazy(() => import('src/pages/home'));

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

  ...messageRoutes,
  ...paymentRoutes,
  ...myRoutes,

  // Auth
  ...authRoutes,

  // Dashboard
  ...dashboardRoutes,

  // No match
  { path: '*', element: <Page404 /> },
];
