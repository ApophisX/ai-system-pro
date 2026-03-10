/**
 * 服务器配置
 *
 * HTTP/HTTPS 服务器相关配置
 */

import { registerAs } from '@nestjs/config';

export const SERVER_CONFIG_KEY = 'server';
export const serverConfig = registerAs(SERVER_CONFIG_KEY, () => ({
  port: parseInt(process.env.SERVER_PORT || '3000', 10),
  host: process.env.SERVER_HOST || 'localhost',
  protocol: process.env.SERVER_PROTOCOL || 'http',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  apiVersion: process.env.API_VERSION || '1',
  globalPrefix: process.env.GLOBAL_PREFIX || '',
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'],
  apiHost: process.env.API_HOST || 'http://localhost:3000',
}));

export type ServerConfig = ReturnType<typeof serverConfig>;
