/**
 * 归还确认超时处理器
 *
 * 处理承租方提交归还申请后，出租方24小时未操作的情况，自动确认归还
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { RentalOrderRepository } from '../../repositories';
import { RentalOrderEntity, RentalOrderEvidenceEntity } from '../../entities';
import {
  RentalOrderStatus,
  RentalOrderUsageStatus,
  RentalOrderOverdueStatus,
  EvidenceType,
  EvidenceSubmitterType,
  EvidenceAuditStatus,
} from '../../enums';
import { RENTAL_ORDER_RETURN_CONFIRM_TIMEOUT_QUEUE } from '../constants/rental-order-queue.constant';
import dayjs from 'dayjs';
import { ReturnConfirmTimeoutJobData } from '../type';
import { RentalOrderSupportService } from '../../services';
import { AssetInventoryService } from '@/modules/asset/services/asset-inventory.service';
import { MessageNotificationService } from '@/modules/base/message/services';

@Processor(RENTAL_ORDER_RETURN_CONFIRM_TIMEOUT_QUEUE)
export class ReturnConfirmTimeoutProcessor extends WorkerHost {
  private readonly logger = new Logger(ReturnConfirmTimeoutProcessor.name);

  constructor(
    private readonly orderRepo: RentalOrderRepository,
    private readonly dataSource: DataSource,
    private readonly support: RentalOrderSupportService,
    private readonly assetInventoryService: AssetInventoryService,
    private readonly messageNotificationService: MessageNotificationService,
  ) {
    super();
  }

  async process(job: Job<ReturnConfirmTimeoutJobData>): Promise<void> {
    const { orderId, orderNo, timeoutAt } = job.data;

    this.logger.log(`处理出租方24小时未操作，系统自动确认归还任务: orderNo=${orderNo}, orderId=${orderId}`);

    try {
      // 查询订单当前状态
      const order = await this.orderRepo.findById(orderId, {
        relations: { payments: true, deposits: true },
      });

      if (!order) {
        this.logger.warn(`订单不存在: orderNo=${orderNo}, orderId=${orderId}`);
        return;
      }

      // // 检查订单状态是否为已归还待确认
      // if (order.status !== RentalOrderStatus.RETURNED_PENDING) {
      //   this.logger.log(`订单状态不是已归还待确认，跳过处理: orderNo=${orderNo}, status=${order.status}`);
      //   return;
      // }

      // 检查使用状态是否为已归还待确认
      if (order.useageStatus !== RentalOrderUsageStatus.RETURNED_PENDING) {
        this.logger.log(
          `订单使用状态不是已归还待确认，跳过处理: orderNo=${orderNo}, useageStatus=${order.useageStatus}`,
        );
        return;
      }

      // 检查超时时间是否已过
      const nowTime = dayjs();
      const expiredAt = dayjs(timeoutAt);

      if (nowTime.isBefore(expiredAt)) {
        this.logger.log(`超时时间未到: orderNo=${orderNo}, timeoutAt=${expiredAt.format('YYYY-MM-DD HH:mm:ss')}`);
        return;
      }

      // 在事务中处理自动确认归还
      await this.dataSource.transaction(async manager => {
        // 重新查询订单，确保获取最新状态（使用悲观锁防止并发）
        const currentOrder = await manager.findOne(RentalOrderEntity, {
          where: { id: orderId },
          relations: { payments: true, deposits: true },
          lock: { mode: 'pessimistic_write' },
        });

        if (!currentOrder) {
          this.logger.warn(`订单不存在（事务内）: orderNo=${orderNo}, orderId=${orderId}`);
          return;
        }

        // 再次检查状态，防止并发问题
        if (currentOrder.useageStatus !== RentalOrderUsageStatus.RETURNED_PENDING) {
          this.logger.log(
            `订单使用状态已发生变化，跳过处理: orderNo=${orderNo}, useageStatus=${currentOrder.useageStatus}`,
          );
          return;
        }

        const now = new Date();
        const autoConfirmReason = '出租方24小时未操作，系统自动确认归还';

        // 自动确认归还：更新订单使用状态和归还确认时间
        await manager.update(
          RentalOrderEntity,
          { id: orderId },
          {
            useageStatus: RentalOrderUsageStatus.RETURNED,
            returnedConfirmedAt: now, // 归还完成时间记录为确认时间（用于流程审计）
          },
        );

        // 创建系统自动确认归还证据（平台裁决凭证）
        const evidence = manager.getRepository(RentalOrderEvidenceEntity).create({
          rentalOrderId: currentOrder.id,
          rentalOrderNo: currentOrder.orderNo,
          submitterId: currentOrder.lessorId, // 系统代替出租方确认，使用出租方ID
          submitterType: EvidenceSubmitterType.LESSOR,
          evidenceType: EvidenceType.PLATFORM_DECISION,
          description: autoConfirmReason,
          relatedOrderStatus: RentalOrderUsageStatus.RETURNED, // 变更后的状态：IN_USE -> RETURNED
          auditStatus: EvidenceAuditStatus.APPROVED, // 系统自动确认，自动通过
          auditedAt: now,
        });
        await manager.save(RentalOrderEvidenceEntity, evidence);
        this.logger.log(`订单 ${currentOrder.orderNo} 系统自动确认归还，平台裁决凭证已保存: evidenceId=${evidence.id}`);

        // 解绑资产实例（若已绑定）
        await this.assetInventoryService.unbindFromOrder(orderId, manager);

        // 取消订单相关任务
        this.support.cancelOrderRelatedJobs(orderId);

        this.logger.log(
          `归还确认超时任务处理完成，已自动确认归还: orderNo=${orderNo}, orderId=${orderId}, returnedConfirmedAt=${now.toISOString()}, reason=${autoConfirmReason}`,
        );
      });

      // 发送归还确认消息通知出租方和承租方（系统自动确认，异步执行不阻塞任务）
      setImmediate(() => {
        this.orderRepo
          .findById(orderId, { relations: { payments: true, deposits: true } })
          .then(orderForNotify => {
            if (orderForNotify) {
              return this.messageNotificationService.notifyOrderReturnConfirmed(orderForNotify);
            }
          })
          .catch(err => {
            this.logger.error(`发送归还确认消息失败: orderNo=${orderNo}`, err);
          });
      });
    } catch (error) {
      this.logger.error(`归还确认超时任务处理失败: orderNo=${orderNo}`, error.stack);
      throw error;
    }
  }
}
