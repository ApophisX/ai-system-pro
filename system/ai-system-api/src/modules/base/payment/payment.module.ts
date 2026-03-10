import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity, PaymentRecordEntity, RefundRecordEntity, WithdrawalRecordEntity } from './entities';
import { PaymentRepository, PaymentRecordRepository, RefundRecordRepository } from './repositories';
import {
  PaymentService,
  PaymentQueryService,
  PaymentCreateService,
  PaymentRefundService,
  PaymentCallbackService,
  WxPayService,
} from './services';
import { PaymentController, WxPayController } from './controllers';
import { SequenceNumberModule } from '@/infrastructure/sequence-number';
import { UserModule } from '../user/user.module';

/**
 * 支付模块
 *
 * 提供支付、退款、查询等功能
 *
 * 包含控制器：
 * - PaymentController: 通用支付接口（需要认证）
 * - WxPayController: 微信支付回调接口（不需要认证，微信服务器调用）
 *
 * 事件：
 * - payment.completed: 支付完成事件
 * - payment.failed: 支付失败事件
 * - payment.refund.completed: 退款完成事件
 * - payment.refund.failed: 退款失败事件
 */
@Module({
  imports: [
    SequenceNumberModule,
    TypeOrmModule.forFeature([PaymentEntity, PaymentRecordEntity, RefundRecordEntity, WithdrawalRecordEntity]),
    UserModule,
  ],
  controllers: [PaymentController, WxPayController],
  providers: [
    PaymentRepository,
    PaymentRecordRepository,
    RefundRecordRepository,
    PaymentQueryService,
    PaymentCreateService,
    PaymentRefundService,
    PaymentCallbackService,
    PaymentService,
    WxPayService,
  ],
  exports: [
    TypeOrmModule,
    PaymentRepository,
    PaymentRecordRepository,
    RefundRecordRepository,
    PaymentQueryService,
    PaymentCreateService,
    PaymentRefundService,
    PaymentCallbackService,
    PaymentService,
    WxPayService,
  ],
})
export class PaymentModule {}
