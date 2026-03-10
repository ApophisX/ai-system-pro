/**
 * 日志工厂
 *
 * 创建和初始化日志系统
 */

import { INestApplication } from '@nestjs/common';
import { createWinstonLogger, WinstonConfig } from './winston.config';
import { WinstonLoggerAdapter } from './winston-logger.adapter';

/**
 * 初始化应用日志系统
 *
 * @param app NestJS 应用实例
 * @param config 日志配置（可选，使用环境变量作为默认值）
 */
export function initializeLogger(app: INestApplication, config?: Partial<WinstonConfig>): void {
  const environment = process.env.NODE_ENV || 'development';
  const enableConsole = process.env.LOG_CONSOLE !== 'false';
  const logLevel = process.env.LOG_LEVEL || 'info';

  const winstonConfig: WinstonConfig = {
    level: config?.level || logLevel,
    enableConsole: config?.enableConsole ?? enableConsole,
    environment: config?.environment || environment,
  };

  // 创建 Winston Logger
  const winstonLogger = createWinstonLogger(winstonConfig);

  // 将 Winston Logger 适配为 NestJS Logger
  const nestLogger = new WinstonLoggerAdapter(winstonLogger);
  app.useLogger(nestLogger);

  // 记录初始化完成日志
  winstonLogger.info('\n📔 可观测性初始化完成', {
    environment: winstonConfig.environment,
    logLevel: winstonConfig.level,
    enableConsole: winstonConfig.enableConsole,
  });
}
