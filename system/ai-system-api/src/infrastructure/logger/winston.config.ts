/**
 * Winston 日志配置
 *
 * 配置 Winston 日志系统，包括格式、传输器（控制台、文件等）
 */

import { IS_DEV, IS_PROD, IS_STAGING } from '@/common/constants/global';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export interface WinstonConfig {
  level: string;
  enableConsole: boolean;
  environment: string;
}

/**
 * 创建 Winston Logger 实例
 *
 * @param config 日志配置
 * @returns Winston Logger 实例
 */
export function createWinstonLogger(config: WinstonConfig): winston.Logger {
  const { level, enableConsole, environment } = config;

  const logger = winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
    ),
    defaultMeta: {
      service: process.env.APP_NAME,
      environment,
    },
    transports: [],
  });

  // 开发环境：输出到控制台
  if (enableConsole && IS_DEV) {
    logger.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(info => {
            const { timestamp, level, message, ...meta } = info;
            const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta, null, 2)}` : '';
            return `[${String(timestamp)}] [${String(level)}] ${String(message)}${metaStr}`;
          }),
        ),
      }),
    );
  }

  // 生产环境：输出到日志文件
  if (IS_PROD || IS_STAGING) {
    // 应用日志
    logger.add(
      new DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        level: 'info',
      }),
    );

    // 错误日志
    logger.add(
      new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
        level: 'error',
      }),
    );
  }

  return logger;
}
