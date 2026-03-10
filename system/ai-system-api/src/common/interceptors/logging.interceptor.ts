/**
 * 请求日志拦截器
 *
 * 记录所有 HTTP 请求的关键信息
 * - 请求开始和结束
 * - 响应时间
 * - 请求/响应摘要
 */

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoggerService } from '@/infrastructure/logger/logger.service';
import { REQUEST_ID_HEADER } from '@/common/constants/request-header.constant';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new LoggerService('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, query, ip } = request;
    const requestId = request.headers[REQUEST_ID_HEADER] as string;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // 记录请求开始
    this.logger.log('Incoming request', {
      requestId,
      method,
      url,
      query: this.sanitizeData(query),
      body: this.sanitizeData(body),
      ip,
      userAgent: userAgent.substring(0, 100), // 截断过长的 UA
    });

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const response = context.switchToHttp().getResponse();

        this.logger.log('Request completed', {
          requestId,
          method,
          url,
          statusCode: response.statusCode,
          duration: `${duration}ms`,
        });
      }),
      catchError(error => {
        const duration = Date.now() - startTime;

        this.logger.error('Request failed', error, {
          requestId,
          method,
          url,
          duration: `${duration}ms`,
        });

        return throwError(() => error);
      }),
    );
  }

  /**
   * 清理敏感数据
   * 移除或遮蔽敏感字段
   */
  private sanitizeData(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'apiKey',
      'authorization',
      'creditCard',
      'cardNumber',
      'cvv',
      'idCard',
      'idNumber',
    ];

    const sanitized = { ...data } as Record<string, unknown>;

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
      // 也检查小写版本
      const lowerField = field.toLowerCase();
      if (lowerField in sanitized) {
        sanitized[lowerField] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}
