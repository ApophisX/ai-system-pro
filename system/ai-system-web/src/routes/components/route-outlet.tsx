import { Suspense } from 'react';
import { Outlet } from 'react-router';

import { SplashScreen, LoadingScreen } from 'src/components/loading-screen';

import { usePathname } from '../hooks';

export function SplashScreenSuspenseOutlet() {
  return (
    <Suspense fallback={<SplashScreen />}>
      <Outlet />
    </Suspense>
  );
}

export function LoadingScreenSuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}
