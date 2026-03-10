import type { AuthState } from '../../types';

import { v4 as uuidv4 } from 'uuid';
import { useSetState } from 'minimal-shared/hooks';
import { useRef, useMemo, useEffect, useCallback } from 'react';

import axios, { endpoints } from 'src/lib/axios';

import { JWT_STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { setSession, isValidToken } from './utils';

// ----------------------------------------------------------------------

/**
 * NOTE:
 * We only build demo at basic level.
 * Customer will need to do some extra handling yourself if you want to extend the logic and other features...
 */

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const { state, setState } = useSetState<AuthState>({ user: null, loading: true });

  const unid = useRef(uuidv4());

  const loadingRef = useRef(false);

  const checkUserSession = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const accessToken = localStorage.getItem(JWT_STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const res = await axios.get<MyApi.ApiResponseOutputUserDetailDto>(endpoints.auth.me);

        const user = res.data.data;

        setState({ user, loading: false });
      } else {
        setState({ user: null, loading: false });
      }
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    } finally {
      loadingRef.current = false;
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      // user: state.user ? { ...state.user, role: state.user?.role ?? 'admin' } : null,
      unid: unid.current,
      user: state.user ? state.user : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext value={memoizedValue}>{children}</AuthContext>;
}
