import { Controller, Post, Body, HttpCode, HttpStatus, Logger, Req, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { WxPayService } from '../services/wx-pay.service';
import { PaymentService } from '../services/payment.service';
import { PaymentStatus } from '../enums/payment-status.enum';
import { RefundStatus } from '../enums';
import { WxPayHeaders } from '@/common/decorators';
import type { WxPayCallbackHeaders } from '@/common/decorators';

/**
 * 包含原始请求体的请求对象
 *
 * 用于微信支付回调签名验证，需要使用原始请求体而非解析后的 JSON
 */
interface RawBodyRequest {
  rawBody?: Buffer;
}

/**
 * 微信支付控制器
 *
 * 负责处理微信支付相关的回调通知
 *
 * 重要说明：
 * 1. 此控制器的接口不需要 JWT 认证，因为是微信服务器调用
 * 2. 必须验证签名确保请求来自微信
 * 3. 需要解密回调数据获取支付结果
 * 4. 处理完成后需要返回正确的响应格式给微信
 * 5. 需要处理重复回调（幂等性）
 *
 * 文档：https://pay.weixin.qq.com/wiki/doc/apiv3/wechatpay/wechatpay4_2.shtml
 */
@ApiTags('WxPay')
@Controller('payment/wx-pay')
export class WxPayController {
  private readonly logger = new Logger(WxPayController.name);

  constructor(
    private readonly wxPayService: WxPayService,
    private readonly paymentService: PaymentService,
  ) {
    //
  }

  // 微信支付回调通知
  /**
   * 微信支付回调通知
   *
   * 接收微信支付的回调通知，验证签名并处理支付结果
   *
   * 处理流程：
   * 1. 验证请求头是否完整
   * 2. 验证签名确保请求来自微信
   * 3. 解密回调数据获取支付结果
   * 4. 更新支付记录（PaymentService 会自动发射事件通知订单模块）
   * 5. 返回成功响应给微信
   *
   * 注意事项：
   * - 微信可能会多次发送相同的回调，需要处理幂等性
   * - 签名验证失败应返回 FAIL，微信会重试
   * - 业务处理失败也应返回 FAIL，微信会重试
   * - 返回 SUCCESS 后微信不再重试
   *
   * @param body 微信回调请求体（加密的）
   * @param nonce 随机串（用于签名验证）
   * @param timestamp 时间戳（用于签名验证）
   * @param signature 签名
   * @param serial 证书序列号
   * @returns 微信要求的响应格式
   */
  @Post('notify')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint() // 从 Swagger 中排除，因为这是回调接口
  @ApiOperation({
    summary: '微信支付回调通知',
    description: '接收微信支付的回调通知，验证签名并处理支付结果',
  })
  async notify(
    @Req() req: RawBodyRequest,
    @Body() body: WxPay.WxPayNotifyResponse,
    @WxPayHeaders() headers: WxPayCallbackHeaders,
  ): Promise<WxPay.ToWxPayNotifyResponse | undefined> {
    const requestId = this.generateRequestId();
    const callbackType = '支付';

    return this.handleWxPayCallback(requestId, callbackType, req, body, headers, async () => {
      if (body.event_type !== 'TRANSACTION.SUCCESS') {
        this.logger.error(`[${requestId}] 微信支付失败: ${body.event_type}`);
        return;
      }

      this.logger.log(`[${requestId}] 签名验证通过`);

      // 3. 验证并解密支付结果
      const paymentResult = this.wxPayService.decryptWxPayCallback<WxPay.Notify.TransactionResult>(body.resource);
      const { out_trade_no, transaction_id, trade_state } = paymentResult;
      // 4. 根据支付结果确定状态
      const attach = JSON.parse(paymentResult.attach || '{}') as WxPay.WxPayAttach;
      const isSuccess = trade_state === 'SUCCESS';
      const status = isSuccess ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;

      // 5 更新记录
      if (attach.type === 'deposit') {
        // 5.1 更新押金记录
        this.logger.log(`更新押金记录`);
        this.paymentService.handleDepositCallback(out_trade_no, transaction_id, isSuccess, attach, paymentResult);
      } else if (attach.type === 'order' || attach.type === 'order_installment' || attach.type === 'order_renewal') {
        // 5.2 更新支付记录（包括第一期租金和后续分期账单）
        this.logger.log(`更新支付记录`);
        await this.paymentService.handlePaymentCallback(out_trade_no, transaction_id, isSuccess, paymentResult);
      } else if (attach.type === 'order_overdue_fee') {
        // 5.3 更新超期使用费支付记录
        this.logger.log(`更新超期使用费支付记录`);
        await this.paymentService.handleOverdueFeeCallback(out_trade_no, transaction_id, isSuccess, paymentResult);
      } else {
        throw new BadRequestException(`[${requestId}] 未知的支付类型: ${attach.type as string}`);
      }

      this.logger.log(
        `[${requestId}] 微信支付回调处理成功: outTradeNo=${out_trade_no}, transactionId=${transaction_id}, status=${status}`,
      );
    });
  }

  // 微信退款回调通知
  /**
   * 接收微信退款的回调通知
   * 文档：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_3_11.shtml
   *
   * 处理流程：
   * 1. 验证请求头是否完整
   * 2. 验证签名确保请求来自微信
   * 3. 检查事件类型是否为退款相关事件
   * 4. 解密回调数据获取退款结果
   * 5. 更新退款记录、支付记录和支付账单状态
   * 6. 返回成功响应给微信
   *
   * 注意事项：
   * - 微信可能会多次发送相同的回调，需要处理幂等性
   * - 签名验证失败应返回 FAIL，微信会重试
   * - 业务处理失败也应返回 FAIL，微信会重试
   * - 返回 SUCCESS 后微信不再重试
   */
  @Post('refund-notify')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  @ApiOperation({
    summary: '微信退款回调通知',
    description: '接收微信退款的回调通知，验证签名并处理退款结果',
  })
  async refundNotify(
    @Req() req: RawBodyRequest,
    @Body() body: WxPay.WxPayNotifyResponse,
    @WxPayHeaders() headers: WxPayCallbackHeaders,
  ): Promise<WxPay.ToWxPayNotifyResponse | undefined> {
    const requestId = this.generateRequestId();
    const callbackType = '退款';

    return this.handleWxPayCallback(requestId, callbackType, req, body, headers, async () => {
      // 3-5. 处理退款回调的公共逻辑（检查事件类型、解密、状态映射）
      const refundData = this.processRefundCallback(requestId, body, callbackType);
      if (!refundData) {
        return { code: 'SUCCESS', message: '成功' };
      }

      const { result, refundStatus, logMessage } = refundData;
      const { out_refund_no, refund_id } = result;

      // 6. 处理退款回调（更新退款记录、支付记录和支付账单状态）
      await this.paymentService.handleRefundCallback(out_refund_no, refund_id, refundStatus, result);
      this.logger.log(`[${requestId}] 微信退款回调处理成功: ${logMessage}`);
    });
  }

  // ====================================== 通用方法 ===========================================

  /**
   * 生成请求 ID
   *
   * 用于追踪日志
   */
  private generateRequestId(): string {
    return `WX-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * 处理微信支付回调的通用方法
   *
   * 封装了公共的验证逻辑（请求头验证、签名验证）和错误处理
   *
   * @param requestId 请求 ID，用于日志追踪
   * @param callbackType 回调类型（如 '支付'、'退款'），用于日志
   * @param req 原始请求对象（包含 rawBody）
   * @param body 微信回调请求体
   * @param headers 微信回调请求头
   * @param businessHandler 业务处理函数，在验证通过后执行
   * @returns 微信要求的响应格式
   */
  private async handleWxPayCallback(
    requestId: string,
    callbackType: string,
    req: RawBodyRequest,
    body: WxPay.WxPayNotifyResponse,
    headers: WxPayCallbackHeaders,
    businessHandler: () => Promise<WxPay.ToWxPayNotifyResponse | void | undefined>,
  ): Promise<WxPay.ToWxPayNotifyResponse | undefined> {
    try {
      this.logger.log(`[${requestId}] 收到微信${callbackType}回调通知`);

      // 1. 验证请求头是否完整
      const headerValidation = this.validateCallbackHeaders(requestId, callbackType, headers);
      if (headerValidation) {
        return headerValidation;
      }

      // 2. 验证签名
      const signatureValidation = this.validateCallbackSignature(requestId, callbackType, req, body, headers);
      if (signatureValidation !== null) {
        return signatureValidation;
      }

      // 3. 执行业务处理
      const result = await businessHandler();

      // 如果业务处理返回了响应（如某些情况下直接返回 SUCCESS），则使用该响应
      if (result) {
        return result;
      }

      // 4. 返回成功响应给微信
      return { code: 'SUCCESS', message: '成功' };
    } catch (error: unknown) {
      return this.handleCallbackError(requestId, callbackType, error);
    }
  }

  /**
   * 验证微信回调请求头
   *
   * @param requestId 请求 ID
   * @param callbackType 回调类型
   * @param headers 请求头
   * @returns 如果验证失败返回错误响应，否则返回 null
   */
  private validateCallbackHeaders(
    requestId: string,
    callbackType: string,
    headers: WxPayCallbackHeaders,
  ): WxPay.ToWxPayNotifyResponse | null {
    const { timestamp, nonce, signature, serial } = headers;

    if (!timestamp || !nonce || !signature || !serial) {
      this.logger.error(`[${requestId}] 微信${callbackType}回调缺少必要的请求头`, {
        hasTimestamp: !!timestamp,
        hasNonce: !!nonce,
        hasSignature: !!signature,
        hasSerial: !!serial,
      });
      return { code: 'FAIL', message: '缺少必要的请求头' };
    }

    return null;
  }

  /**
   * 验证微信回调签名
   *
   * @param requestId 请求 ID
   * @param callbackType 回调类型
   * @param req 原始请求对象
   * @param body 请求体
   * @param headers 请求头
   * @returns 如果验证失败返回 undefined（微信会重试），否则返回 null
   */
  private validateCallbackSignature(
    requestId: string,
    callbackType: string,
    req: RawBodyRequest,
    body: WxPay.WxPayNotifyResponse,
    headers: WxPayCallbackHeaders,
  ): WxPay.ToWxPayNotifyResponse | undefined | null {
    const { timestamp, nonce, signature, serial } = headers;

    // 注意：签名验证需要使用原始请求体，而不是解析后的 body
    // 因为 JSON.stringify 可能改变字段顺序
    const rawBody = req.rawBody?.toString() || JSON.stringify(body);

    const isValid = this.wxPayService.verifySign({
      timestamp,
      nonce,
      body: rawBody,
      signature,
      serial,
    });

    if (!isValid) {
      this.logger.error(`[${requestId}] 微信${callbackType}回调签名验证失败`, { serial, timestamp });
      // return { code: 'FAIL', message: '签名验证失败' };
      return undefined; // 返回 undefined，微信会重试
    }

    return null; // 验证通过
  }

  /**
   * 处理回调错误
   *
   * @param requestId 请求 ID
   * @param callbackType 回调类型
   * @param error 错误对象
   * @returns 返回 undefined（微信会重试），不返回敏感错误信息
   */
  private handleCallbackError(
    requestId: string,
    callbackType: string,
    error: unknown,
  ): WxPay.ToWxPayNotifyResponse | undefined {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.logger.error(`[${requestId}] 微信${callbackType}回调处理失败: ${errorMessage}`, errorStack);

    // 返回 undefined，微信会重试
    // 注意：不要返回敏感的错误信息
    return undefined;
  }

  /**
   * 处理微信退款回调的公共逻辑
   *
   * 提取了退款回调中的公共逻辑：
   * 1. 检查事件类型是否为退款相关事件
   * 2. 解密退款结果
   * 3. 映射退款状态
   *
   * @param requestId 请求 ID
   * @param body 微信回调请求体
   * @returns 退款结果和状态，如果事件类型不匹配返回 null
   */
  private processRefundCallback(
    requestId: string,
    body: WxPay.WxPayNotifyResponse,
    callbackType: string,
  ): { result: WxPay.Notify.RefundResult; refundStatus: RefundStatus; logMessage: string } | null {
    // 检查事件类型是否为退款相关事件
    const refundEventTypes = ['REFUND.SUCCESS', 'REFUND.ABNORMAL', 'REFUND.CLOSED'];
    if (!refundEventTypes.includes(body.event_type)) {
      this.logger.warn(`[${requestId}] 非退款事件类型，已忽略: ${body.event_type}`);
      return null;
    }

    this.logger.log(`[${requestId}] 签名验证通过，事件类型: ${body.event_type}`);

    // 验证并解密退款结果
    const result = this.wxPayService.decryptWxPayCallback<WxPay.Notify.RefundResult>(body.resource);
    const { out_refund_no, refund_id, refund_status } = result;

    // 根据退款状态映射到内部状态
    let refundStatus: RefundStatus;
    const logMsg = {
      SUCCESS: '退款成功',
      CLOSED: '退款关闭',
      PROCESSING: '退款处理中',
      ABNORMAL: '退款异常',
    }[refund_status];
    const logMessage = `[${requestId}] 微信 ${callbackType} ${logMsg} 退款单号: ${out_refund_no}, 退款ID: ${refund_id}, 退款状态: ${refund_status}`;

    if (refund_status === 'SUCCESS') {
      refundStatus = RefundStatus.COMPLETED;
      this.logger.log(logMessage);
    } else if (refund_status === 'PROCESSING') {
      refundStatus = RefundStatus.PROCESSING;
      this.logger.log(logMessage);
    } else if (refund_status === 'CLOSED') {
      refundStatus = RefundStatus.CANCELED;
      this.logger.warn(logMessage);
    } else {
      // ABNORMAL 或其他异常状态
      refundStatus = RefundStatus.FAILED;
      this.logger.error(logMessage);
    }

    return {
      result,
      refundStatus,
      logMessage,
    };
  }
}
