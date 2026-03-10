import { useAuthContext } from '@/auth/hooks';
import { ACCESS_TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from '@/constants/app';
import Taro from '@tarojs/taro';
import { useEffect, useMemo, useState } from 'react';

export function useToken() {
  const { user } = useAuthContext();

  const [token, setToken] = useState({
    token: undefined,
    refreshToken: undefined,
  } as {
    token: string | undefined;
    refreshToken: string | undefined;
  });

  useEffect(() => {
    if (user) {
      const token = Taro.getStorageSync(ACCESS_TOKEN_STORAGE_KEY);
      const refreshToken = Taro.getStorageSync(REFRESH_TOKEN_STORAGE_KEY);
      setToken({ token, refreshToken });
    }
  }, [user]);

  const memoizedValue = useMemo(() => token, [token]);
  return memoizedValue;
}
