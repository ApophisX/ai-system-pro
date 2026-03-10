import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiResponseOptions } from '@nestjs/swagger';
import { createSwaggerApiResponse } from '../dtos/base-response.dto';

export function SwaggerApiResponse<T = any>(type: T, options?: ApiResponseOptions) {
  return applyDecorators(
    ApiResponse({
      description: options?.description || '请求成功',
      status: options?.status || 200,
      ...options,
      type: createSwaggerApiResponse(type),
    }),
  );
}
