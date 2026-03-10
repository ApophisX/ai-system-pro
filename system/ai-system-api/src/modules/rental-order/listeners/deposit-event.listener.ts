import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { DepositRepository, RentalOrderRepository } from '../repositories';
import { DepositStatus, RentalOrderStatus } from '../enums';
import { RentalOrderJobService } from '../jobs/services';
import {
  PaymentEvents,
  PayDepositCompletedEvent,
  PayDepositFailedEvent,
  DepositRefundCompletedEvent,
  DepositRefundFailedEvent,
} from '@/modules/base/payment/events';
import { RentalOrderEntity } from '../entities/rental-order.entity';
import { DepositEntity } from '../entities/deposit.entity';
import { MessageNotificationService } from '@/modules/base/message/services';

/**
 * 押金支付事件监听器
 *
 * 监听押金支付模块发射的事件，更新订单状态
 *
 * 事件驱动架构的优势：
 * 1. 解耦：押金支付模块不需要知道订单模块的存在
 * 2. 可扩展：可以轻松添加其他监听器（如通知、统计等）
 * 3. 避免循环依赖：订单模块依赖押金支付模块，但押金支付模块不依赖订单模块
 *
 * 注意事项：
 * 1. 事件处理应该是幂等的，相同事件多次处理应产生相同结果
 * 2. 事件处理失败不应影响其他监听器
 * 3. 复杂的业务逻辑应该在事务中处理
 */
@Injectable()
export class DepositEventListener {
  private readonly logger = new Logger(DepositEventListener.name);

  constructor(
    private readonly orderRepo: RentalOrderRepository,
    private readonly depositRepo: DepositRepository,
    private readonly rentalOrderJobService: RentalOrderJobService,
    private readonly dataSource: DataSource,
    private readonly messageNotificationService: MessageNotificationService,
  ) {
    //
  }

  // 处理押金支付完成事件
  /**
   * 处理押金支付完成事件
   *
   * 当支付成功时：
   * 1. 更新订单支付状态为已完成
   * 2. 更新订单状态为已支付
   * 3. 取消支付超时任务
   * 4. TODO: 发送支付成功通知给用户
   * 5. TODO: 发送新订单通知给出租方
   *
   * @param event 押金支付完成事件
   */
  @OnEvent(PaymentEvents.PAY_DEPOSIT_COMPLETED, { async: true })
  async handleDepositCompleted(event: PayDepositCompletedEvent): Promise<void> {
    this.logger.log(`收到押金支付完成事件: depositNo=${event.depositNo}`);
    // 1. 查询押金（在事务内查询，确保数据一致性）
    const deposit = await this.depositRepo.findOne({ where: { depositNo: event.depositNo } });
    if (!deposit) {
      this.logger.warn(`押金不存在: depositNo=${event.depositNo}`);
      return;
    }
    const { orderId, orderNo } = deposit;

    try {
      // 在事务中处理，保证数据一致性
      await this.dataSource.transaction(async manager => {
        // 2. 查询订单（在事务内查询，确保数据一致性）
        // 需要加载 assetSnapshot 关系以判断支付模式
        const order = await manager.findOne(RentalOrderEntity, {
          where: { id: orderId },
          relations: { assetSnapshot: true },
        });

        if (!order) {
          this.logger.warn(`订单不存在: orderNo=${orderNo}`);
          return;
        }

        // 3. 幂等性检查：同时检查订单和押金的状态，确保一致性
        const needUpdateOrder = order.depositStatus !== DepositStatus.PAID;
        const needUpdateDeposit = deposit.status !== DepositStatus.PAID;

        if (needUpdateOrder || needUpdateDeposit) {
          // 4. 如果是先用后付（isPostPayment），押金支付完成后订单状态变为PAID（待收货）
          // 先用后付（isPostPayment）需要等待租金支付完成后才会变为PAID状态
          const isPostPayment = order.assetSnapshot?.isPostPayment ?? false;
          if (needUpdateOrder) {
            if (order.status === RentalOrderStatus.CREATED) {
              // 先用后付：押金支付完成后，订单状态变为PENDING_RECEIPT（待收货）
              // 注意：不设置 paidAt，因为租金还未支付，paidAt 应该在租金支付完成时设置
              // 先用后付模式下，押金支付完成后订单状态变为待收货，但支付状态仍为 PENDING（因为租金未支付）
              await manager.update(
                RentalOrderEntity,
                { id: order.id },
                {
                  status: isPostPayment ? RentalOrderStatus.PENDING_RECEIPT : RentalOrderStatus.CREATED,
                  depositStatus: DepositStatus.PAID,
                },
              );
              // TODO 先用后付：押金支付完成，订单有 inventoryCode 时，按实例编号自动绑定资产实例
              this.logger.log(
                `先用后付：押金支付完成，订单状态更新为待收货: orderId=${order.id}, orderNo=${order.orderNo}`,
              );
            }
            this.logger.log(`更新订单押金状态为已支付: orderId=${order.id}`);
          }

          // 5. 幂等性检查并更新押金状态
          if (needUpdateDeposit) {
            await manager.update(
              DepositEntity,
              { id: deposit.id },
              {
                status: DepositStatus.PAID,
                frozenAt: event.paidAt,
                paymentCallbackData: event.callbackData,
                thirdPartyPaymentNo: event.thirdPartyPaymentNo,
              },
            );
            this.logger.log(`更新押金状态为已支付: depositId=${deposit.id}, depositNo=${deposit.depositNo}`);
          }
        } else {
          this.logger.log(`押金支付已完成，跳过更新（幂等性检查）: orderId=${order.id}, depositId=${deposit.id}`);
        }
      });

      this.logger.log(`处理押金支付完成事件成功: depositNo=${deposit.depositNo}, orderNo=${orderNo}`);

      // 发送押金支付完成消息通知
      const order = await this.orderRepo.findById(orderId);
      if (order) {
        await this.messageNotificationService.notifyDepositPaid(order, deposit);
      }
    } catch (error) {
      this.logger.error(
        `处理押金支付完成事件失败: depositNo=${deposit.depositNo}, orderNo=${deposit.orderNo}`,
        error instanceof Error ? error.stack : error,
      );
      // 事件处理失败不抛出异常，避免影响其他监听器
      // 可以考虑记录到失败队列，后续补偿处理
    }
  }

  // 处理押金支付失败事件
  /**
   * 处理押金支付失败事件
   *
   * 当支付失败时：
   * 1. 更新订单支付状态为失败
   * 2. TODO: 发送支付失败通知给用户
   *
   * @param event 押金支付失败事件
   */
  @OnEvent(PaymentEvents.PAY_DEPOSIT_FAILED, { async: true })
  async handleDepositFailed(event: PayDepositFailedEvent): Promise<void> {
    this.logger.log(`收到押金支付失败事件: depositNo=${event.depositNo}`);

    const checkDeposit = await this.depositRepo.findOne({
      where: { depositNo: event.depositNo },
    });
    if (!checkDeposit) {
      this.logger.warn(`押金不存在: depositNo=${event.depositNo}`);
      return;
    }
    const { orderId, orderNo } = checkDeposit;
    // 保存 orderId，确保类型安全

    try {
      // 在事务中处理，保证数据一致性
      await this.dataSource.transaction(async manager => {
        // 1. 查询订单（在事务内查询，确保数据一致性）
        // 需要加载 assetSnapshot 关系以判断支付模式
        const order = await manager.findOne(RentalOrderEntity, {
          where: { id: orderId },
          relations: ['assetSnapshot'],
        });

        if (!order) {
          this.logger.warn(`订单不存在: orderNo=${orderNo}`);
          return;
        }

        // 2. 查询押金（在事务内查询，确保数据一致性）
        const deposit = await manager.findOne(DepositEntity, {
          where: { depositNo: event.depositNo, orderNo },
        });

        if (!deposit) {
          this.logger.warn(`押金不存在: depositNo=${event.depositNo}, orderNo=${orderNo}`);
          return;
        }

        // 3. 更新押金状态为失败
        await manager.update(
          DepositEntity,
          { id: deposit.id },
          {
            status: DepositStatus.FAILED,
            paymentFailureReason: event.failureReason,
            paymentCallbackData: event.callbackData,
          },
        );

        // 4. 更新订单押金状态为失败
        await manager.update(RentalOrderEntity, { id: order.id }, { depositStatus: DepositStatus.FAILED });

        // 5. 更新订单支付状态为失败
        // await manager.update(RentalOrderEntity, { id: order.id }, { paymentStatus: RentalOrderPayStatus.FAILED });

        this.logger.log(
          `订单押金支付状态更新为失败: orderNo=${order.orderNo}, depositNo=${event.depositNo}, reason=${event.failureReason}`,
        );
      });

      // TODO: 发送支付失败通知给用户
      // await this.notificationService.sendPaymentFailedNotification(order.lesseeId, order, event.failureReason);
    } catch (error) {
      this.logger.error(
        `处理押金支付失败事件失败: depositNo=${event.depositNo}, orderNo=${orderNo}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  // 处理押金退款完成事件
  /**
   * 处理押金退款完成事件
   *
   * 当押金退款成功时：
   * 1. 更新订单押金状态为已退还
   * 2. TODO: 发送退款成功通知给用户
   *
   * @param event 押金退款完成事件
   */
  @OnEvent(PaymentEvents.DEPOSIT_REFUND_COMPLETED, { async: true })
  async handleDepositRefundCompleted(event: DepositRefundCompletedEvent): Promise<void> {
    this.logger.log(
      `收到押金退款完成事件: depositNo=${event.depositNo}, refundNo=${event.refundNo}, orderNo=${event.orderNo}`,
    );

    if (!event.orderNo) {
      this.logger.warn(
        `押金退款完成事件没有关联订单号，跳过处理: depositNo=${event.depositNo}, refundNo=${event.refundNo}`,
      );
      return;
    }

    const orderNo = event.orderNo;

    try {
      // 在事务中处理，保证数据一致性
      await this.dataSource.transaction(async manager => {
        // 1. 查询订单（在事务内查询，确保数据一致性）
        const order = await manager.findOne(RentalOrderEntity, {
          where: { orderNo },
          relations: { deposits: true },
        });

        if (!order) {
          this.logger.warn(`订单不存在: orderNo=${orderNo}`);
          return;
        }

        // 2. 查询押金（在事务内查询，确保数据一致性）
        const deposit = await manager.findOne(DepositEntity, {
          where: { depositNo: event.depositNo, orderNo },
        });

        if (!deposit) {
          this.logger.warn(`押金不存在: depositNo=${event.depositNo}, orderNo=${event.orderNo}`);
          return;
        }

        // 3. 幂等性检查：如果订单押金状态已经是已退还，跳过更新
        if (order.depositStatus === DepositStatus.RETURNED || order.depositStatus === DepositStatus.UNFROZEN) {
          this.logger.log(
            `订单押金状态已经是已退还，跳过更新（幂等性检查）: orderId=${order.id}, depositId=${deposit.id}`,
          );
          return;
        }

        let depositStatus: DepositStatus;
        const isNeedUpdateDepositStatus = [
          DepositStatus.REFUNDING,
          DepositStatus.FROZEN,
          DepositStatus.PAID,
          DepositStatus.PARTIAL_DEDUCTED,
        ].includes(order.depositStatus);
        if (isNeedUpdateDepositStatus && order.depositList.length > 0) {
          depositStatus = order.depositList.some(d => [DepositStatus.RETURNED, DepositStatus.PAID].includes(d.status))
            ? DepositStatus.RETURNED
            : DepositStatus.UNFROZEN;
        } else {
          depositStatus = order.depositStatus;
        }

        // 4. 更新订单押金状态为已退还
        await manager.update(RentalOrderEntity, { id: order.id }, { depositStatus });

        this.logger.log(
          `订单押金状态更新为已退还: orderId=${order.id}, orderNo=${order.orderNo}, depositNo=${event.depositNo}, refundNo=${event.refundNo}`,
        );
      });

      // 发送押金退款完成消息通知
      const order = await this.orderRepo.findByOrderNo(orderNo);
      const deposit = await this.depositRepo.findOne({ where: { depositNo: event.depositNo } });
      if (order && deposit) {
        await this.messageNotificationService.notifyDepositRefunded(order, deposit);
      }

      this.logger.log(
        `处理押金退款完成事件成功: depositNo=${event.depositNo}, refundNo=${event.refundNo}, orderNo=${event.orderNo}`,
      );
    } catch (error) {
      this.logger.error(
        `处理押金退款完成事件失败: depositNo=${event.depositNo}, refundNo=${event.refundNo}, orderNo=${event.orderNo}`,
        error instanceof Error ? error.stack : error,
      );
      // 事件处理失败不抛出异常，避免影响其他监听器
    }
  }

  // 处理押金退款失败事件
  /**
   * 处理押金退款失败事件
   *
   * 当押金退款失败时：
   * 1. 更新订单押金状态为失败
   * 2. TODO: 发送退款失败通知给用户
   *
   * @param event 押金退款失败事件
   */
  @OnEvent(PaymentEvents.DEPOSIT_REFUND_FAILED, { async: true })
  async handleDepositRefundFailed(event: DepositRefundFailedEvent): Promise<void> {
    this.logger.log(
      `收到押金退款失败事件: depositNo=${event.depositNo}, refundNo=${event.refundNo}, orderNo=${event.orderNo}`,
    );

    if (!event.orderNo) {
      this.logger.warn(
        `押金退款失败事件没有关联订单号，跳过处理: depositNo=${event.depositNo}, refundNo=${event.refundNo}`,
      );
      return;
    }

    const orderNo = event.orderNo;

    try {
      // 在事务中处理，保证数据一致性
      await this.dataSource.transaction(async manager => {
        // 1. 查询订单（在事务内查询，确保数据一致性）
        const order = await manager.findOne(RentalOrderEntity, {
          where: { orderNo },
        });

        if (!order) {
          this.logger.warn(`订单不存在: orderNo=${orderNo}`);
          return;
        }

        // 2. 查询押金（在事务内查询，确保数据一致性）
        const deposit = await manager.findOne(DepositEntity, {
          where: { depositNo: event.depositNo, orderNo },
        });

        if (!deposit) {
          this.logger.warn(`押金不存在: depositNo=${event.depositNo}, orderNo=${event.orderNo}`);
          return;
        }

        // 3. 更新订单押金状态为失败
        await manager.update(RentalOrderEntity, { id: order.id }, { depositStatus: DepositStatus.FAILED });

        this.logger.log(
          `订单押金状态更新为失败: orderId=${order.id}, orderNo=${order.orderNo}, depositNo=${event.depositNo}, refundNo=${event.refundNo}, reason=${event.failureReason}`,
        );
      });

      // TODO: 发送押金退款失败通知给承租方
      // await this.notificationService.sendDepositRefundFailedNotification(order.lesseeId, order, event.failureReason);
    } catch (error) {
      this.logger.error(
        `处理押金退款失败事件失败: depositNo=${event.depositNo}, refundNo=${event.refundNo}, orderNo=${event.orderNo}`,
        error instanceof Error ? error.stack : error,
      );
      // 事件处理失败不抛出异常，避免影响其他监听器
    }
  }
}
