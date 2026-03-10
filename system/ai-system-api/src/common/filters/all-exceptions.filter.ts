/**
 * 全局异常过滤器
 *
 * 统一处理所有异常，提供标准化的错误响应格式
 * - 记录错误日志
 * - 隐藏生产环境敏感信息
 * - 统一错误响应格式
 */

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '@/infrastructure/logger/logger.service';
import { REQUEST_ID_HEADER } from '@/common/constants/request-header.constant';
import { IS_PROD } from '@/common/constants/global';
import { ApiErrorResponse, ApiErrorDetail } from '@/common/dtos/base-response.dto';
import dayjs from 'dayjs';

/**
 * 从异常中提取错误详情
 */
interface ExceptionDetails {
  statusCode: number;
  message: string;
  errorName: string;
  details: unknown;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new LoggerService(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = (request.headers[REQUEST_ID_HEADER] as string) || '';
    const { statusCode, message, errorName, details } = this.extractExceptionDetails(exception);

    // 记录错误日志
    this.logException(exception, {
      requestId,
      path: request.url,
      method: request.method,
      statusCode,
    });

    // 构建错误响应
    const errorDetail: ApiErrorDetail = {
      statusCode,
      message: this.getSafeMessage(statusCode, message),
      localizedMessage: this.getLocalizedMessage(statusCode, message),
      errorName,
      details: IS_PROD ? null : details,
      path: request.url,
      requestId,
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };

    const errorResponse: ApiErrorResponse = {
      code: statusCode,
      message: errorDetail.message,
      error: errorDetail,
    };

    response.status(statusCode).json(errorResponse);
  }

  /**
   * 从异常对象中提取错误详情
   */
  private extractExceptionDetails(exception: unknown): ExceptionDetails {
    // HttpException（NestJS 内置异常）
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      let message: string;
      let details: unknown = null;

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) || (responseObj.error as string) || exception.message;
        details = responseObj;
      } else {
        message = exception.message;
      }

      return {
        statusCode: status,
        message,
        errorName: exception.name,
        details,
      };
    }

    // 标准 Error
    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
        errorName: exception.name,
        details: IS_PROD ? null : { stack: exception.stack },
      };
    }

    // 未知类型
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '服务器内部错误',
      errorName: 'UnknownError',
      details: IS_PROD ? null : exception,
    };
  }

  /**
   * 获取安全的错误消息（生产环境隐藏敏感信息）
   */
  private getSafeMessage(statusCode: number, message: string): string {
    // 生产环境下，500 及以上错误返回通用消息
    const serverErrorThreshold = HttpStatus.INTERNAL_SERVER_ERROR as number;
    if (IS_PROD && statusCode >= serverErrorThreshold) {
      return '服务器内部错误，请稍后重试';
    }
    return message;
  }

  /**
   * 获取本地化错误消息
   */
  private getLocalizedMessage(statusCode: number, message: string): string {
    // 常见错误码的中文映射
    const statusMessages: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: '请求参数错误',
      [HttpStatus.UNAUTHORIZED]: '未授权，请先登录',
      [HttpStatus.FORBIDDEN]: '禁止访问',
      [HttpStatus.NOT_FOUND]: '资源不存在',
      [HttpStatus.METHOD_NOT_ALLOWED]: '请求方法不允许',
      [HttpStatus.CONFLICT]: '资源冲突',
      [HttpStatus.UNPROCESSABLE_ENTITY]: '请求数据验证失败',
      [HttpStatus.TOO_MANY_REQUESTS]: '请求过于频繁，请稍后重试',
      [HttpStatus.INTERNAL_SERVER_ERROR]: '服务器内部错误',
      [HttpStatus.BAD_GATEWAY]: '网关错误',
      [HttpStatus.SERVICE_UNAVAILABLE]: '服务暂时不可用',
      [HttpStatus.GATEWAY_TIMEOUT]: '网关超时',
    };

    return statusMessages[statusCode] || message;
  }

  /**
   * 记录异常日志
   */
  private logException(
    exception: unknown,
    context: {
      requestId: string;
      path: string;
      method: string;
      statusCode: number;
    },
  ): void {
    const { requestId, path, method, statusCode } = context;

    const serverErrorThreshold = HttpStatus.INTERNAL_SERVER_ERROR as number;
    const clientErrorThreshold = HttpStatus.BAD_REQUEST as number;

    // 5xx 错误使用 error 级别
    if (statusCode >= serverErrorThreshold) {
      this.logger.error('Request failed with server error', exception, {
        requestId,
        path,
        method,
        statusCode,
      });
    } else if (statusCode >= clientErrorThreshold) {
      // 4xx 错误使用 warn 级别
      this.logger.warn('Request failed with client error', {
        requestId,
        path,
        method,
        statusCode,
        message: exception instanceof Error ? exception.message : String(exception),
      });
    }
  }
}
