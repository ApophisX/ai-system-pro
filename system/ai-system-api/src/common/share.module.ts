/**
 * 共享模块
 *
 * 提供全局共享的基础设施模块
 * 包括：数据库连接、缓存、日志、事务管理、事件等
 *
 * 使用方式：
 * ```typescript
 * @Module({
 *   imports: [ShareModule],
 * })
 * export class YourModule {}
 * ```
 */

import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { OrmModule } from '@/infrastructure/database/orm.module';
import { TransactionManager } from '@/infrastructure/database/transaction.manager';
import { LoggerModule } from '@/infrastructure/logger/logger.module';

@Global()
@Module({
  imports: [
    OrmModule,
    LoggerModule,
    // 事件发射器模块（全局）
    // 用于模块间解耦通信，如支付回调通知订单模块
    EventEmitterModule.forRoot({
      // 通配符支持，如 'payment.*' 可以匹配 'payment.completed'
      wildcard: true,
      // 分隔符
      delimiter: '.',
      // 启用新监听器警告（超过 10 个监听器时警告）
      newListener: false,
      // 启用移除监听器事件
      removeListener: false,
      // 最大监听器数量
      maxListeners: 20,
      // 错误时打印堆栈
      verboseMemoryLeak: true,
      // 忽略未处理的错误
      ignoreErrors: false,
    }),
  ],
  controllers: [],
  providers: [TransactionManager],
  exports: [OrmModule, LoggerModule, TransactionManager, EventEmitterModule],
})
export class ShareModule {}
