/**
 * 响应转换拦截器
 *
 * 统一包装所有成功响应为标准 ApiResponse 格式
 * - 自动包装返回数据
 * - 支持分页响应
 * - 跳过已格式化的响应
 */

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@/common/dtos/base-response.dto';

/**
 * 检查是否为已格式化的 ApiResponse
 */
function isApiResponse(data: unknown): data is ApiResponse {
  return data !== null && typeof data === 'object' && 'code' in data && typeof (data as ApiResponse).code === 'number';
}

/**
 * 检查是否为分页数据
 */
interface PaginatedData<T> {
  code?: number;
  message?: string;
  items: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
}

function isPaginatedData<T>(data: unknown): data is PaginatedData<T> {
  return (
    data !== null &&
    typeof data === 'object' &&
    'items' in data &&
    'meta' in data &&
    Array.isArray((data as PaginatedData<T>).items)
  );
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map(data => {
        // 如果已经是 ApiResponse 格式，直接返回
        if (isApiResponse(data)) {
          return data as ApiResponse<T>;
        }

        // 如果是分页数据，提取 items 和 meta
        if (isPaginatedData(data)) {
          return {
            code: data.code || 0,
            message: data.message || 'success',
            data: data.items as T,
            meta: data.meta,
          };
        }

        // 普通数据，包装为标准格式
        return {
          code: 0,
          message: 'success',
          ...data,
        };
      }),
    );
  }
}
