import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DataSource, QueryDeepPartialEntity } from 'typeorm';
import { RentalOrderRepository } from '../repositories';
import {
  RentalOrderStatus,
  RentalOrderRefundStatus,
  RentalOrderPayStatus,
  RentalOrderOverdueStatus,
  RentalOrderUsageStatus,
} from '../enums';
import { RentalOrderJobService } from '../jobs/services';
import {
  PaymentEvents,
  PaymentCompletedEvent,
  PaymentFailedEvent,
  RefundCompletedEvent,
  RefundFailedEvent,
  PayOverdueFeeCompletedEvent,
} from '@/modules/base/payment/events';
import { PaymentType } from '@/modules/base/payment/enums';
import { PaymentRepository } from '@/modules/base/payment/repositories';
import { InstallmentStatus, RefundStatus, PaymentStatus } from '@/modules/base/payment/enums';
import { PaymentEntity, PaymentRecordEntity, RefundRecordEntity } from '@/modules/base/payment/entities';
import { RentalOrderEntity } from '../entities';
import { MessageNotificationService } from '@/modules/base/message/services';
import { AssetInventoryService } from '@/modules/asset/services/asset-inventory.service';
import { AssetInventoryRepository } from '@/modules/asset/repositories';
import { RentalOrderConfirmReceiptService } from '../services/rental-order-confirm-receipt.service';
import { RentalOrderRenewService } from '../services/rental-order-renew.service';
import Decimal from 'decimal.js';
import dayjs from 'dayjs';
import { RentalType } from '@/modules/asset/enums';
import { RentalPlanPeriodDaysMap } from '@/modules/asset/constant';
import { FinanceService } from '@/modules/finance/services';

/**
 * 支付事件监听器
 *
 * 监听支付模块发射的事件，更新订单状态
 *
 * 事件驱动架构的优势：
 * 1. 解耦：支付模块不需要知道订单模块的存在
 * 2. 可扩展：可以轻松添加其他监听器（如通知、统计等）
 * 3. 避免循环依赖：订单模块依赖支付模块，但支付模块不依赖订单模块
 *
 * 注意事项：
 * 1. 事件处理应该是幂等的，相同事件多次处理应产生相同结果
 * 2. 事件处理失败不应影响其他监听器
 * 3. 复杂的业务逻辑应该在事务中处理
 */
@Injectable()
export class PaymentEventListener {
  private readonly logger = new Logger(PaymentEventListener.name);

  constructor(
    private readonly orderRepo: RentalOrderRepository,
    private readonly rentalOrderJobService: RentalOrderJobService,
    private readonly paymentRepo: PaymentRepository,
    private readonly dataSource: DataSource,
    private readonly messageNotificationService: MessageNotificationService,
    private readonly assetInventoryService: AssetInventoryService,
    private readonly assetInventoryRepo: AssetInventoryRepository,
    private readonly confirmReceiptService: RentalOrderConfirmReceiptService,
    private readonly renewService: RentalOrderRenewService,
    private readonly financeService: FinanceService,
  ) {
    //
  }

  // 处理支付完成事件
  /**
   * 处理支付完成事件
   *
   * 当支付成功时：
   * 1. 更新订单支付状态为已完成
   * 2. 更新订单状态为已支付
   * 3. 取消支付超时任务
   * 4. TODO: 发送支付成功通知给用户
   * 5. TODO: 发送新订单通知给出租方
   *
   * @param event 支付完成事件
   */
  @OnEvent(PaymentEvents.COMPLETED, { async: true })
  async handlePaymentCompleted(event: PaymentCompletedEvent): Promise<void> {
    this.logger.log(`收到支付完成事件: paymentNo=${event.paymentNo}, orderNo=${event.orderNo}`);

    if (!event.orderNo) {
      this.logger.warn(`支付完成事件没有关联订单ID，跳过处理: orderNo=${event.orderNo}`);
      return;
    }
    if (!event.paymentNo) {
      this.logger.warn(`支付完成事件没有支付单号，跳过处理: paymentNo=${event.paymentNo}`);
      return;
    }

    try {
      // 1. 并行查询支付账单和订单
      const [payments, order] = await Promise.all([
        this.paymentRepo.find({ where: { orderNo: event.orderNo } }),
        this.orderRepo.findByOrderNo(event.orderNo),
      ]);

      // 2. 查找当前支付的账单（使用 paymentNo 匹配）
      const currentPayment = payments.find(p => p.paymentNo === event.paymentNo);
      if (!currentPayment) {
        this.logger.error(`支付账单不存在: paymentNo=${event.paymentNo}, orderNo=${event.orderNo}`);
        return;
      }

      const isFirstPeriod = currentPayment.periodIndex === 1;
      const isRenewalPayment = event.paymentType === PaymentType.RENEWAL;

      // 2.5 续租支付完成：由续租服务处理订单扩展，不执行常规支付逻辑（不触发 WAIT_RETURN）
      if (isRenewalPayment) {
        // 幂等性检查：若订单 endDate 已 >= 本账单 endTime，说明已处理过（含 webhook 重试）
        if (currentPayment.endTime && order.endDate && !dayjs(order.endDate).isBefore(dayjs(currentPayment.endTime))) {
          this.logger.warn(`续租支付完成已处理过，跳过: orderNo=${order.orderNo}, paymentNo=${event.paymentNo}`);
          return;
        }

        // 订单状态校验：仅 RECEIVED + IN_USE 的订单才允许续租扩展
        const renewableUsageStatuses = [RentalOrderUsageStatus.IN_USE, RentalOrderUsageStatus.WAIT_RETURN];
        if (order.status !== RentalOrderStatus.RECEIVED || !renewableUsageStatuses.includes(order.useageStatus)) {
          this.logger.warn(
            `订单状态不允许续租扩展，跳过: orderNo=${order.orderNo}, status=${order.statusLabel}, useageStatus=${order.useageStatusLabel}`,
          );
          return;
        }

        const renewalAmount = Number(currentPayment.rentalAmount) || 0;
        const rentalType = order.rentalPlanJson?.rentalType || RentalType.DAILY;
        const oldEndDate = order.endDate ? dayjs(order.endDate) : dayjs();
        if (!order.endDate) {
          this.logger.warn(`续租订单 endDate 为空，使用当前时间作为 fallback: orderNo=${order.orderNo}`);
        }
        const newEndDate = currentPayment.endTime ? dayjs(currentPayment.endTime) : oldEndDate;
        const periodDays = RentalPlanPeriodDaysMap[rentalType] ?? 1;
        let renewalDuration =
          currentPayment.renewalInfo?.duration ||
          // duration 为空，则根据租赁类型计算续租时长，一般不会出现该错误
          (rentalType === RentalType.HOURLY
            ? newEndDate.diff(oldEndDate, 'hour')
            : Math.round(newEndDate.diff(oldEndDate, 'day') / periodDays) || 1);

        if (renewalDuration <= 0) {
          this.logger.warn(
            `续租时长异常，使用 1 兜底: orderNo=${order.orderNo}, renewalDuration=${renewalDuration}, oldEndDate=${oldEndDate.toISOString()}, newEndDate=${newEndDate.toISOString()}`,
          );
          renewalDuration = 1;
        }

        // 续租支付完成：更新订单状态、逾期任务、发送通知
        await this.renewService.onRenewalPaymentCompleted(
          order.id,
          renewalAmount,
          renewalDuration,
          newEndDate.toDate(),
        );
        const updatedOrder = await this.orderRepo.findByOrderNo(event.orderNo);
        if (updatedOrder) {
          const paymentRecord = await this.dataSource.manager.findOne(PaymentRecordEntity, {
            where: { id: event.paymentRecordId || '' },
            relations: { payment: true },
          });
          if (paymentRecord) {
            await this.messageNotificationService.notifyRenewalPaymentCompleted(updatedOrder, paymentRecord);
          }
        }
        this.logger.log(`续租支付完成已处理: orderNo=${order.orderNo}, paymentNo=${event.paymentNo}`);
        return;
      }

      // 3. 幂等性检查：仅对第一期做「已处理」判断
      // 3.1. 如果是第一期，检查订单是否已经是待收货状态（支付完成），避免重复处理
      if (isFirstPeriod && order.status === RentalOrderStatus.PENDING_RECEIPT) {
        this.logger.warn(`订单已经是待收货状态，跳过处理: orderNo=${order.orderNo}, paymentNo=${event.paymentNo}`);
        return;
      }
      // 注意：后续期数不根据「账单已 PAID」跳过。回调在事务提交后才发事件，监听器首次收到时账单已被置为 PAID，
      // 若此处按 PAID 跳过会导致后续期数从未执行 4.2/4.3，订单 isOverdue 无法更新。4.3 的 isOverdue 更新是幂等的，重复执行无害。

      // 4. 在事务中更新订单状态
      await this.dataSource.transaction(async manager => {
        // 4.1. 首期支付且订单尚未收货（先付后用）：更新为待收货；先用后付首期支付时订单可能已是 RECEIVED+IN_USE，不覆盖
        const isOrderNotYetReceived =
          order.status !== RentalOrderStatus.RECEIVED && order.status !== RentalOrderStatus.COMPLETED;
        if (isFirstPeriod && isOrderNotYetReceived) {
          const updateData: QueryDeepPartialEntity<RentalOrderEntity> = {
            status: RentalOrderStatus.PENDING_RECEIPT,
          };

          // TODO 目前商品购买订单支付完成直接置为已完成，后面可拓展
          if (order.isProductPurchase) {
            updateData.status = RentalOrderStatus.RECEIVED;
            updateData.useageStatus = RentalOrderUsageStatus.RETURNED;
            // 直接入账（商品购买订单支付完成直接入账）
            await this.financeService.confirmFinanceByOrderId(order.id);
          }
          await manager.update(
            RentalOrderEntity,
            { orderNo: event.orderNo },
            {
              ...updateData,
              payStatus: RentalOrderPayStatus.COMPLETED, // 支付成功
              paidAt: event.paidAt,
              isPaidDeliveryFee: order.needDelivery,
              isPaidPlatformFee: Number(order.platformFee) > 0,
            },
          );
        }

        // 4.2. 重新查询最新的支付账单状态（确保获取到 PaymentService 更新后的状态）
        const latestPayments = await manager.find(PaymentEntity, {
          where: { orderNo: event.orderNo || '' },
        });

        // 4.3. 更新订单逾期状态（检查是否有任何账单逾期），并同步 overdueStatus
        const hasOverduePayment = latestPayments.some((p: PaymentEntity) => p.isOverdue);
        const currentOverdueStatus = order.overdueStatus ?? RentalOrderOverdueStatus.NONE;
        const updateOverdueOrder: QueryDeepPartialEntity<RentalOrderEntity> = { isOverdue: hasOverduePayment };
        if (!hasOverduePayment && currentOverdueStatus === RentalOrderOverdueStatus.OVERDUE) {
          // 分期账单已无逾期（用户刚付清），清除逾期状态
          updateOverdueOrder.overdueStatus = RentalOrderOverdueStatus.NONE;
        } else if (
          hasOverduePayment &&
          order.useageStatus === RentalOrderUsageStatus.IN_USE &&
          currentOverdueStatus === RentalOrderOverdueStatus.NONE
        ) {
          // 存在逾期账单且订单使用中，置为逾期（与 rental-overdue.scheduler 一致）
          updateOverdueOrder.overdueStatus = RentalOrderOverdueStatus.OVERDUE;
        }
        if (order.isOverdue !== hasOverduePayment || updateOverdueOrder.overdueStatus !== undefined) {
          await manager.update(RentalOrderEntity, { orderNo: event.orderNo }, updateOverdueOrder);
        }

        // 4.4. 分期/先用后付业务闭环：应付已结清且订单使用中 → 置为待归还（WAIT_RETURN）
        // 场景：分期最后一期付清、或先用后付（含分期）全部付清，承租方应归还资产
        // 排除续租账单：只统计非续租的租金账单是否已付清（续租由 onRenewalPaymentCompleted 单独处理）
        const isRenewalPaymentFn = (p: PaymentEntity) => {
          if (p.paymentType === PaymentType.RENEWAL) return true;
          if (p.paymentType) return false;
          return order.isInstallment ? p.periodIndex > (order.rentalPeriod ?? 1) : p.periodIndex > 1;
        };
        const rentalPayments = latestPayments.filter((p: PaymentEntity) => !isRenewalPaymentFn(p));
        const isInUse = order.useageStatus === RentalOrderUsageStatus.IN_USE;
        const allRentalPaid =
          rentalPayments.length > 0 && rentalPayments.every((p: PaymentEntity) => p.status === InstallmentStatus.PAID);
        if (isInUse && allRentalPaid) {
          await manager.update(
            RentalOrderEntity,
            { orderNo: event.orderNo },
            { useageStatus: RentalOrderUsageStatus.WAIT_RETURN },
          );
        }
      });

      // 5. 如果支付账单是第一期，取消支付超时任务（在事务外执行，避免影响事务）
      if (isFirstPeriod) {
        await this.rentalOrderJobService.cancelPaymentTimeoutJob(order.id);
      }

      // 6. 预绑定自动绑定：首期支付完成且订单有 inventoryCode 时，按实例编号自动绑定资产实例
      let updatedOrder = await this.orderRepo.findByOrderNo(event.orderNo);
      if (isFirstPeriod && updatedOrder?.inventoryCode && !updatedOrder.inventoryId) {
        try {
          const inventory = await this.assetInventoryRepo.findByAssetIdAndInstanceCode(
            updatedOrder.assetId,
            updatedOrder.inventoryCode.trim(),
          );
          if (inventory) {
            const didBind = await this.dataSource.transaction<boolean>(async manager => {
              const orderRepo = manager.getRepository(RentalOrderEntity);

              // 行锁订单，与人工绑定路径一致，防止自动绑定与人工绑定并发产生双 renting 记录
              const lockedOrder = await orderRepo.findOne({
                where: { id: updatedOrder.id },
                lock: { mode: 'pessimistic_write' },
              });
              if (!lockedOrder) return false;
              if (lockedOrder.inventoryId) return false; // 已绑定，跳过（幂等）

              // 锁后状态校验，与人工绑定路径一致，避免异常时序下给不该绑定的订单绑定
              if (!lockedOrder.isPendingReceipt) return false;
              if (!lockedOrder.paidAt) return false;

              await this.assetInventoryService.bindToOrder(lockedOrder, inventory.id, lockedOrder.lessorId, manager);
              await manager.update(
                RentalOrderEntity,
                { id: lockedOrder.id },
                {
                  inventoryId: inventory.id,
                  deliveredAt: new Date(),
                },
              );
              return true;
            });
            if (didBind) {
              updatedOrder = await this.orderRepo.findByOrderNo(event.orderNo);
              if (updatedOrder) {
                await this.messageNotificationService.notifyAssetInventoryBound(updatedOrder, inventory.id);
              }
              this.logger.log(
                `订单 ${event.orderNo} 支付完成后已按 inventoryCode 自动绑定资产实例: inventoryId=${inventory.id}, instanceCode=${updatedOrder?.inventoryCode}`,
              );

              // 自动收货：无需物流时，支付完成+自动绑定后立即确认收货，订单进入使用中（自提/现场使用场景）
              if (updatedOrder && !updatedOrder.needDelivery) {
                try {
                  await this.confirmReceiptService.confirmReceipt(updatedOrder.lesseeId, updatedOrder.id, {
                    confirmedReceipt: true,
                    description: '系统自动确认收货（预选资产实例，无需物流）',
                  });
                  updatedOrder = await this.orderRepo.findByOrderNo(event.orderNo);
                  this.logger.log(
                    `订单 ${event.orderNo} 支付完成后已自动确认收货: needDelivery=false, 订单已进入使用中`,
                  );
                } catch (confirmError) {
                  if (confirmError instanceof ConflictException) {
                    this.logger.warn(`订单 ${event.orderNo} 已确认收货，跳过自动收货（幂等）`);
                  } else {
                    this.logger.warn(
                      `订单 ${event.orderNo} 自动确认收货失败，承租方需手动确认: ${confirmError instanceof Error ? confirmError.message : String(confirmError)}`,
                    );
                  }
                }
              }
            }
          } else {
            this.logger.warn(
              `订单 ${event.orderNo} 支付完成后自动绑定失败: 资产实例不存在 assetId=${updatedOrder?.assetId}, instanceCode=${updatedOrder?.inventoryCode}`,
            );
          }
        } catch (bindError) {
          this.logger.warn(
            `订单 ${event.orderNo} 支付完成后自动绑定资产实例失败，出租方需手动绑定: ${bindError instanceof Error ? bindError.message : String(bindError)}`,
          );
        }
      }

      // 7. 发送支付完成消息通知
      const paymentRecord = await this.dataSource.manager.findOne(PaymentRecordEntity, {
        where: { id: event.paymentRecordId || '' },
        relations: { payment: true },
      });
      if (paymentRecord && updatedOrder) {
        await this.messageNotificationService.notifyPaymentCompleted(updatedOrder, paymentRecord);
      }

      this.logger.log(
        `订单支付状态更新成功: orderNo=${order.orderNo}, paymentNo=${event.paymentNo}, periodIndex=${currentPayment.periodIndex}, status=PENDING_RECEIPT, payStatus=COMPLETED`,
      );
    } catch (error) {
      this.logger.error(
        `处理支付完成事件失败: paymentNo=${event.paymentNo}, orderNo=${event.orderNo}`,
        error instanceof Error ? error.stack : error,
      );
      // 事件处理失败不抛出异常，避免影响其他监听器
      // 可以考虑记录到失败队列，后续补偿处理
    }
  }

  // 处理支付失败事件
  /**
   * 处理支付失败事件
   *
   * 当支付失败时：
   * 1. 确保订单状态允许用户再次发起支付
   *    - 如果是第一期支付失败，订单状态保持 CREATED（待支付）
   *    - 如果是后续期数支付失败，订单状态保持 PAID（已支付），但该期账单状态为 FAILED
   * 2. 取消支付超时任务（如果是第一期）
   * 3. 记录失败原因（已在 PaymentService 中处理）
   * 4. TODO: 发送支付失败通知给用户
   *
   * 注意事项：
   * - 支付失败后，用户应该能够再次发起支付
   * - PaymentService 已经更新了 PaymentRecord 的状态为 FAILED
   * - 需要确保订单状态不会阻止用户重新支付
   * - 幂等性：相同事件多次处理应产生相同结果
   *
   * @param event 支付失败事件
   */
  @OnEvent(PaymentEvents.FAILED, { async: true })
  async handlePaymentFailed(event: PaymentFailedEvent): Promise<void> {
    this.logger.log(`收到支付失败事件: paymentNo=${event.paymentNo}, orderNo=${event.orderNo}`);

    if (!event.orderNo) {
      this.logger.warn(`支付失败事件没有关联订单号，跳过处理: paymentNo=${event.paymentNo}`);
      return;
    }
    if (!event.paymentNo) {
      this.logger.warn(`支付失败事件没有支付单号，跳过处理: orderNo=${event.orderNo}`);
      return;
    }

    try {
      // 1. 并行查询支付账单和订单
      const [payments, order] = await Promise.all([
        this.paymentRepo.find({ where: { orderNo: event.orderNo } }),
        this.orderRepo.findByOrderNo(event.orderNo),
      ]);

      // 2. 查找当前支付的账单（使用 paymentNo 匹配）
      const currentPayment = payments.find(p => p.paymentNo === event.paymentNo);
      if (!currentPayment) {
        this.logger.error(`支付账单不存在: paymentNo=${event.paymentNo}, orderNo=${event.orderNo}`);
        return;
      }

      const isFirstPeriod = currentPayment.periodIndex === 1;

      // 3. 幂等性检查：如果订单状态已经是 CREATED（第一期失败）或 PENDING_RECEIPT（后续期数失败），且支付账单状态是 FAILED，说明已经处理过
      if (
        isFirstPeriod &&
        order.status === RentalOrderStatus.CREATED &&
        order.payStatus === RentalOrderPayStatus.PENDING
      ) {
        // 检查支付账单是否已经是失败状态
        const paymentRecord = await this.dataSource.manager.findOne(PaymentRecordEntity, {
          where: { id: event.paymentRecordId || '' },
        });
        if (paymentRecord?.status === PaymentStatus.FAILED) {
          this.logger.warn(
            `支付失败事件已处理过，跳过: orderNo=${order.orderNo}, paymentNo=${event.paymentNo}, periodIndex=${currentPayment.periodIndex}`,
          );
          return;
        }
      }

      // 4. 在事务中处理支付失败逻辑
      await this.dataSource.transaction(async manager => {
        // 4.1. 如果是第一期支付失败，确保订单状态为 CREATED，支付状态为 PENDING（允许用户再次支付）
        if (isFirstPeriod) {
          // 如果订单状态不是 CREATED 或支付状态不是 PENDING，需要重置（允许用户再次支付）
          if (order.status !== RentalOrderStatus.CREATED || order.payStatus !== RentalOrderPayStatus.PENDING) {
            await manager.update(
              RentalOrderEntity,
              { orderNo: event.orderNo },
              {
                status: RentalOrderStatus.CREATED,
                payStatus: RentalOrderPayStatus.PENDING, // 重置为待支付状态
                // 清除 paidAt，因为支付失败了
                paidAt: undefined,
              },
            );
            this.logger.log(
              `第一期支付失败，订单状态已重置为 CREATED，支付状态为 PENDING，允许用户再次支付: orderNo=${order.orderNo}, paymentNo=${event.paymentNo}`,
            );
          } else {
            this.logger.log(
              `第一期支付失败，订单状态已是 CREATED，支付状态为 PENDING，允许用户再次支付: orderNo=${order.orderNo}, paymentNo=${event.paymentNo}`,
            );
          }
        } else {
          // 4.2. 如果是后续期数支付失败，确保订单状态保持 PENDING_RECEIPT（已支付状态，但该期账单失败）
          // 订单状态应该已经是 PENDING_RECEIPT，支付状态为 COMPLETED，不需要修改
          // 支付账单状态已经在 PaymentService 中更新为 FAILED
          this.logger.log(
            `后续期数支付失败，订单状态保持 PENDING_RECEIPT，允许用户再次支付该期: orderNo=${order.orderNo}, paymentNo=${event.paymentNo}, periodIndex=${currentPayment.periodIndex}`,
          );
        }
      });

      // 5. 注意：支付失败时不应该取消支付超时任务
      // 原因：
      // - 支付失败 ≠ 支付完成，订单仍然处于待支付状态（CREATED）
      // - 如果取消超时任务，订单可能会一直处于 CREATED 状态，没有超时保护
      // - 用户可能不再尝试支付，订单应该超时自动处理
      // - 超时任务应该继续运行，直到支付成功、订单超时或用户手动取消
      // - 只有支付成功时，才需要取消超时任务（在 handlePaymentCompleted 中处理）

      // TODO: 发送支付失败通知给承租方
      // await this.notificationService.sendPaymentFailedNotification(order.lesseeId, order, event.failureReason);

      this.logger.log(
        `支付失败事件处理成功: orderNo=${order.orderNo}, paymentNo=${event.paymentNo}, periodIndex=${currentPayment.periodIndex}, failureReason=${event.failureReason || '未知'}`,
      );
    } catch (error) {
      this.logger.error(
        `处理支付失败事件失败: paymentNo=${event.paymentNo}, orderNo=${event.orderNo}`,
        error instanceof Error ? error.stack : error,
      );
      // 事件处理失败不抛出异常，避免影响其他监听器
      // 可以考虑记录到失败队列，后续补偿处理
    }
  }

  // 处理退款完成事件
  /**
   * 处理退款完成事件
   *
   * 当退款成功时：
   * 1. 查询订单的所有支付账单
   * 2. 计算已退款金额，判断是部分退款还是全额退款
   * 3. 更新订单退款状态
   * 4. TODO: 发送退款成功通知
   *
   * 注意事项：
   * - 需要根据所有支付账单的退款状态来判断订单的退款状态
   * - 支持部分退款场景（多个账单，部分退款成功）
   * - 幂等性：相同事件多次处理应产生相同结果
   *
   * @param event 退款完成事件
   */
  @OnEvent(PaymentEvents.REFUND_COMPLETED, { async: true })
  async handleRefundCompleted(event: RefundCompletedEvent): Promise<void> {
    this.logger.log(`收到退款完成事件: refundNo=${event.refundNo}, orderNo=${event.orderNo}`);

    if (!event.orderNo) {
      this.logger.warn(`退款完成事件没有关联订单ID，跳过处理: refundNo=${event.refundNo}`);
      return;
    }

    try {
      // 1. 查询订单
      const order = await this.orderRepo.findByOrderNo(event.orderNo);

      // 2. 在事务中计算退款状态并更新订单
      await this.dataSource.transaction(async manager => {
        // 2.1 重新查询最新的支付账单状态（确保获取到 PaymentService 更新后的状态）
        const latestPayments = await manager.find(PaymentEntity, {
          where: { orderNo: event.orderNo || '' },
          relations: {
            refundRecords: true,
            paymentRecords: true,
          },
        });

        // 2.2 统计退款结果
        // 查找所有已支付的账单
        const paidPayments = latestPayments.filter(p => p.status === InstallmentStatus.PAID);
        if (paidPayments.length === 0) {
          this.logger.warn(`订单没有已支付的账单，跳过退款状态更新: orderNo=${event.orderNo}`);
          return;
        }

        // 统计退款结果
        const allRefundedCount = paidPayments.filter(p => p.isAllRefunded).length;
        const partialRefundedCount = paidPayments.filter(p => p.refundedAmount > 0 && !p.isAllRefunded).length;
        const processingRefundCount = paidPayments.filter(p => p.refundStatus === RefundStatus.PROCESSING).length;
        const failedRefundCount = paidPayments.filter(p => p.refundStatus === RefundStatus.FAILED).length;

        // 2.3 根据退款结果更新订单退款状态
        let orderRefundStatus: RentalOrderRefundStatus;
        let refundedAt: Date | undefined;

        if (failedRefundCount > 0) {
          // 有退款失败的
          orderRefundStatus = RentalOrderRefundStatus.FAILED;
        } else if (allRefundedCount === paidPayments.length) {
          // 所有账单都已全部退款
          orderRefundStatus = RentalOrderRefundStatus.COMPLETED;
          refundedAt = new Date();
        } else if (partialRefundedCount > 0 || allRefundedCount > 0) {
          // 部分退款或部分账单已全部退款
          orderRefundStatus = RentalOrderRefundStatus.PARTIAL_REFUND;
          refundedAt = new Date();
        } else if (processingRefundCount > 0) {
          // 还有退款在处理中
          orderRefundStatus = RentalOrderRefundStatus.PROCESSING;
        } else {
          // 没有退款记录，保持原状态
          this.logger.warn(
            `订单退款状态异常，保持原状态: orderNo=${event.orderNo}, currentStatus=${order.refundStatus}`,
          );
          return;
        }

        // 2.4 幂等性检查：如果状态相同，跳过更新
        if (order.refundStatus === orderRefundStatus) {
          this.logger.warn(
            `订单退款状态未变化，跳过更新: orderNo=${order.orderNo}, refundNo=${event.refundNo}, status=${orderRefundStatus}`,
          );
          return;
        }

        // 2.5 更新订单退款状态
        await manager.update(
          RentalOrderEntity,
          { orderNo: event.orderNo },
          {
            refundStatus: orderRefundStatus,
            refundedAt: refundedAt,
          },
        );

        this.logger.log(
          `订单退款状态更新成功: orderNo=${order.orderNo}, refundNo=${event.refundNo}, status=${orderRefundStatus}, allRefunded=${allRefundedCount}, partialRefunded=${partialRefundedCount}, processing=${processingRefundCount}, failed=${failedRefundCount}`,
        );
      });

      // 发送退款完成消息通知
      const updatedOrder = await this.orderRepo.findByOrderNo(event.orderNo);
      if (updatedOrder && event.refundNo) {
        // 查询退款记录
        const refundRecord = await this.dataSource.manager.findOne(RefundRecordEntity, {
          where: { refundNo: event.refundNo },
        });
        if (refundRecord) {
          await this.messageNotificationService.notifyRentRefunded(updatedOrder, refundRecord);
        }
      }
    } catch (error) {
      this.logger.error(
        `处理退款完成事件失败: refundNo=${event.refundNo}, orderNo=${event.orderNo}`,
        error instanceof Error ? error.stack : error,
      );
      // 事件处理失败不抛出异常，避免影响其他监听器
    }
  }

  // 处理退款失败事件
  /**
   * 处理退款失败事件
   *
   * 当退款失败时：
   * 1. 查询订单的所有支付账单
   * 2. 检查是否还有其他退款在处理中或已成功
   * 3. 根据退款结果更新订单退款状态
   * 4. TODO: 发送退款失败通知
   *
   * 注意事项：
   * - 不能直接设置为 NONE，因为可能之前有部分退款成功
   * - 需要根据所有支付账单的退款状态来判断订单的退款状态
   * - 如果所有退款都失败，设置为 FAILED
   * - 如果部分退款成功，保持 PARTIAL_REFUND 状态
   *
   * @param event 退款失败事件
   */
  @OnEvent(PaymentEvents.REFUND_FAILED, { async: true })
  async handleRefundFailed(event: RefundFailedEvent): Promise<void> {
    this.logger.log(`收到退款失败事件: refundNo=${event.refundNo}, orderNo=${event.orderNo}`);

    if (!event.orderNo) {
      this.logger.warn(`退款失败事件没有关联订单ID，跳过处理: refundNo=${event.refundNo}`);
      return;
    }

    try {
      // 1. 查询订单
      const order = await this.orderRepo.findByOrderNo(event.orderNo);

      // 2. 在事务中计算退款状态并更新订单
      await this.dataSource.transaction(async manager => {
        // 2.1 重新查询最新的支付账单状态（确保获取到 PaymentService 更新后的状态）
        const latestPayments = await manager.find(PaymentEntity, {
          where: { orderNo: event.orderNo || '' },
          relations: {
            refundRecords: true,
            paymentRecords: true,
          },
        });

        // 2.2 统计退款结果
        // 查找所有已支付的账单
        const paidPayments = latestPayments.filter(p => p.status === InstallmentStatus.PAID);
        if (paidPayments.length === 0) {
          this.logger.warn(`订单没有已支付的账单，跳过退款状态更新: orderNo=${event.orderNo}`);
          return;
        }

        // 统计退款结果
        const allRefundedCount = paidPayments.filter(p => p.isAllRefunded).length;
        const partialRefundedCount = paidPayments.filter(p => p.refundedAmount > 0 && !p.isAllRefunded).length;
        const processingRefundCount = paidPayments.filter(p => p.refundStatus === RefundStatus.PROCESSING).length;
        const failedRefundCount = paidPayments.filter(p => p.refundStatus === RefundStatus.FAILED).length;

        // 2.3 根据退款结果更新订单退款状态
        let orderRefundStatus: RentalOrderRefundStatus;

        if (failedRefundCount === paidPayments.length && allRefundedCount === 0 && partialRefundedCount === 0) {
          // 所有退款都失败，且没有任何成功的退款
          orderRefundStatus = RentalOrderRefundStatus.FAILED;
        } else if (allRefundedCount === paidPayments.length) {
          // 所有账单都已全部退款（不应该出现，因为退款失败了）
          orderRefundStatus = RentalOrderRefundStatus.COMPLETED;
        } else if (partialRefundedCount > 0 || allRefundedCount > 0) {
          // 部分退款或部分账单已全部退款（保持部分退款状态）
          orderRefundStatus = RentalOrderRefundStatus.PARTIAL_REFUND;
        } else if (processingRefundCount > 0) {
          // 还有退款在处理中
          orderRefundStatus = RentalOrderRefundStatus.PROCESSING;
        } else {
          // 没有退款记录或状态异常，设置为失败
          orderRefundStatus = RentalOrderRefundStatus.FAILED;
        }

        // 2.4 幂等性检查：如果状态相同，跳过更新
        if (order.refundStatus === orderRefundStatus) {
          this.logger.warn(
            `订单退款状态未变化，跳过更新: orderNo=${order.orderNo}, refundNo=${event.refundNo}, status=${orderRefundStatus}`,
          );
          return;
        }

        // 2.5 更新订单退款状态
        await manager.update(
          RentalOrderEntity,
          { orderNo: event.orderNo },
          {
            refundStatus: orderRefundStatus,
          },
        );

        this.logger.log(
          `订单退款失败状态更新成功: orderNo=${order.orderNo}, refundNo=${event.refundNo}, status=${orderRefundStatus}, reason=${event.failureReason}, allRefunded=${allRefundedCount}, partialRefunded=${partialRefundedCount}, processing=${processingRefundCount}, failed=${failedRefundCount}`,
        );
      });

      // TODO: 发送退款失败通知
    } catch (error) {
      this.logger.error(
        `处理退款失败事件失败: refundNo=${event.refundNo}, orderNo=${event.orderNo}`,
        error instanceof Error ? error.stack : error,
      );
      // 事件处理失败不抛出异常，避免影响其他监听器
    }
  }

  /**
   * 处理超时使用费支付完成事件
   *
   * 1. 累加订单的已支付超时使用费金额（overdueFeePaidAmount）
   * 2. 若已付清全部应付超时使用费（overdueFeePaidAmount >= payableOverdueUseAmount），
   *    将 overdueStatus 置为 OVERDUE_FEE_PAID、isOverdue 置为 false
   *    （OVERDUE_FEE_PAID 表示超时使用费已支付，待订单归还确认/完成后会清零为 NONE）
   */
  @OnEvent(PaymentEvents.PAY_OVERDUE_FEE_COMPLETED, { async: true })
  async handlePayOverdueFeeCompleted(event: PayOverdueFeeCompletedEvent): Promise<void> {
    this.logger.log(
      `收到超时使用费支付完成事件: recordNo=${event.recordNo}, orderId=${event.orderId}, amount=${event.amount}`,
    );

    try {
      await this.dataSource.transaction(async manager => {
        const order = await manager.findOne(RentalOrderEntity, {
          where: { id: event.orderId },
          relations: { rentalPlanSnapshot: true },
        });
        if (!order) {
          this.logger.warn(`订单不存在: orderId=${event.orderId}`);
          return;
        }

        const currentPaid = new Decimal(order.overdueFeePaidAmount ?? 0);
        const newPaid = currentPaid.plus(event.amount);
        const newPaidStr = newPaid.toString();

        const amountToPay = new Decimal(order.payableOverdueUseAmount);
        const isFullyPaid = newPaid.gte(amountToPay);

        const updateData: QueryDeepPartialEntity<RentalOrderEntity> = {
          overdueFeePaidAmount: newPaidStr,
        };

        if (
          isFullyPaid &&
          [RentalOrderOverdueStatus.OVERDUE_USE, RentalOrderOverdueStatus.OVERDUE].includes(
            order.overdueStatus ?? RentalOrderOverdueStatus.NONE,
          )
        ) {
          updateData.overdueStatus = RentalOrderOverdueStatus.OVERDUE_FEE_PAID;
          updateData.isOverdue = false;
        }

        await manager.update(RentalOrderEntity, { id: event.orderId }, updateData);

        this.logger.log(
          `订单超时使用费已累加: orderNo=${order.orderNo}, orderId=${event.orderId}, amount=${event.amount}, newOverdueFeePaidAmount=${newPaidStr}${isFullyPaid ? ', 已付清，逾期状态 → overdue_fee_paid' : ''}`,
        );
      });
    } catch (error) {
      this.logger.error(
        `处理超时使用费支付完成事件失败: recordNo=${event.recordNo}, orderId=${event.orderId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
