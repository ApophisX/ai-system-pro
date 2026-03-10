/**
 * 日志服务
 *
 * 结构化日志输出服务
 *
 * 提供统一的日志接口，支持结构化日志输出
 * 底层使用 Winston Logger（通过 NestJS Logger 适配）
 *
 * 注意：
 * 1. 元数据会被序列化为 JSON 字符串附加到消息中
 * 2. 在生产环境中，Winston 会以 JSON 格式输出，元数据可以被解析
 * 3. 在开发环境中，元数据会以格式化字符串显示在控制台
 *
 * 使用示例：
 * ```typescript
 * export class OrderService {
 *   private readonly logger = new LoggerService(OrderService.name);
 *
 *   async create(dto: CreateOrderDto) {
 *     this.logger.log('Creating order', { orderId: dto.orderId, userId: dto.userId });
 *     // ... 业务逻辑
 *     this.logger.log('Order created', { orderId: order.id });
 *   }
 *
 *   async handleError(error: Error) {
 *     this.logger.error('Failed to process order', error, { orderId: 'xxx' });
 *   }
 * }
 * ```
 */

import { Logger } from '@nestjs/common';

/**
 * 日志元数据
 */
export interface LogMetadata {
  [key: string]: unknown;
}

/**
 * 日志服务
 *
 * 可直接实例化使用，类似于 NestJS Logger
 * 示例：private readonly logger = new LoggerService(OrderService.name);
 */
export class LoggerService {
  private readonly logger: Logger;
  private readonly context: string;

  constructor(context: string = LoggerService.name) {
    this.context = context;
    this.logger = new Logger(context);
  }

  /**
   * 记录信息日志
   *
   * @param message 日志消息
   * @param metadata 元数据（可选）
   */
  log(message: string, metadata?: LogMetadata): void {
    const formattedMessage = this.formatMessage(message, metadata);
    this.logger.log(formattedMessage);
  }

  /**
   * 记录错误日志
   *
   * @param message 错误消息
   * @param error 错误对象（可选）
   * @param metadata 元数据（可选）
   */
  error(message: string, error?: unknown, metadata?: LogMetadata): void {
    const formattedMessage = this.formatErrorMessage(message, error, metadata);
    const stack = error instanceof Error ? error.stack : undefined;
    this.logger.error(formattedMessage, stack);
  }

  /**
   * 记录警告日志
   *
   * @param message 警告消息
   * @param metadata 元数据（可选）
   */
  warn(message: string, metadata?: LogMetadata): void {
    const formattedMessage = this.formatMessage(message, metadata);
    this.logger.warn(formattedMessage);
  }

  /**
   * 记录调试日志
   *
   * @param message 调试消息
   * @param metadata 元数据（可选）
   */
  debug(message: string, metadata?: LogMetadata): void {
    const formattedMessage = this.formatMessage(message, metadata);
    this.logger.debug(formattedMessage);
  }

  /**
   * 记录详细日志
   *
   * @param message 详细消息
   * @param metadata 元数据（可选）
   */
  verbose(message: string, metadata?: LogMetadata): void {
    const formattedMessage = this.formatMessage(message, metadata);
    this.logger.verbose(formattedMessage);
  }

  /**
   * 格式化日志消息（包含元数据）
   *
   * 注意：由于 NestJS Logger 接口限制，元数据会被序列化为 JSON 字符串
   * 在生产环境的 JSON 格式日志中，元数据仍然可以被正确解析和查询
   *
   * @param message 原始消息
   * @param metadata 元数据
   * @returns 格式化后的消息
   */
  private formatMessage(message: string, metadata?: LogMetadata): string {
    if (!metadata || Object.keys(metadata).length === 0) {
      return message;
    }

    // 将元数据序列化为 JSON 字符串，附加到消息中
    // 在生产环境的 JSON 格式日志中，这些元数据可以被解析和查询
    try {
      const metadataStr = JSON.stringify(metadata);
      return `${message} ${metadataStr}`;
    } catch {
      // 如果序列化失败（如循环引用），只输出消息
      this.logger.warn('Failed to serialize log metadata');
      return message;
    }
  }

  /**
   * 格式化错误消息
   *
   * @param message 错误消息
   * @param error 错误对象
   * @param metadata 元数据
   * @returns 格式化后的错误消息
   */
  private formatErrorMessage(message: string, error?: unknown, metadata?: LogMetadata): string {
    let errorMessage = message;

    // 添加错误信息
    if (error instanceof Error) {
      errorMessage = `${message}: ${error.message}`;
    } else if (error !== null && error !== undefined) {
      // 安全地将错误转换为字符串
      const errorType = typeof error;
      let errorStr: string;
      if (errorType === 'string') {
        errorStr = error as string;
      } else if (errorType === 'object') {
        try {
          errorStr = JSON.stringify(error);
        } catch {
          errorStr = '[Object]';
        }
      } else {
        // 处理基本类型（number, boolean, symbol, bigint 等）
        // 此时 error 不可能是 object 类型，可以安全使用 String()
        const primitiveError: string | number | boolean | symbol | bigint = error as
          | string
          | number
          | boolean
          | symbol
          | bigint;
        errorStr = String(primitiveError);
      }
      errorMessage = `${message}: ${errorStr}`;
    }

    // 添加元数据
    if (metadata && Object.keys(metadata).length > 0) {
      try {
        const metadataStr = JSON.stringify(metadata);
        errorMessage = `${errorMessage} ${metadataStr}`;
      } catch {
        // 忽略序列化错误
      }
    }

    return errorMessage;
  }

  /**
   * 创建子日志服务（用于特定模块或功能）
   *
   * @param context 上下文名称
   * @returns 新的 LoggerService 实例
   */
  createChild(context: string): LoggerService {
    return new LoggerService(context);
  }

  /**
   * 获取当前上下文
   *
   * @returns 上下文名称
   */
  getContext(): string {
    return this.context;
  }
}
