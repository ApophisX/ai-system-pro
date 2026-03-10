/**
 * 应用配置
 *
 * 应用级别的全局配置
 */

import { registerAs } from '@nestjs/config';

export const APP_CONFIG_KEY = 'app';
export const appConfig = registerAs(APP_CONFIG_KEY, () => ({
  name: process.env.APP_NAME || 'base_app_api',
  version: process.env.APP_VERSION || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  debug: process.env.DEBUG === 'true',
  timezone: process.env.TZ || 'Asia/Shanghai',
}));

export type AppConfig = ReturnType<typeof appConfig>;
