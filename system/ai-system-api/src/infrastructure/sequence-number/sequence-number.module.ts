/**
 * 序列号生成模块
 *
 * 提供基于 Redis 的分布式序列号生成服务
 * 支持多种业务类型的序列号生成（订单号、支付号、退款号等）
 */

import { Module } from '@nestjs/common';
import { SequenceNumberService } from './sequence-number.service';
import { RedisModule } from '@/infrastructure/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [SequenceNumberService],
  exports: [SequenceNumberService],
})
export class SequenceNumberModule {}
