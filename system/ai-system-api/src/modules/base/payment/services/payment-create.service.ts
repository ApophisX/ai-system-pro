import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentRecordRepository } from '../repositories';
import { PaymentProvider, PaymentStatus, PaymentType } from '../enums';
import { OutputPayRentalOrderResultDto } from '@/modules/rental-order/dto';
import { RentalOrderEntity } from '@/modules/rental-order/entities';
import { PaymentEntity } from '../entities';
import { plainToInstance } from 'class-transformer';
import { SequenceNumberPrefix, SequenceNumberService, SequenceNumberType } from '@/infrastructure/sequence-number';
import { WxPayService } from './wx-pay.service';
import { UserRepository } from '@/modules/base/user/repositories';
import { ConfigService } from '@nestjs/config';
import { SERVER_CONFIG_KEY, ServerConfig } from '@/config';
import Decimal from 'decimal.js';
import dayjs from 'dayjs';

/**
 * 支付创建服务
 *
 * 提供创建支付记录并调用第三方支付的功能
 */
@Injectable()
export class PaymentCreateService {
  private readonly logger = new Logger(PaymentCreateService.name);
  private readonly wxpayNotifyUrl: string;

  constructor(
    private readonly paymentRecordRepo: PaymentRecordRepository,
    private readonly sequenceNumberService: SequenceNumberService,
    private readonly wxPayService: WxPayService,
    private readonly userRepo: UserRepository,
    private readonly configService: ConfigService,
  ) {
    const serverConfig = this.configService.get<ServerConfig>(SERVER_CONFIG_KEY)!;
    this.wxpayNotifyUrl = `${serverConfig.apiHost}${serverConfig.apiPrefix}/payment/wx-pay/notify`;
  }

  /**
   * 创建租赁订单第一期租金支付记录并调用第三方支付
   *
   * @param userId 用户ID
   * @param order 订单实体
   * @param firstPayment 支付账单实体
   * @param provider 支付提供商
   * @returns 支付结果
   */
  async payFirstRentalOrderPayment(
    userId: string,
    order: RentalOrderEntity,
    firstPayment: PaymentEntity,
    provider: PaymentProvider,
  ): Promise<OutputPayRentalOrderResultDto> {
    const [recordNo, user] = await Promise.all([
      this.sequenceNumberService.generate({
        businessType: SequenceNumberType.PAYMENT_RECORD,
        prefix: SequenceNumberPrefix.PAYMENT_RECORD,
      }),
      this.userRepo.findById(userId),
    ]);

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 计算支付金额（包含逾期费用，减去优惠金额）
    const totalPayableAmount = firstPayment.totalPayableAmount;

    // 创建支付记录
    const record = this.paymentRecordRepo.create({
      userId: userId,
      lessorId: order.lessorId,
      recordNo: recordNo,
      orderId: order.id,
      orderNo: order.orderNo,
      isProductPurchase: order.isProductPurchase,
      paymentId: firstPayment.id,
      paymentNo: firstPayment.paymentNo,
      payment: firstPayment,
      status: PaymentStatus.PENDING,
      amount: totalPayableAmount.toString(),
      expiredAt: dayjs().add(30, 'minute').toDate(),
      paymentType: PaymentType.RENTAL,
      provider: provider,
    });

    // 计算支付金额（用于第三方支付）
    const firstPaymentAmount = new Decimal(totalPayableAmount);

    // 调用微信支付
    if (provider === PaymentProvider.WECHAT) {
      // 保存支付记录
      const newRecord = await this.paymentRecordRepo.save(record);
      // 调用微信支付
      const result = await this.wxPayService.jsApiPay({
        amount: {
          total: firstPaymentAmount.mul(100).toNumber(),
          currency: 'CNY',
        },
        description: `${order.assetSnapshot.name} 租金`,
        out_trade_no: newRecord.recordNo,
        attach: JSON.stringify({
          type: 'order',
        } satisfies WxPay.WxPayAttach),
        payer: {
          openid: user.wechatOpenid!,
        },
        notify_url: this.wxpayNotifyUrl,
      });
      const output = plainToInstance(
        OutputPayRentalOrderResultDto,
        { wxJsapiPay: result },
        { excludeExtraneousValues: true, exposeDefaultValues: true },
      );
      return output;
    }

    // TODO 调用支付宝支付
    if (provider === PaymentProvider.ALIPAY) {
      throw new BadRequestException('支付宝支付待接入');
    }

    throw new BadRequestException('不支持的支付方式');
  }

  /**
   * 创建分期账单支付记录并调用第三方支付
   *
   * @param userId 用户ID
   * @param order 订单实体
   * @param payment 支付账单实体
   * @param provider 支付提供商
   * @returns 支付结果
   */
  async createInstallmentPaymentRecord(
    userId: string,
    order: RentalOrderEntity,
    payment: PaymentEntity,
    provider: PaymentProvider,
  ): Promise<OutputPayRentalOrderResultDto> {
    const [recordNo, user] = await Promise.all([
      this.sequenceNumberService.generate({
        businessType: SequenceNumberType.PAYMENT_RECORD,
        prefix: SequenceNumberPrefix.PAYMENT_RECORD,
      }),
      this.userRepo.findById(userId),
    ]);

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 计算支付金额（包含逾期费用，减去优惠金额）
    const totalPayableAmount = payment.totalPayableAmount;

    const record = this.paymentRecordRepo.create({
      userId: userId,
      recordNo: recordNo,
      orderId: order.id,
      orderNo: order.orderNo,
      paymentId: payment.id,
      paymentNo: payment.paymentNo,
      payment: payment,
      status: PaymentStatus.PENDING,
      amount: totalPayableAmount.toString(),
      expiredAt: dayjs().add(30, 'minute').toDate(),
      paymentType: PaymentType.RENTAL,
      provider: provider,
    });

    if (provider === PaymentProvider.WECHAT) {
      const savedRecord = await this.paymentRecordRepo.save(record);

      // 调用微信支付（使用总应付金额，包含逾期费用，减去优惠金额）
      const result = await this.wxPayService.jsApiPay({
        amount: {
          total: new Decimal(totalPayableAmount).mul(100).toNumber(),
          currency: 'CNY',
        },
        description: `${order.assetSnapshot.name}第${payment.periodIndex}期租金支付`,
        out_trade_no: savedRecord.recordNo,
        attach: JSON.stringify({
          type: 'order_installment',
        } satisfies WxPay.WxPayAttach),
        payer: {
          openid: user.wechatOpenid!,
        },
        notify_url: this.wxpayNotifyUrl,
      });

      this.logger.log(
        `分期账单支付请求已创建: orderNo=${order.orderNo}, paymentNo=${payment.paymentNo}, periodIndex=${payment.periodIndex}, recordNo=${recordNo}`,
      );

      return plainToInstance(
        OutputPayRentalOrderResultDto,
        { wxJsapiPay: result },
        { excludeExtraneousValues: true, exposeDefaultValues: true },
      );
    }

    throw new BadRequestException('不支持的支付方式');
  }

  /**
   * 创建续租支付记录并调用第三方支付
   *
   * @param userId 用户ID
   * @param order 订单实体
   * @param payment 续租支付账单实体
   * @param provider 支付提供商
   * @returns 支付结果
   */
  async createRenewalPaymentRecord(
    userId: string,
    order: RentalOrderEntity,
    payment: PaymentEntity,
    provider: PaymentProvider,
  ): Promise<OutputPayRentalOrderResultDto> {
    const [recordNo, user] = await Promise.all([
      this.sequenceNumberService.generate({
        businessType: SequenceNumberType.PAYMENT_RECORD,
        prefix: SequenceNumberPrefix.PAYMENT_RECORD,
      }),
      this.userRepo.findById(userId),
    ]);

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (!user.wechatOpenid && provider === PaymentProvider.WECHAT) {
      throw new BadRequestException('请先绑定微信');
    }

    const totalPayableAmount = payment.totalPayableAmount;

    const record = this.paymentRecordRepo.create({
      userId,
      recordNo,
      orderId: order.id,
      orderNo: order.orderNo,
      paymentId: payment.id,
      paymentNo: payment.paymentNo,
      payment,
      status: PaymentStatus.PENDING,
      amount: totalPayableAmount.toString(),
      expiredAt: dayjs().add(30, 'minute').toDate(),
      paymentType: PaymentType.RENEWAL,
      provider,
    });

    if (provider === PaymentProvider.WECHAT) {
      const savedRecord = await this.paymentRecordRepo.save(record);

      const result = await this.wxPayService.jsApiPay({
        amount: {
          total: new Decimal(totalPayableAmount).mul(100).toNumber(),
          currency: 'CNY',
        },
        description: `${order.assetSnapshot?.name || '租赁'}续租租金支付`,
        out_trade_no: savedRecord.recordNo,
        attach: JSON.stringify({
          type: 'order_renewal',
        } satisfies WxPay.WxPayAttach),
        payer: {
          openid: user.wechatOpenid!,
        },
        notify_url: this.wxpayNotifyUrl,
      });

      this.logger.log(
        `续租支付请求已创建: orderNo=${order.orderNo}, paymentNo=${payment.paymentNo}, recordNo=${recordNo}`,
      );

      return plainToInstance(
        OutputPayRentalOrderResultDto,
        { wxJsapiPay: result },
        { excludeExtraneousValues: true, exposeDefaultValues: true },
      );
    }

    throw new BadRequestException('不支持的支付方式');
  }

  /**
   * 创建超时使用费支付记录并调用第三方支付
   *
   * 仅适用于：先付后用、非分期订单，且订单处于超时使用状态（overdueStatus=OVERDUE_USE）。
   * overdueStatus=OVERDUE_FEE_PAID 表示已付清，不可再次创建支付
   *
   * @param userId 用户ID
   * @param order 订单实体
   * @param amount 超期费金额（元）
   * @param provider 支付提供商
   * @returns 支付结果
   */
  async createOverdueFeePaymentRecord(
    userId: string,
    order: RentalOrderEntity,
    amount: number,
    provider: PaymentProvider,
  ): Promise<OutputPayRentalOrderResultDto> {
    const [recordNo, user] = await Promise.all([
      this.sequenceNumberService.generate({
        businessType: SequenceNumberType.PAYMENT_RECORD,
        prefix: SequenceNumberPrefix.PAYMENT_RECORD,
      }),
      this.userRepo.findById(userId),
    ]);

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (!user.wechatOpenid && provider === PaymentProvider.WECHAT) {
      throw new BadRequestException('请先绑定微信');
    }

    const record = this.paymentRecordRepo.create({
      recordNo,
      userId,
      lessorId: order.lessorId,
      orderId: order.id,
      orderNo: order.orderNo,
      paymentId: null,
      paymentNo: `OF-${order.orderNo}`,
      status: PaymentStatus.PENDING,
      amount: amount.toString(),
      expiredAt: dayjs().add(30, 'minute').toDate(),
      paymentType: PaymentType.OVERDUE_FEE,
      provider,
    });

    if (provider === PaymentProvider.WECHAT) {
      const savedRecord = await this.paymentRecordRepo.save(record);

      const result = await this.wxPayService.jsApiPay({
        amount: {
          total: new Decimal(amount).mul(100).toNumber(),
          currency: 'CNY',
        },
        description: `租赁订单超时使用费`,
        out_trade_no: savedRecord.recordNo,
        attach: JSON.stringify({
          type: 'order_overdue_fee',
          orderNo: order.orderNo,
        } satisfies WxPay.WxPayAttach),
        payer: {
          openid: user.wechatOpenid!,
        },
        notify_url: this.wxpayNotifyUrl,
      });

      this.logger.log(`超时使用费支付请求已创建: orderNo=${order.orderNo}, recordNo=${recordNo}, amount=${amount}`);

      return plainToInstance(
        OutputPayRentalOrderResultDto,
        { wxJsapiPay: result },
        { excludeExtraneousValues: true, exposeDefaultValues: true },
      );
    }

    if (provider === PaymentProvider.ALIPAY) {
      throw new BadRequestException('支付宝支付待接入');
    }

    throw new BadRequestException('不支持的支付方式');
  }
}
