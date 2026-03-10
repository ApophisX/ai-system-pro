/**
 * 配置模块导出
 *
 * 集中管理所有应用配置
 */

import { appConfig } from './app.config';
import { serverConfig } from './server.config';
import { databaseConfig } from './database.config';
import { redisConfig } from './redis.config';
import { authConfig } from './auth.config';
import { mqConfig } from './mq.config';
import { observabilityConfig } from './observability.config';
import { smsConfig } from './sms.config';
import { throttlerConfig } from './throttler.config';
import { ossConfig } from './oss.config';
import { wechatConfig } from './wechat.config';
import { recognitionConfig } from './recognition.config';
import { withdrawConfig } from './withdraw.config';

export * from './app.config';
export * from './server.config';
export * from './database.config';
export * from './redis.config';
export * from './auth.config';
export * from './mq.config';
export * from './observability.config';
export * from './sms.config';
export * from './throttler.config';
export * from './oss.config';
export * from './wechat.config';
export * from './recognition.config';
export * from './withdraw.config';

export const APP_CONFIGS = [
  appConfig,
  serverConfig,
  databaseConfig,
  redisConfig,
  authConfig,
  mqConfig,
  observabilityConfig,
  smsConfig,
  throttlerConfig,
  ossConfig,
  wechatConfig,
  recognitionConfig,
  withdrawConfig,
];
