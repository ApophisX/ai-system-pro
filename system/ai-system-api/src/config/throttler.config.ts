/**
 * Throttler 配置
 *
 * API 限流相关配置
 */

import { registerAs } from '@nestjs/config';

export const THROTTLER_CONFIG_KEY = 'throttler';

export const throttlerConfig = registerAs(THROTTLER_CONFIG_KEY, () => ({
  // 默认限流配置：每 60 秒最多 100 次请求
  ttl: parseInt(process.env.THROTTLER_TTL || '60000', 10), // 时间窗口（毫秒）
  limit: parseInt(process.env.THROTTLER_LIMIT || '100', 10), // 限制次数

  // 是否使用 Redis 存储（推荐生产环境使用）
  // 注意：当前版本使用内存存储，如需 Redis 存储需要自定义 storage
  useRedis: process.env.THROTTLER_USE_REDIS === 'true',
}));

export type ThrottlerConfig = ReturnType<typeof throttlerConfig>;
