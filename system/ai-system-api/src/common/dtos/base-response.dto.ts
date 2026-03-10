import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMetaDto } from './base-query.dto';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

/**
 * 错误显示类型枚举
 * 定义前端如何展示错误信息
 */
export enum ErrorDisplayType {
  /**
   * 静默处理，不显示任何提示
   */
  Silent = 0,
  /**
   * 警告消息，显示警告提示
   */
  WarningMessage = 1,
  /**
   * 错误消息，显示错误提示
   */
  ErrorMessage = 2,
  /**
   * 通知消息，显示通知提示
   */
  Notification = 3,
  /**
   * 重定向，跳转到指定页面
   */
  Redirect = 9,
}

/**
 * API 响应基础类
 * 包含所有 API 响应的通用字段
 */
class ApiResponseBase {
  /**
   * 响应状态码，0 表示成功，非 0 表示失败
   */
  @ApiProperty({ type: Number, default: 0 })
  code?: number;

  /**
   * 响应消息，通常为 'success' 或错误描述
   */
  @ApiProperty({ type: String, default: 'success' })
  message?: string;
}

/**
 * 通用 API 响应类
 * 用于统一所有 API 接口的响应格式
 */
export class ApiResponse<T = any> extends ApiResponseBase {
  /**
   * 响应数据，类型由泛型 T 决定
   */
  data?: T;

  /**
   * 分页元数据，仅在分页查询时存在
   */
  meta?: PaginationMetaDto;
}

/**
 * API 错误详情类
 * 包含错误的详细信息，用于错误响应
 */
export class ApiErrorDetail {
  /**
   * HTTP 状态码（如 400, 404, 500 等）
   */
  @ApiProperty({ type: Number })
  statusCode: number;

  /**
   * 错误消息，描述错误原因
   */
  @ApiProperty({ type: String })
  message: string;

  /**
   * 本地化错误消息，用于多语言支持
   */
  @ApiPropertyOptional({ type: String })
  localizedMessage: string;

  /**
   * 错误名称，错误类型的标识（如 'BadRequestException', 'NotFoundException' 等）
   */
  @ApiProperty({ type: String })
  errorName: string;

  /**
   * 错误详情，包含额外的错误信息（如验证失败的字段详情）
   */
  @ApiProperty({ type: Object })
  details: unknown;

  /**
   * 请求路径
   */
  @ApiProperty({ type: String })
  path: string;

  /**
   * 请求 ID，用于追踪和日志关联
   */
  @ApiProperty({ type: String })
  requestId: string;

  /**
   * 错误发生的时间戳（ISO 8601 格式）
   */
  @ApiProperty({ type: String })
  timestamp: string;
}

/**
 * API 错误响应类
 * 统一所有错误响应的格式
 */
export class ApiErrorResponse extends ApiResponseBase {
  /**
   * 错误详情对象，包含详细的错误信息
   */
  @ApiProperty({ type: ApiErrorDetail })
  error: ApiErrorDetail;
}

/**
 * Promise 类型的 API 响应
 * 用于 Controller 方法的返回类型定义
 *
 * @template T 响应数据的类型
 *
 * @example
 * ```typescript
 * @Get(':id')
 * async getUser(@Param('id') id: string): PromiseApiResponse<UserDto> {
 *   return {
 *     code: 0,
 *     message: 'success',
 *     data: userDto
 *   };
 * }
 * ```
 */
export type PromiseApiResponse<T = any> = Promise<ApiResponse<T>>;

/**
 * 创建 Swagger API 响应类的工厂函数
 * 用于为 Swagger 文档生成正确的响应类型定义
 *
 * @template T 响应数据的类型
 * @param type 响应数据的类型定义（可以是类、数组等）
 * @returns 带有 Swagger 装饰器的响应类
 *
 * @remarks
 * 此函数会根据传入的类型自动判断是分页响应还是普通响应：
 * - 如果传入数组类型，返回带分页元数据的响应类
 * - 如果传入普通类型，返回基础响应类
 *
 * 注意：通过重写类名避免 Swagger 文档中所有响应类型被覆盖为同一个类型
 * 兼容 umi-openapi 工具
 *
 * @example
 * ```typescript
 * // 在 Controller 中使用
 * @ApiResponse({ type: createSwaggerApiResponse(UserDto) })
 * async getUser(): Promise<ApiResponse<UserDto>> {
 *   // ...
 * }
 *
 * // 分页响应
 * @ApiResponse({ type: createSwaggerApiResponse([UserDto]) })
 * async getUsers(): Promise<ApiResponse<UserDto[]>> {
 *   // ...
 * }
 * ```
 */
export function createSwaggerApiResponse<T = any>(type: T): typeof ApiResponse {
  /**
   * 分页响应类，包含分页元数据
   */
  class PaginatedSwaggerApiResponse<T> extends ApiResponse<T> {
    @ApiProperty({ type: type as any })
    declare data: T;

    @ApiProperty({ type: PaginationMetaDto })
    declare meta: PaginationMetaDto;
  }

  /**
   * 基础响应类，不包含分页元数据
   */
  class BasicSwaggerApiResponse<T> extends ApiResponseBase {
    @ApiProperty({ type: type as any })
    data: T;
  }

  // NOTE : Overwrite the returned class name, otherwise whichever type calls this function in the last,
  // will overwrite all previous definitions. i.e., Swagger will have all response types as the same one.
  // 兼容umiopenapi
  const isAnArray = Array.isArray(type) ? '[]' : '';
  Object.defineProperty(isAnArray ? PaginatedSwaggerApiResponse : BasicSwaggerApiResponse, 'name', {
    value: `ApiResponse${isAnArray ? type[0]['name'] : type['name']}${isAnArray}`,
  });
  return isAnArray ? PaginatedSwaggerApiResponse : BasicSwaggerApiResponse;
}

export class KeyValuePair {
  @Expose()
  @ApiProperty({ type: String })
  @IsNotEmpty()
  key: string;
  @Expose()
  @ApiProperty({ type: String })
  @IsNotEmpty()
  value: string;
}
