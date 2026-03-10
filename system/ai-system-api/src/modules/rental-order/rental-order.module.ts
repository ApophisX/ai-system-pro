import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  RentalOrderEntity,
  RentalOrderAssetSnapshotEntity,
  RentalOrderAssetRentalPlanSnapshotEntity,
  DepositEntity,
  DepositDeductionEntity,
} from './entities';
import {
  RentalOrderRepository,
  RentalOrderAssetSnapshotRepository,
  RentalOrderAssetRentalPlanSnapshotRepository,
  DepositRepository,
  DepositDeductionRepository,
} from './repositories';
import {
  RentalOrderService,
  DepositService,
  RentalOrderSupportService,
  RentalOrderCreateService,
  RentalOrderCancelService,
  RentalOrderEndService,
  RentalOrderRefundService,
  RentalOrderQueryService,
  RentalOrderPaymentService,
  RentalOrderDeductDepositService,
  RentalOrderDepositRefundService,
  RentalOrderBindInventoryService,
  RentalOrderConfirmReceiptService,
  RentalOrderReturnAssetService,
  RentalOrderConfirmReturnService,
  RentalOrderRenewService,
  RentalOrderDiscountService,
  RentalOrderForceCloseService,
} from './services';
import {
  AppRentalOrderLesseeController,
  AppRentalOrderLessorController,
  AppLessorDepositController,
  AppLesseeDepositController,
  AdminDepositDeductionController,
} from './controllers';
import { RentalOrderRenewController } from './controllers/rental-order-renew.controller';
import { PaymentEventListener } from './listeners';
import { PaymentModule } from '@/modules/base/payment/payment.module';
import { AssetModule } from '@/modules/asset/asset.module';
import { SequenceNumberModule } from '@/infrastructure/sequence-number';
import { FinanceModule } from '@/modules/finance/finance.module';
import { OssModule } from '../base/aliyun-oss/oss.module';
import { UserModule } from '../base/user/user.module';
import { MessageModule } from '../base/message/message.module';
import { CreditModule } from '../credit/credit.module';
import {
  PaymentTimeoutProcessor,
  InstallmentOverdueProcessor,
  DepositDeductionTimeoutProcessor,
  CancelConfirmTimeoutProcessor,
  ReturnConfirmTimeoutProcessor,
} from './jobs/processors';
import { RentalOrderJobService } from './jobs/services';
import {
  RENTAL_ORDER_PAYMENT_TIMEOUT_QUEUE,
  RENTAL_ORDER_INSTALLMENT_OVERDUE_QUEUE,
  RENTAL_ORDER_RENTAL_OVERDUE_QUEUE,
  RENTAL_ORDER_DEPOSIT_DEDUCTION_TIMEOUT_QUEUE,
  RENTAL_ORDER_CANCEL_CONFIRM_TIMEOUT_QUEUE,
  RENTAL_ORDER_RETURN_CONFIRM_TIMEOUT_QUEUE,
} from './jobs/constants';
import { REDIS_CONFIG_KEY, RedisConfig } from '@/config';
import { DepositEventListener } from './listeners/deposit-event.listener';
import { RentalOverdueScheduler } from './schedulers/rental-overdue.scheduler';
import { RentalNotificationScheduler } from './schedulers/rental-notifycation.scheduler';
import { InstallmentBillPendingScheduler } from './schedulers/installment-bill-pending.scheduler';
import { RentalReviewByOrderReader } from './services/rental-review-by-order.reader';

/**
 * 租赁订单模块
 *
 * 提供订单创建、支付、取消、退款等功能
 *
 * 事件监听：
 * - PaymentEventListener: 监听支付事件，更新订单状态
 *   - payment.completed: 支付完成 → 更新订单为已支付
 *   - payment.failed: 支付失败 → 更新订单支付状态为失败
 *   - payment.refund.completed: 退款完成 → 更新订单退款状态
 *   - payment.refund.failed: 退款失败 → 记录失败原因
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      RentalOrderEntity,
      RentalOrderAssetSnapshotEntity,
      RentalOrderAssetRentalPlanSnapshotEntity,
      DepositEntity,
      DepositDeductionEntity,
    ]),
    // BullMQ 队列配置
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.get<RedisConfig>(REDIS_CONFIG_KEY);
        if (!redisConfig) {
          throw new Error('Redis config not found');
        }
        return {
          connection: {
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
            db: redisConfig.database,
            // maxRetriesPerRequest: redisConfig.maxRetries,
            // BullMQ 要求必须为 null，否则会覆盖并告警；BullMQ 使用阻塞命令，自行处理重连
            maxRetriesPerRequest: null,
            retryStrategy: (times: number) => {
              return Math.min(times * redisConfig.retryDelay, 2000);
            },
          },
        };
      },
    }),
    // 注册订单相关队列
    BullModule.registerQueue(
      { name: RENTAL_ORDER_PAYMENT_TIMEOUT_QUEUE },
      { name: RENTAL_ORDER_INSTALLMENT_OVERDUE_QUEUE },
      { name: RENTAL_ORDER_RENTAL_OVERDUE_QUEUE },
      { name: RENTAL_ORDER_DEPOSIT_DEDUCTION_TIMEOUT_QUEUE },
      { name: RENTAL_ORDER_CANCEL_CONFIRM_TIMEOUT_QUEUE },
      { name: RENTAL_ORDER_RETURN_CONFIRM_TIMEOUT_QUEUE },
    ),
    OssModule,
    PaymentModule,
    AssetModule,
    SequenceNumberModule,
    FinanceModule,
    UserModule,
    MessageModule,
    CreditModule,
  ],
  controllers: [
    AppRentalOrderLesseeController,
    AppRentalOrderLessorController,
    AppLessorDepositController,
    AppLesseeDepositController,
    RentalOrderRenewController,
    AdminDepositDeductionController,
  ],
  providers: [
    // 仓储
    RentalOrderRepository,
    RentalOrderAssetSnapshotRepository,
    RentalOrderAssetRentalPlanSnapshotRepository,
    DepositRepository,
    DepositDeductionRepository,
    RentalReviewByOrderReader,
    // 支撑与 feature 服务
    RentalOrderSupportService,
    RentalOrderCreateService,
    RentalOrderCancelService,
    RentalOrderEndService,
    RentalOrderRefundService,
    RentalOrderQueryService,
    RentalOrderPaymentService,
    RentalOrderDeductDepositService,
    RentalOrderDepositRefundService,
    RentalOrderBindInventoryService,
    RentalOrderConfirmReceiptService,
    RentalOrderReturnAssetService,
    RentalOrderConfirmReturnService,
    RentalOrderRenewService,
    RentalOrderDiscountService,
    RentalOrderForceCloseService,
    // 门面（对外统一 API）
    RentalOrderService,
    DepositService,
    // 任务服务（job service）
    RentalOrderJobService,
    // 事件监听器（listener）
    PaymentEventListener,
    DepositEventListener,
    // 任务处理器（worker，单独部署）
    PaymentTimeoutProcessor,
    InstallmentOverdueProcessor,
    DepositDeductionTimeoutProcessor,
    CancelConfirmTimeoutProcessor,
    ReturnConfirmTimeoutProcessor,
    // 定时调度器（scheduler，单独部署）
    RentalOverdueScheduler,
    RentalNotificationScheduler,
    InstallmentBillPendingScheduler,
  ],
  exports: [
    TypeOrmModule,
    RentalOrderRepository,
    RentalOrderAssetSnapshotRepository,
    RentalOrderAssetRentalPlanSnapshotRepository,
    DepositRepository,
    DepositDeductionRepository,
    RentalOrderService,
    DepositService,
    RentalOrderJobService,
  ],
})
export class RentalOrderModule {
  //
}
