/**
 * 安全初始化
 *
 * 初始化安全相关的配置，包括安全头、请求大小限制、超时设置等
 */

import { IS_PROD } from '@/common/constants/global';
import { INestApplication, Logger } from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';

const logger = new Logger('Security');

/**
 * 初始化安全配置
 *
 * @param app NestJS 应用实例
 */
export function initializeSecurity(app: INestApplication): void {
  const environment = process.env.NODE_ENV || 'development';

  app.use(helmet());

  // 1. 启用 gzip 压缩
  app.use(compression());

  // 2. 安全 HTTP 头设置
  app.use((req: any, res: any, next: any) => {
    // 防止 MIME 类型嗅探
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // 防止点击劫持
    res.setHeader('X-Frame-Options', 'DENY');
    // XSS 保护
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // CSP 基础配置
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data: https:",
    );
    // HTTPS 强制 (仅生产环境)
    if (IS_PROD) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });

  // 3. 请求大小限制
  app.use((req: any, res: any, next: any) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const contentLength = parseInt((req.get?.('content-length') as string) || '0', 10);
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (contentLength > maxSize) {
        res.status(413).json({
          statusCode: 413,
          message: 'Payload too large',
        });
        return;
      }
    }
    next();
  });

  // 4. 请求超时设置
  const requestTimeout = parseInt(process.env.REQUEST_TIMEOUT || '30000', 10);
  app.use((req: any, res: any, next: any) => {
    req.setTimeout?.(requestTimeout);
    res.setTimeout?.(requestTimeout);
    next();
  });

  // 5. 禁用 X-Powered-By 头
  app.use((req: any, res: any, next: any) => {
    res.removeHeader?.('X-Powered-By');
    next();
  });

  logger.log(`
🔒 安全配置初始化完成
⏱️ 请求超时: ${requestTimeout}ms
📦 压缩: 已启用
          `);
}
