import { ACCESS_TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from '@/constants/app';
import Taro from '@tarojs/taro';
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContextValue, UserType } from '../types';
import { AuthContext } from './auth-context';
import API from '@/services/API';
import { useUserRole } from '@/hooks';

export function setSession(accessToken?: string | null, refreshToken?: string | null) {
  if (refreshToken) {
    Taro.setStorageSync(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  }
  if (accessToken) {
    Taro.setStorageSync(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  }
}

export function clearSession() {
  Taro.removeStorageSync(ACCESS_TOKEN_STORAGE_KEY);
  Taro.removeStorageSync(REFRESH_TOKEN_STORAGE_KEY);
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<{
    loading: boolean;
    user?: UserType;
  }>({ loading: true, user: undefined });
  const loadingRef = useRef(false);

  const { userRole, setUserRole } = useUserRole();

  const handleRefreshToken = useCallback(async () => {
    const refreshToken: string | null = Taro.getStorageSync(REFRESH_TOKEN_STORAGE_KEY);
    if (refreshToken) {
      try {
        const res = await API.Auth.AuthControllerRefreshV1({ refreshToken });
        if (res.data) {
          setSession(res.data.accessToken, res.data.refreshToken);
          return res.data;
        }
        throw new Error('登录已过期，请重新登录');
      } catch (error) {
        clearSession();
        throw new Error('登录已过期，请重新登录');
      }
    } else {
      throw new Error('登录已过期，请重新登录');
    }
  }, []);

  const queryCurrentUser = useCallback(async () => {
    const refreshToken = Taro.getStorageSync(REFRESH_TOKEN_STORAGE_KEY);
    try {
      const res = await API.Auth.AuthControllerGetCurrentUserV1();
      return res.data;
    } catch (err: any) {
      if (err.status === 401 && refreshToken) {
        await handleRefreshToken();
        const res = await API.Auth.AuthControllerGetCurrentUserV1();
        return res.data;
      } else {
        clearSession();
        throw new Error('登录已过期，请重新登录');
      }
    }
  }, [handleRefreshToken]);

  const checkUserSession = useCallback(async (): Promise<void> => {
    if (loadingRef.current) {
      return;
    }
    loadingRef.current = true;
    setState(pre => ({ ...pre, loading: true }));
    try {
      const user = await queryCurrentUser();
      setState(pre => ({ ...pre, user }));
    } catch (err) {
      setState({ loading: false, user: undefined });
    } finally {
      setState(pre => ({ ...pre, loading: false }));
      loadingRef.current = false;
    }
  }, [queryCurrentUser, setState]);

  useEffect(() => {
    checkUserSession();
    Taro.eventCenter.on('onCheckUserSession', checkUserSession);
    return () => {
      Taro.eventCenter.off('onCheckUserSession', checkUserSession);
    };
  }, []);
  // ----------------------------------------------------------------------

  const memoizedValue = useMemo(
    () =>
      ({
        checkUserSession,
        setUserRole,
        user: state.user,
        userRole,
        loading: state.loading,
        authenticated: !!state.user,
        unauthenticated: !state.user,
      }) as AuthContextValue,
    [checkUserSession, state, userRole, setUserRole],
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
};
