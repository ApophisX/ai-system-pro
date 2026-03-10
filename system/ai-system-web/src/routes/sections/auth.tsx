import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { AuthSplitLayout } from 'src/layouts/auth-split';

import { SplashScreen } from 'src/components/loading-screen';

import { GuestGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

/** **************************************
 * Jwt
 *************************************** */
const Jwt = {
  SignInPage: lazy(() => import('src/pages/auth/jwt/sign-in')),
  SignUpPage: lazy(() => import('src/pages/auth/jwt/sign-up')),
  // ResetPasswordPage: lazy(() => import('src/pages/auth/amplify/reset-password')),
};

const Amplify = {
  ResetPasswordPage: lazy(() => import('src/pages/auth/amplify/reset-password')),
  UpdatePasswordPage: lazy(() => import('src/pages/auth/amplify/update-password')),
};

const Embedded = {
  ResetPasswordPage: lazy(() => import('src/pages/auth/embedded/reset-password')),
  UpdatePasswordPage: lazy(() => import('src/pages/auth/embedded/update-password')),
  SignOutPage: lazy(() => import('src/pages/auth/embedded/sign-out')),
};

const authJwt = {
  path: 'jwt',
  children: [
    {
      path: 'sign-in',
      element: (
        <GuestGuard>
          <AuthSplitLayout
            slotProps={{
              section: { title: '欢迎回来', subtitle: '请输入您的手机号和密码登录' },
            }}
          >
            <Jwt.SignInPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'sign-up',
      element: (
        <GuestGuard>
          <AuthSplitLayout
            slotProps={{
              section: { title: '创建账号' },
            }}
          >
            <Jwt.SignUpPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
  ],
};

const authAmplify = {
  path: 'amplify',
  children: [
    {
      path: 'reset-password',
      element: (
        <AuthSplitLayout slotProps={{ section: { title: '忘记密码' } }}>
          <Amplify.ResetPasswordPage />
        </AuthSplitLayout>
      ),
    },
    {
      path: 'update-password',
      element: (
        // <GuestGuard>
        <AuthSplitLayout slotProps={{ section: { title: '修改密码' } }}>
          <Amplify.UpdatePasswordPage />
        </AuthSplitLayout>
        // </GuestGuard>
      ),
    },
  ],
};

const authEmbedded = {
  path: 'embedded',
  children: [
    { path: 'reset-password', element: <Embedded.ResetPasswordPage /> },
    { path: 'update-password', element: <Embedded.UpdatePasswordPage /> },
    { path: 'sign-out', element: <Embedded.SignOutPage /> },
  ],
};

// ----------------------------------------------------------------------

export const authRoutes: RouteObject[] = [
  {
    path: 'auth',
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: [authJwt, authAmplify, authEmbedded],
  },
];
