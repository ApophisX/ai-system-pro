/**
 * 缓存服务
 *
 * 基于 Redis 的缓存操作服务
 * - 支持自动序列化/反序列化
 * - 支持 Cache-Aside 模式
 * - 支持缓存标签和批量操作
 */

import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@/infrastructure/redis/redis.service';

/**
 * 缓存选项
 */
export interface CacheOptions {
  /** 过期时间（秒） */
  ttl?: number;
  /** 缓存标签，用于批量清除 */
  tags?: string[];
}

/**
 * 缓存键前缀常量
 */
export const CACHE_PREFIX = {
  /** 用户相关缓存 */
  USER: 'user',
  /** 资产相关缓存 */
  ASSET: 'asset',
  /** 订单相关缓存 */
  ORDER: 'order',
  /** 配置相关缓存 */
  CONFIG: 'config',
  /** 会话相关缓存 */
  SESSION: 'session',
} as const;

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly DEFAULT_TTL = 300; // 默认 5 分钟
  private readonly TAG_PREFIX = 'cache:tag:';

  constructor(private readonly redisService: RedisService) {}

  /**
   * 构建缓存键
   * @param prefix 前缀
   * @param key 键名
   */
  buildKey(prefix: string, key: string): string {
    return `${prefix}:${key}`;
  }

  /**
   * 获取缓存值
   * @param key 缓存键
   * @returns 缓存值或 null
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisService.get(key);
      if (!value) return null;

      return this.deserialize<T>(value);
    } catch (error) {
      this.logger.error(`Failed to get cache: ${key}`, error);
      return null;
    }
  }

  /**
   * 设置缓存值
   * @param key 缓存键
   * @param value 缓存值
   * @param options 缓存选项
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const serialized = this.serialize(value);
      const ttl = options?.ttl ?? this.DEFAULT_TTL;

      await this.redisService.set(key, serialized, ttl);

      // 如果有标签，记录标签关联
      if (options?.tags && options.tags.length > 0) {
        await this.addToTags(key, options.tags);
      }
    } catch (error) {
      this.logger.error(`Failed to set cache: ${key}`, error);
    }
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  async del(key: string): Promise<void> {
    try {
      await this.redisService.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete cache: ${key}`, error);
    }
  }

  /**
   * 检查缓存是否存在
   * @param key 缓存键
   */
  async exists(key: string): Promise<boolean> {
    try {
      return await this.redisService.exists(key);
    } catch (error) {
      this.logger.error(`Failed to check cache existence: ${key}`, error);
      return false;
    }
  }

  /**
   * Cache-Aside 模式：获取缓存，不存在则执行工厂函数并缓存结果
   * @param key 缓存键
   * @param factory 数据工厂函数
   * @param options 缓存选项
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, options?: CacheOptions): Promise<T> {
    // 尝试从缓存获取
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // 缓存未命中，执行工厂函数
    const value = await factory();

    // 缓存结果（即使是 null 也缓存，防止缓存穿透）
    if (value !== undefined) {
      await this.set(key, value, options);
    }

    return value;
  }

  /**
   * 批量获取缓存
   * @param keys 缓存键数组
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (keys.length === 0) return [];

    try {
      const client = this.redisService.getClient();
      const values = await client.mget(...keys);

      return values.map(value => (value ? this.deserialize<T>(value) : null));
    } catch (error) {
      this.logger.error('Failed to mget cache', error);
      return keys.map(() => null);
    }
  }

  /**
   * 批量设置缓存
   * @param entries 键值对数组
   * @param ttl 过期时间（秒）
   */
  async mset<T>(entries: Array<{ key: string; value: T }>, ttl?: number): Promise<void> {
    if (entries.length === 0) return;

    try {
      const client = this.redisService.getClient();
      const pipeline = client.pipeline();
      const expireTime = ttl ?? this.DEFAULT_TTL;

      for (const { key, value } of entries) {
        const serialized = this.serialize(value);
        pipeline.setex(key, expireTime, serialized);
      }

      await pipeline.exec();
    } catch (error) {
      this.logger.error('Failed to mset cache', error);
    }
  }

  /**
   * 按前缀删除缓存
   * @param prefix 缓存键前缀
   */
  async delByPrefix(prefix: string): Promise<number> {
    try {
      const client = this.redisService.getClient();
      const keys = await client.keys(`${prefix}*`);

      if (keys.length === 0) return 0;

      await client.del(...keys);
      return keys.length;
    } catch (error) {
      this.logger.error(`Failed to delete cache by prefix: ${prefix}`, error);
      return 0;
    }
  }

  /**
   * 按标签删除缓存
   * @param tag 缓存标签
   */
  async delByTag(tag: string): Promise<number> {
    try {
      const client = this.redisService.getClient();
      const tagKey = `${this.TAG_PREFIX}${tag}`;
      const keys = await client.smembers(tagKey);

      if (keys.length === 0) return 0;

      // 删除所有关联的缓存键
      await client.del(...keys);
      // 删除标签本身
      await client.del(tagKey);

      return keys.length;
    } catch (error) {
      this.logger.error(`Failed to delete cache by tag: ${tag}`, error);
      return 0;
    }
  }

  /**
   * 增加计数器
   * @param key 缓存键
   * @param increment 增量（默认 1）
   * @param ttl 过期时间（秒）
   */
  async incr(key: string, increment: number = 1, ttl?: number): Promise<number> {
    try {
      const client = this.redisService.getClient();
      const result = await client.incrby(key, increment);

      if (ttl) {
        await client.expire(key, ttl);
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to increment cache: ${key}`, error);
      return 0;
    }
  }

  /**
   * 获取剩余 TTL
   * @param key 缓存键
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redisService.ttl(key);
    } catch (error) {
      this.logger.error(`Failed to get TTL: ${key}`, error);
      return -1;
    }
  }

  /**
   * 序列化值
   */
  private serialize<T>(value: T): string {
    if (typeof value === 'string') {
      return value;
    }
    return JSON.stringify(value);
  }

  /**
   * 反序列化值
   */
  private deserialize<T>(value: string): T {
    try {
      return JSON.parse(value) as T;
    } catch {
      // 如果解析失败，返回原始字符串
      return value as unknown as T;
    }
  }

  /**
   * 将缓存键添加到标签集合
   */
  private async addToTags(key: string, tags: string[]): Promise<void> {
    try {
      const client = this.redisService.getClient();
      const pipeline = client.pipeline();

      for (const tag of tags) {
        const tagKey = `${this.TAG_PREFIX}${tag}`;
        pipeline.sadd(tagKey, key);
        // 标签集合设置较长的过期时间
        pipeline.expire(tagKey, 86400); // 24 小时
      }

      await pipeline.exec();
    } catch (error) {
      this.logger.error(`Failed to add cache key to tags: ${key}`, error);
    }
  }
}
