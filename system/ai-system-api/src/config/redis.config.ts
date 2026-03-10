/**
 * Redis 配置
 *
 * Redis 连接相关配置
 */

import { registerAs } from '@nestjs/config';

export const REDIS_CONFIG_KEY = 'redis';

export const redisConfig = registerAs(REDIS_CONFIG_KEY, () => ({
  url: process.env.REDIS_URL,
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  database: parseInt(process.env.REDIS_DB || '0', 10),
  maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
  retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '100', 10),
  enableReadyCheck: process.env.REDIS_READY_CHECK !== 'false',
}));

export type RedisConfig = ReturnType<typeof redisConfig>;
