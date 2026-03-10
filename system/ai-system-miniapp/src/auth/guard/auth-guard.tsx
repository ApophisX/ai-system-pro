import { paths } from '@/route/paths';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useRouter } from '@tarojs/taro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../hooks';
type AuthGuardProps = {
  children: React.ReactNode;
};
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();

  const { authenticated, loading } = useAuthContext();

  const [isChecking, setIsChecking] = useState(true);

  const checkPermissions = useCallback(async () => {
    if (loading) {
      return;
    }

    if (!authenticated) {
      const reutrnUrl = Taro.getCurrentInstance().router?.$taroPath || '';
      Taro.navigateTo({
        url: `${paths.auth.login}?returnTo=${encodeURIComponent(reutrnUrl)}`,
      });
      return;
    }

    setIsChecking(false);
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  if (isChecking) {
    return <View />;
  }

  return <>{children}</>;
}
