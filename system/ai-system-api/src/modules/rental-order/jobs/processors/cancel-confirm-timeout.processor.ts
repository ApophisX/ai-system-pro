/**
 * 取消确认超时处理器
 *
 * 处理承租方申请取消订单后，出租方24小时未操作的情况，自动发起退款退押金
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { RentalOrderRepository } from '../../repositories';
import { RentalOrderEntity } from '../../entities';
import { RentalOrderStatus } from '../../enums';
import { RENTAL_ORDER_CANCEL_CONFIRM_TIMEOUT_QUEUE } from '../constants/rental-order-queue.constant';
import dayjs from 'dayjs';
import { CancelConfirmTimeoutJobData } from '../type';
import { RentalOrderSupportService } from '../../services';
import { AssetInventoryService } from '@/modules/asset/services/asset-inventory.service';
import { MessageNotificationService } from '@/modules/base/message/services';

@Processor(RENTAL_ORDER_CANCEL_CONFIRM_TIMEOUT_QUEUE)
export class CancelConfirmTimeoutProcessor extends WorkerHost {
  private readonly logger = new Logger(CancelConfirmTimeoutProcessor.name);

  constructor(
    private readonly orderRepo: RentalOrderRepository,
    private readonly dataSource: DataSource,
    private readonly support: RentalOrderSupportService,
    private readonly assetInventoryService: AssetInventoryService,
    private readonly messageNotificationService: MessageNotificationService,
  ) {
    super();
  }

  async process(job: Job<CancelConfirmTimeoutJobData>): Promise<void> {
    const { orderId, orderNo, timeoutAt } = job.data;

    this.logger.log(`处理出租方24小时未操作，系统自动同意取消并退款任务: orderNo=${orderNo}, orderId=${orderId}`);

    try {
      // 查询订单当前状态（包含支付记录和押金记录）
      const order = await this.orderRepo.findById(orderId, {
        relations: { payments: { paymentRecords: true }, deposits: true },
      });

      if (!order) {
        this.logger.warn(`订单不存在: orderNo=${orderNo}, orderId=${orderId}`);
        return;
      }

      // 检查订单状态是否为等待取消确认
      if (order.status !== RentalOrderStatus.CANCEL_PENDING) {
        this.logger.log(`订单状态不是等待取消确认，跳过处理: orderNo=${orderNo}, status=${order.status}`);
        return;
      }

      // 检查超时时间是否已过
      const now = dayjs();
      const expiredAt = dayjs(timeoutAt);

      if (now.isBefore(expiredAt)) {
        this.logger.log(`超时时间未到: orderNo=${orderNo}, timeoutAt=${expiredAt.format('YYYY-MM-DD HH:mm:ss')}`);
        return;
      }
      // 自动发起退款退押金
      const cancelReason = '出租方24小时未操作，系统自动同意取消并退款';

      // 在事务中处理自动退款
      await this.dataSource.transaction(async manager => {
        // 重新查询订单，确保获取最新状态（使用悲观锁防止并发）
        const currentOrder = await manager.findOne(RentalOrderEntity, {
          where: { id: orderId },
          relations: { payments: { paymentRecords: true }, deposits: true },
          lock: { mode: 'pessimistic_write' },
        });

        if (!currentOrder) {
          this.logger.warn(`订单不存在（事务内）: orderNo=${orderNo}, orderId=${orderId}`);
          return;
        }

        // 再次检查状态，防止并发问题
        if (currentOrder.status !== RentalOrderStatus.CANCEL_PENDING) {
          this.logger.log(`订单状态已发生变化，跳过处理: orderNo=${orderNo}, status=${currentOrder.status}`);
          return;
        }

        const canceledAt = new Date();

        await this.support.processOrderCancelRefund(currentOrder, cancelReason, canceledAt, manager);

        // 解绑资产实例（若已绑定）
        await this.assetInventoryService.unbindFromOrder(currentOrder.id, manager);

        // 取消订单相关任务
        this.support.cancelOrderRelatedJobs(currentOrder.id);

        this.logger.log(
          `取消确认超时任务处理完成，已自动退款: orderNo=${orderNo}, orderId=${orderId}, reason=${cancelReason}`,
        );
      });

      // 发送订单取消消息通知
      const canceledOrder = await this.orderRepo.findById(orderId);
      if (canceledOrder) {
        await this.messageNotificationService.notifyOrderCanceled(canceledOrder, cancelReason, 'system');
      }
    } catch (error) {
      this.logger.error(`取消确认超时任务处理失败: orderNo=${orderNo}`, error.stack);
      throw error;
    }
  }
}
