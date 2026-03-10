import wx from 'weixin-js-sdk';
import { useRef, useState, useEffect, useCallback } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { PlatformDetector } from 'src/utils';

import { SplashScreen } from 'src/components/loading-screen';

import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

type AuthGuardProps = {
  children: React.ReactNode;
};

const signInPaths = {
  jwt: paths.auth.jwt.signIn,
  auth0: paths.auth.auth0.signIn,
  amplify: paths.auth.amplify.signIn,
  firebase: paths.auth.firebase.signIn,
  supabase: paths.auth.supabase.signIn,
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { authenticated, loading } = useAuthContext();

  const [isChecking, setIsChecking] = useState(true);

  const redirecting = useRef(false);

  const checkPermissions = useCallback(async (): Promise<void> => {
    if (loading) {
      return;
    }

    if (!authenticated) {
      const { method } = CONFIG.auth;
      const signInPath = signInPaths[method];
      const createRedirectPath = (currentPath: string) => {
        const queryString = new URLSearchParams({ returnTo: pathname }).toString();
        return `${currentPath}?${queryString}`;
      };

      if (redirecting.current) {
        return;
      }
      const redirectPath = createRedirectPath(signInPath);

      if (PlatformDetector.isWeChatMiniProgram()) {
        redirecting.current = true;
        wx.miniProgram.navigateTo({
          url: '/pages/auth/login/index?' + new URLSearchParams({ returnTo: pathname }).toString(),
          success: () => {
            redirecting.current = false;
            // router.replace('/')
            setTimeout(router.back, 350);
          },
          fail: () => {
            redirecting.current = false;
          },
          complete: () => {
            redirecting.current = false;
          },
        });
      } else {
        router.replace(redirectPath);
      }

      return;
    }

    setIsChecking(false);
  }, [loading, authenticated, pathname, router]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  if (isChecking) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
