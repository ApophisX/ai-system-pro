/**
 * NestJS Winston 日志适配器
 *
 * 将 Winston Logger 适配为 NestJS Logger 接口
 */

import { ConsoleLogger } from '@nestjs/common';
import * as winston from 'winston';

/**
 * NestJS Winston 日志适配器
 *
 * 实现 NestJS Logger 接口，将日志输出到 Winston
 */
export class WinstonLoggerAdapter extends ConsoleLogger {
  constructor(private readonly winstonLogger: winston.Logger) {
    super();
  }

  log(message: string, context?: string) {
    this.winstonLogger.info(message, { context });
    // 不调用 super.log，避免重复输出
  }

  error(message: string, trace?: string, context?: string) {
    this.winstonLogger.error(message, { context, trace });
    // 不调用 super.error，避免重复输出
  }

  warn(message: string, context?: string) {
    this.winstonLogger.warn(message, { context });
    // 不调用 super.warn，避免重复输出
  }

  debug(message: string, context?: string) {
    this.winstonLogger.debug(message, { context });
    // 不调用 super.debug，避免重复输出
  }

  verbose(message: string, context?: string) {
    this.winstonLogger.debug(message, { context, verbose: true });
    // 不调用 super.verbose，避免重复输出
  }
}
