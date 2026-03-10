/**
 * 健康检查服务
 *
 * 检查系统各组件的健康状态
 */

import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RedisService } from '@/infrastructure/redis/redis.service';
import dayjs from 'dayjs';

/**
 * 组件健康状态
 */
export interface ComponentHealth {
  /** 组件名称 */
  name: string;
  /** 是否健康 */
  healthy: boolean;
  /** 状态描述 */
  message?: string;
  /** 响应时间（毫秒） */
  responseTime?: number;
  /** 额外信息 */
  details?: Record<string, unknown>;
}

/**
 * 系统健康状态
 */
export interface SystemHealth {
  /** 整体状态 */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** 时间戳 */
  timestamp: string;
  /** 系统运行时间（秒） */
  uptime: number;
  /** 环境 */
  environment: string;
  /** 版本 */
  version: string;
  /** 各组件状态 */
  components: ComponentHealth[];
  /** 内存使用情况 */
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 获取系统健康状态
   */
  async getHealth(): Promise<SystemHealth> {
    const components = await Promise.all([this.checkDatabase(), this.checkRedis()]);

    // 判断整体状态
    const allHealthy = components.every(c => c.healthy);
    const anyHealthy = components.some(c => c.healthy);
    let status: 'healthy' | 'degraded' | 'unhealthy';

    if (allHealthy) {
      status = 'healthy';
    } else if (anyHealthy) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    const memoryUsage = process.memoryUsage();

    return {
      status,
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || '',
      version: process.env.APP_VERSION || '',
      components,
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      },
    };
  }

  /**
   * 简单的存活检查
   */
  async getLiveness(): Promise<{ status: string; timestamp: string }> {
    return Promise.resolve({
      status: 'ok',
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    });
  }

  /**
   * 就绪检查（检查关键依赖）
   */
  async getReadiness(): Promise<{
    status: string;
    timestamp: string;
    ready: boolean;
  }> {
    const [dbHealth, redisHealth] = await Promise.all([this.checkDatabase(), this.checkRedis()]);

    // 数据库必须健康才算就绪
    const ready = dbHealth.healthy;

    return {
      status: ready ? 'ready' : 'not ready',
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      ready,
    };
  }

  /**
   * 检查数据库连接
   */
  private async checkDatabase(): Promise<ComponentHealth> {
    const startTime = Date.now();

    try {
      // 执行简单查询
      await this.dataSource.query('SELECT 1');
      const responseTime = Date.now() - startTime;

      return {
        name: 'database',
        healthy: true,
        message: 'MySQL connection is healthy',
        responseTime,
        details: {
          type: 'mysql',
          isConnected: this.dataSource.isInitialized,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Database health check failed', error);

      return {
        name: 'database',
        healthy: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      };
    }
  }

  /**
   * 检查 Redis 连接
   */
  private async checkRedis(): Promise<ComponentHealth> {
    const startTime = Date.now();

    try {
      const client = this.redisService.getClient();
      await client.ping();
      const responseTime = Date.now() - startTime;

      return {
        name: 'redis',
        healthy: true,
        message: 'Redis connection is healthy',
        responseTime,
        details: {
          status: client.status,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Redis health check failed', error);

      return {
        name: 'redis',
        healthy: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      };
    }
  }
}
