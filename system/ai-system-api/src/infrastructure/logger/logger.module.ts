/**
 * 日志模块
 *
 * 日志配置和管理
 *
 * 注意：
 * 1. 日志系统的初始化在 bootstrap/init-observability.ts 中完成
 * 2. LoggerService 可直接实例化使用（类似于 NestJS Logger），无需依赖注入
 * 3. 使用示例：private readonly logger = new LoggerService(ServiceName);
 */

import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
  exports: [],
})
export class LoggerModule {}
