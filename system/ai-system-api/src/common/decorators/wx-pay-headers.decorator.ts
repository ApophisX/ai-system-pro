import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * 微信支付回调请求头
 */
export interface WxPayCallbackHeaders {
  timestamp: string;
  nonce: string;
  signature: string;
  serial: string;
}

/**
 * 微信支付回调请求头装饰器
 *
 * 用于从请求头中提取微信支付回调所需的4个请求头参数：
 * - wechatpay-timestamp: 时间戳
 * - wechatpay-nonce: 随机串
 * - wechatpay-signature: 签名
 * - wechatpay-serial: 证书序列号
 *
 * 使用示例：
 * ```typescript
 * async notify(
 *   @Body() body: WxPay.WxPayNotifyResponse,
 *   @WxPayHeaders() headers: WxPayCallbackHeaders,
 * ) {
 *   const { timestamp, nonce, signature, serial } = headers;
 *   // ...
 * }
 * ```
 */
export const WxPayHeaders = createParamDecorator((data: unknown, ctx: ExecutionContext): WxPayCallbackHeaders => {
  const request: Request = ctx.switchToHttp().getRequest();
  const headers = request.headers;
  return {
    timestamp: (headers['wechatpay-timestamp'] as string) || '',
    nonce: (headers['wechatpay-nonce'] as string) || '',
    signature: (headers['wechatpay-signature'] as string) || '',
    serial: (headers['wechatpay-serial'] as string) || '',
  };
});
