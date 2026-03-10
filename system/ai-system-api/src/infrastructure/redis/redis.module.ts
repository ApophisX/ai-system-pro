/**
 * Redis 模块
 *
 * Redis 连接和配置
 * - Redis 基础服务
 * - 分布式锁服务
 */

import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis.service';
import { LockService } from './lock.service';
import { redisConfig } from '@/config';

@Global()
@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [RedisService, LockService],
  exports: [RedisService, LockService],
})
export class RedisModule {}
