/**
 * Redis 服务
 *
 * Redis 操作服务
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisConfig, REDIS_CONFIG_KEY } from '@/config';
import { createRedisClient } from './redis.factory';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const config = this.configService.get<RedisConfig>(REDIS_CONFIG_KEY);
    if (!config) {
      this.logger.warn('Redis config not found, Redis service will not be available');
      return;
    }

    try {
      // 使用工厂函数创建 Redis 客户端
      this.client = createRedisClient(config, this.logger);
      // 验证连接
      await this.client.ping();
      this.logger.log('Redis service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Redis', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis connection closed');
    }
  }

  /**
   * 获取 Redis 客户端
   */
  getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis client is not initialized');
    }
    return this.client;
  }

  /**
   * 设置键值对
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client is not initialized');
    }
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * 获取值
   */
  async get(key: string): Promise<string | null> {
    if (!this.client) {
      throw new Error('Redis client is not initialized');
    }
    return this.client.get(key);
  }

  /**
   * 删除键
   */
  async del(key: string): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client is not initialized');
    }
    await this.client.del(key);
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('Redis client is not initialized');
    }
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * 设置过期时间
   */
  async expire(key: string, seconds: number): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client is not initialized');
    }
    await this.client.expire(key, seconds);
  }

  /**
   * 获取剩余过期时间（秒）
   */
  async ttl(key: string): Promise<number> {
    if (!this.client) {
      throw new Error('Redis client is not initialized');
    }
    return this.client.ttl(key);
  }
}
