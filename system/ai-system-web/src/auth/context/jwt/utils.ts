import { paths } from 'src/routes/paths';

import axios from 'src/lib/axios';

import { JWT_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

export function jwtDecode(token: string) {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) {
      throw new Error('Invalid token!');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));

    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export function isValidToken(accessToken: string) {
  if (!accessToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(accessToken);

    if (!decoded || !('exp' in decoded)) {
      return false;
    }

    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error during token validation:', error);
    return false;
  }
}

// ----------------------------------------------------------------------

export function tokenExpired(exp: number) {
  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;

  setTimeout(() => {
    try {
      alert('Token expired!');
      localStorage.removeItem(JWT_STORAGE_KEY);
      window.location.href = paths.auth.jwt.signIn;
    } catch (error) {
      console.error('Error during token expiration:', error);
      throw error;
    }
  }, timeLeft);
}

// ----------------------------------------------------------------------
export function isTokenExpired(token: string = '', thresholdSeconds = 15 * 60) {
  // token 时间是否距离15分钟后过期
  try {
    const decodedToken = jwtDecode(token);
    if (decodedToken.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      const timeLeft = decodedToken.exp - currentTime;
      return timeLeft < thresholdSeconds; // 15分钟
    }
    return false; // 没有 exp 字段，默认视为不过期
  } catch (error) {
    console.error('Error during token expiration check:', error);
    return true; // token 无法解析，通常视为过期
  }
}

// ----------------------------------------------------------------------

export async function setSession(accessToken: string | null, refreshToken?: string | null) {
  try {
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    }

    if (accessToken) {
      localStorage.setItem(JWT_STORAGE_KEY, accessToken);

      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      const decodedToken = jwtDecode(accessToken); // ~3 days by minimals server

      if (decodedToken && 'exp' in decodedToken) {
        tokenExpired(decodedToken.exp);
      } else {
        throw new Error('Invalid access token!');
      }
    } else {
      localStorage.removeItem(JWT_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      delete axios.defaults.headers.common.Authorization;
    }
  } catch (error) {
    console.error('Error during set session:', error);
    throw error;
  }
}
