/**
 * 认证配置
 *
 * JWT、OAuth、SAML 等认证相关配置
 */

import { registerAs } from '@nestjs/config';

export const AUTH_CONFIG_KEY = 'auth';

export const authConfig = registerAs(AUTH_CONFIG_KEY, () => ({
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXP_IN_SEC || 60 * 60 * 24 * 7,
    refreshExpiresIn: process.env.JWT_REFRESH_TOKEN_EXP_IN_SEC || 60 * 60 * 24 * 30,
  },
  defaultPassword: process.env.AUTH_DEFAULT_PASSWORD || 'a888888',
  defaultUsername: process.env.AUTH_DEFAULT_USERNAME || '租友',
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  },
  oauth: {
    enabled: process.env.OAUTH_ENABLED === 'true',
  },
}));

export type AuthConfig = ReturnType<typeof authConfig>;
