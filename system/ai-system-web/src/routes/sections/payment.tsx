import type { RouteObject } from 'react-router';

import { lazy } from 'react';

// ----------------------------------------------------------------------

const PagePaymentSuccess = lazy(() => import('src/pages/payment/success'));
const PagePaymentFailure = lazy(() => import('src/pages/payment/failure'));
const PagePaymentProcessing = lazy(() => import('src/pages/payment/processing'));

// ----------------------------------------------------------------------

export const paymentRoutes: RouteObject[] = [
  {
    path: '/payment',
    children: [
      { path: 'success', element: <PagePaymentSuccess /> },
      { path: 'failure', element: <PagePaymentFailure /> },
      { path: 'processing', element: <PagePaymentProcessing /> },
    ],
  },
];
