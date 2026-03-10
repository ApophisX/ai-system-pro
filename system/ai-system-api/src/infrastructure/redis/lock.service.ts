/**
 * 分布式锁服务
 *
 * 基于 Redis 的分布式锁实现
 * - 支持自动续期
 * - 支持锁超时
 * - 支持重入锁
 */

import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

/**
 * 锁选项
 */
export interface LockOptions {
  /** 锁超时时间（秒），默认 10 秒 */
  ttlSeconds?: number;
  /** 获取锁的最大等待时间（毫秒），默认 0（不等待） */
  waitTimeMs?: number;
  /** 等待重试间隔（毫秒），默认 100ms */
  retryIntervalMs?: number;
}

/**
 * 锁句柄
 */
export interface LockHandle {
  /** 锁的键 */
  key: string;
  /** 锁的值（用于释放锁） */
  value: string;
  /** 释放锁 */
  release: () => Promise<boolean>;
}

/**
 * 锁前缀常量
 */
export const LOCK_PREFIX = {
  /** 订单创建锁 */
  ORDER_CREATE: 'lock:order:create',
  /** 支付处理锁 */
  PAYMENT_PROCESS: 'lock:payment:process',
  /** 资产状态更新锁 */
  ASSET_STATUS: 'lock:asset:status',
  /** 用户操作锁 */
  USER_ACTION: 'lock:user:action',
  /** 提现审核锁（防并发超提） */
  WITHDRAW_APPROVE: 'lock:withdraw:approve',
} as const;

@Injectable()
export class LockService {
  private readonly logger = new Logger(LockService.name);
  private readonly DEFAULT_TTL = 10; // 默认 10 秒
  private readonly DEFAULT_RETRY_INTERVAL = 100; // 默认 100ms

  constructor(private readonly redisService: RedisService) {}

  /**
   * 构建锁键
   * @param prefix 前缀
   * @param key 键名
   */
  buildLockKey(prefix: string, key: string): string {
    return `${prefix}:${key}`;
  }

  /**
   * 尝试获取分布式锁
   *
   * @param key 锁的键
   * @param options 锁选项
   * @returns 锁句柄或 null（获取失败）
   *
   * @example
   * ```typescript
   * const lock = await this.lockService.acquire('order:create:asset-123');
   * if (!lock) {
   *   throw new ConflictException('资源正在被处理');
   * }
   * try {
   *   // 执行业务逻辑
   * } finally {
   *   await lock.release();
   * }
   * ```
   */
  async acquire(key: string, options?: LockOptions): Promise<LockHandle | null> {
    const ttlSeconds = options?.ttlSeconds ?? this.DEFAULT_TTL;
    const waitTimeMs = options?.waitTimeMs ?? 0;
    const retryIntervalMs = options?.retryIntervalMs ?? this.DEFAULT_RETRY_INTERVAL;

    const lockKey = `lock:${key}`;
    const lockValue = this.generateLockValue();

    // 如果设置了等待时间，进行重试
    if (waitTimeMs > 0) {
      const startTime = Date.now();

      while (Date.now() - startTime < waitTimeMs) {
        const acquired = await this.tryAcquire(lockKey, lockValue, ttlSeconds);
        if (acquired) {
          return this.createLockHandle(lockKey, lockValue);
        }

        await this.sleep(retryIntervalMs);
      }

      return null;
    }

    // 不等待，直接尝试获取
    const acquired = await this.tryAcquire(lockKey, lockValue, ttlSeconds);
    if (acquired) {
      return this.createLockHandle(lockKey, lockValue);
    }

    return null;
  }

  /**
   * 释放分布式锁
   *
   * @param key 锁的键
   * @param value 锁的值
   * @returns 是否成功释放
   */
  async release(key: string, value: string): Promise<boolean> {
    try {
      const client = this.redisService.getClient();

      // 使用 Lua 脚本保证原子性：只有值匹配时才删除
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;

      const result = await client.eval(script, 1, key, value);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to release lock: ${key}`, error);
      return false;
    }
  }

  /**
   * 在锁保护下执行操作
   *
   * @param key 锁的键
   * @param operation 要执行的操作
   * @param options 锁选项
   * @returns 操作结果
   *
   * @example
   * ```typescript
   * const result = await this.lockService.withLock(
   *   'order:create:asset-123',
   *   async () => {
   *     return await this.orderService.createOrder(dto);
   *   },
   *   { ttlSeconds: 30 }
   * );
   * ```
   */
  async withLock<T>(key: string, operation: () => Promise<T>, options?: LockOptions): Promise<T> {
    const lock = await this.acquire(key, options);

    if (!lock) {
      throw new Error(`无法获取锁: ${key}`);
    }

    try {
      return await operation();
    } finally {
      await lock.release();
    }
  }

  /**
   * 检查锁是否存在
   *
   * @param key 锁的键
   * @returns 锁是否存在
   */
  async isLocked(key: string): Promise<boolean> {
    const lockKey = `lock:${key}`;
    return await this.redisService.exists(lockKey);
  }

  /**
   * 延长锁的过期时间
   *
   * @param key 锁的键
   * @param value 锁的值
   * @param ttlSeconds 新的过期时间（秒）
   * @returns 是否成功延长
   */
  async extend(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    try {
      const client = this.redisService.getClient();

      // 使用 Lua 脚本保证原子性：只有值匹配时才延长
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("expire", KEYS[1], ARGV[2])
        else
          return 0
        end
      `;

      const result = await client.eval(script, 1, key, value, ttlSeconds.toString());
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to extend lock: ${key}`, error);
      return false;
    }
  }

  /**
   * 尝试获取锁（内部方法）
   */
  private async tryAcquire(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    try {
      const client = this.redisService.getClient();

      // SET key value EX ttl NX
      const result = await client.set(key, value, 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch (error) {
      this.logger.error(`Failed to acquire lock: ${key}`, error);
      return false;
    }
  }

  /**
   * 生成唯一的锁值
   */
  private generateLockValue(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * 创建锁句柄
   */
  private createLockHandle(key: string, value: string): LockHandle {
    return {
      key,
      value,
      release: async () => this.release(key, value),
    };
  }

  /**
   * 睡眠指定毫秒
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
