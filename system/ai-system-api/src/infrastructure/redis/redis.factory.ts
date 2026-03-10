/**
 * Redis 客户端工厂
 *
 * 通过配置创建 Redis 客户端实例
 */

import Redis, { RedisOptions } from 'ioredis';
import { RedisConfig } from '@/config';
import { Logger } from '@nestjs/common';

/**
 * 创建 Redis 客户端实例
 *
 * @param config Redis 配置
 * @param logger 日志记录器（可选）
 * @returns Redis 客户端实例
 */
export function createRedisClient(config: RedisConfig, logger?: Logger): Redis {
  const redisLogger = logger || new Logger('RedisFactory');

  // 构建 Redis 选项
  const redisOptions: RedisOptions = {
    host: config.host,
    port: config.port,
    password: config.password,
    db: config.database,
    maxRetriesPerRequest: config.maxRetries,
    retryStrategy: times => {
      const delay = Math.min(times * config.retryDelay, 2000);
      return delay;
    },
    enableReadyCheck: config.enableReadyCheck,
    // 如果提供了 URL，优先使用 URL
    ...(config.url && { url: config.url }),
  };

  // 创建 Redis 客户端
  const client = new Redis(redisOptions);

  // 设置事件监听器
  client.on('connect', () => {
    redisLogger.log('Redis client connected');
  });

  client.on('ready', () => {
    redisLogger.log('Redis client ready');
  });

  client.on('error', error => {
    redisLogger.error('Redis client error', error);
  });

  client.on('close', () => {
    redisLogger.warn('Redis client connection closed');
  });

  client.on('reconnecting', (delay: number) => {
    redisLogger.log(`Redis client reconnecting in ${delay}ms`);
  });

  return client;
}
