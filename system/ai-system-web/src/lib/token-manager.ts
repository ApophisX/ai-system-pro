import axios from 'axios';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import {
  TENANT_STORAGE_KEY,
  ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from 'src/constants/global-constant';

import { setSession } from 'src/auth/context/jwt';

import { endpoints } from './axios';

// token-manager.ts
class TokenManager {
  private isRefreshing = false;

  private pendingQueue: ((token: string) => void)[] = [];

  async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.pendingQueue.push(resolve);
      });
    }
    this.isRefreshing = true;
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    const tenantId = localStorage.getItem(TENANT_STORAGE_KEY);

    if (!refreshToken) {
      throw new Error('refreshToken 不存在');
    }

    try {
      const { data } = await axios.post(
        CONFIG.serverUrl + endpoints.auth.refreshToken,
        { refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': tenantId || undefined,
            Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
          },
        }
      );
      const token = data?.data;
      if (token) {
        this.resolvePending(token);
        setSession(token);
        return token;
      }
      throw new Error('无效的 refreshToken 响应');
    } catch (err) {
      setSession(null);
      this.rejectAll();
      // const searchParams = new URLSearchParams({
      //   returnTo: window.location.pathname + window.location.search,
      // });
      window.location.href = `${paths.auth.jwt.signIn}`;
      throw err;
    } finally {
      this.isRefreshing = false;
    }
  }

  private resolvePending(token: string) {
    this.pendingQueue.forEach((cb) => cb(token));
    this.pendingQueue = [];
  }

  private rejectAll() {
    this.pendingQueue = [];
  }
}

export const tokenManager = new TokenManager();
