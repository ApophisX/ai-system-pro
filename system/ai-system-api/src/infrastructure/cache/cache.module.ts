/**
 * 缓存模块
 *
 * 提供基于 Redis 的缓存服务
 */

import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { RedisModule } from '@/infrastructure/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
