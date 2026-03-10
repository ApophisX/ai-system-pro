/**
 * 可观测性初始化
 *
 * 初始化日志、链路追踪、性能监控等可观测性相关的配置
 *
 * 注意：日志配置已迁移到 infrastructure/logger，此文件仅作为启动入口
 */

import { INestApplication } from '@nestjs/common';
import { initializeLogger } from '@/infrastructure/logger/logger.factory';

/**
 * 初始化可观测性
 *
 * @param app NestJS 应用实例
 */
export function initializeObservability(app: INestApplication): void {
  // 初始化日志系统
  initializeLogger(app);

  // TODO: 未来可在此添加其他可观测性初始化：
  // - 分布式链路追踪（Jaeger/Zipkin）
  // - APM 工具集成（DataDog/New Relic）
  // - 性能监控（Prometheus）
}
