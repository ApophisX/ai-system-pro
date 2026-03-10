import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource, In } from 'typeorm';
import { RentalOrderRepository } from '../repositories';
import { RentalOrderEntity, RentalOrderEvidenceEntity, DepositDeductionEntity } from '../entities';
import {
  RentalOrderStatus,
  EvidenceSubmitterType,
  EvidenceAuditStatus,
  EvidenceType,
  DepositDeductionStatus,
  RentalOrderUsageStatus,
} from '../enums';
import { CancelRentalOrderDto, CancelByLessorDto, ApproveCancelOrderDto, OutputRentalOrderDto } from '../dto';
import { RentalOrderSupportService } from './rental-order-support.service';
import { RentalOrderJobService } from '../jobs/services';
import { AssetInventoryService } from '@/modules/asset/services/asset-inventory.service';
import { MessageNotificationService } from '@/modules/base/message/services';
import { CreditEvents } from '@/modules/credit/events/credit.events';
import { CreditActorRole } from '@/modules/credit/enums';
import dayjs from 'dayjs';

/**
 * 租赁订单取消服务
 *
 * 承租方取消、撤销取消、出租方同意/拒绝取消、商家取消、删除订单等
 */
@Injectable()
export class RentalOrderCancelService {
  private readonly logger = new Logger(RentalOrderCancelService.name);

  constructor(
    private readonly orderRepo: RentalOrderRepository,
    private readonly dataSource: DataSource,
    private readonly support: RentalOrderSupportService,
    private readonly rentalOrderJobService: RentalOrderJobService,
    private readonly assetInventoryService: AssetInventoryService,
    private readonly messageNotificationService: MessageNotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    //
  }

  /**
   * 承租方取消订单
   * @param userId 用户ID
   * @param orderId 订单ID
   * @param dto 取消订单请求DTO
   * @returns 更新后的订单DTO
   */
  async cancelOrderByLessee(
    userId: string,
    orderId: string,
    dto: CancelRentalOrderDto = {},
  ): Promise<OutputRentalOrderDto> {
    const order = await this.orderRepo.findById(orderId, {
      relations: { payments: { paymentRecords: true }, deposits: true },
    });

    if (order.lesseeId !== userId) {
      throw new ForbiddenException('只有承租方可以取消订单');
    }

    if (order.status === RentalOrderStatus.CANCELED) {
      this.logger.log(`订单已取消，跳过处理: orderNo=${order.orderNo}, orderId=${orderId}`);
      return this.support.toOutputRentalOrderDto(order);
    }

    if (order.status === RentalOrderStatus.CANCEL_PENDING) {
      throw new BadRequestException('订单已提交取消申请，等待出租方确认');
    }

    if (order.isInUse) {
      throw new BadRequestException('订单状态不允许取消，请联系商家处理。');
    }

    const isPaidOrPartialPaid = order.isPaidOrPartialPaid;
    const hasPaidDeposit = order.isDepositFrozenOrPaid;

    // 如果已支付租金且已支付押金，则提交取消申请
    if (isPaidOrPartialPaid && hasPaidDeposit) {
      return this.dataSource.transaction(async manager => {
        const now = dayjs();
        await manager.update(
          RentalOrderEntity,
          { id: order.id },
          {
            status: RentalOrderStatus.CANCEL_PENDING,
            cancelReason: dto.reason || '承租方申请取消订单，等待出租方确认',
            cancelRefundedAt: now.toDate(),
          },
        );

        // 保存凭证（如果提供了凭证）
        const evidence = manager.getRepository(RentalOrderEvidenceEntity).create({
          rentalOrderId: order.id,
          rentalOrderNo: order.orderNo,
          submitterId: userId,
          submitterType: EvidenceSubmitterType.LESSEE,
          evidenceType: EvidenceType.ORDER_CANCEL,
          evidenceUrls: dto.evidenceUrls,
          description: dto.reason,
          relatedOrderStatus: order.useageStatus,
          auditStatus: EvidenceAuditStatus.PENDING,
        });
        await manager.save(RentalOrderEvidenceEntity, evidence);
        this.logger.log(
          `订单取消申请，凭证已保存: orderNo=${order.orderNo}, evidenceUrlsCount=${dto.evidenceUrls?.length || 0}`,
        );

        // 创建24小时定时任务，如果出租方未操作则自动退款
        const timeoutAt = now.add(24, 'hour').toDate();
        await this.rentalOrderJobService.addCancelConfirmTimeoutJob(order.id, order.orderNo, timeoutAt);

        this.logger.log(
          `订单已提交取消申请，等待出租方确认: orderNo=${order.orderNo}, orderId=${orderId}, userId=${userId}`,
        );

        const updatedOrder = await this.support.findUpdatedOrderAndToDto(manager, order.id);

        // 发送订单取消申请消息通知出租方
        const orderEntity = await manager.findOne(RentalOrderEntity, { where: { id: order.id } });
        if (orderEntity) {
          setImmediate(() => {
            this.messageNotificationService
              .notifyOrderCancelRequested(orderEntity, dto.reason || '承租方申请取消订单')
              .catch(err => {
                this.logger.error(`发送订单取消申请消息失败: orderNo=${order.orderNo}`, err);
              });
          });
        }

        return updatedOrder;
      });
    }

    // 取消订单，押金退款或者解冻
    return this.dataSource.transaction(async manager => {
      const cancelReason = dto.reason || '用户订单取消';
      const canceledAt = new Date();

      // 处理退款和状态更新
      await this.support.processOrderCancelRefund(order, cancelReason, canceledAt, manager);

      // 解绑资产实例（若已绑定）
      await this.assetInventoryService.unbindFromOrder(order.id, manager);

      this.logger.log(`订单取消成功: orderNo=${order.orderNo}, userId=${userId}, reason=${cancelReason}`);
      // 取消订单相关任务
      this.support.cancelOrderRelatedJobs(order.id);

      return this.support.findUpdatedOrderAndToDto(manager, order.id);
    });
  }

  async deleteOrder(userId: string, orderId: string): Promise<void> {
    const order = await this.orderRepo.findById(orderId);
    if (order.lesseeId !== userId) {
      throw new ForbiddenException('无权删除此订单');
    }

    // 可删除的订单：已取消、已完成（支付超时取消的订单 status=CANCELED，payStatus=TIMEOUT）
    if ([RentalOrderStatus.CANCELED, RentalOrderStatus.COMPLETED].includes(order.status) || order.isInvalid) {
      await this.orderRepo.delete(orderId);
      this.logger.log(`Order deleted: orderNo=${order.orderNo}`);
      return;
    }
    throw new BadRequestException('只能删除已取消或已完成的订单');
  }

  /**
   * 承租方撤销取消申请
   * @param userId 用户ID
   * @param orderId 订单ID
   * @returns 更新后的订单DTO
   */
  async revokeCancelOrder(userId: string, orderId: string): Promise<OutputRentalOrderDto> {
    const order = await this.orderRepo.findById(orderId, {
      relations: { payments: { paymentRecords: true }, deposits: true },
    });

    if (order.lesseeId !== userId) {
      throw new ForbiddenException('只有承租方可以撤销取消申请');
    }

    if (order.status !== RentalOrderStatus.CANCEL_PENDING) {
      throw new BadRequestException('订单状态不允许此操作，只有等待取消确认状态的订单才能撤销取消申请');
    }

    return this.dataSource.transaction(async manager => {
      await manager
        .getRepository(RentalOrderEntity)
        .update(order.id, { status: RentalOrderStatus.PENDING_RECEIPT, cancelReason: null, cancelRefundedAt: null });

      // 取消24小时定时任务
      await this.rentalOrderJobService.cancelCancelConfirmTimeoutJob(order.id);

      this.logger.log(`承租方撤销取消申请: orderNo=${order.orderNo}, orderId=${orderId}, userId=${userId}`);

      return this.support.findUpdatedOrderAndToDto(manager, order.id);
    });
  }

  // 出租方同意/拒绝取消申请
  async approveCancelOrder(userId: string, orderId: string, dto: ApproveCancelOrderDto): Promise<OutputRentalOrderDto> {
    const order = await this.orderRepo.findById(orderId, {
      relations: { payments: { paymentRecords: true }, deposits: { deductions: true } },
    });

    if (order.lessorId !== userId) {
      throw new ForbiddenException('只有出租方可以处理取消申请');
    }

    if (order.status !== RentalOrderStatus.CANCEL_PENDING) {
      throw new BadRequestException('订单状态不允许此操作，只有等待取消确认状态的订单才能处理');
    }

    // 出租方同意取消订单
    if (dto.approved) {
      return this.dataSource.transaction(async manager => {
        const cancelReason = '出租方同意取消订单';
        const canceledAt = new Date();

        // 处理订单取消退款
        await this.support.processOrderCancelRefund(order, cancelReason, canceledAt, manager);

        // 解绑资产实例（若已绑定）
        await this.assetInventoryService.unbindFromOrder(order.id, manager);

        // 记录资产实例解绑时间
        await manager.update(RentalOrderEntity, { id: order.id }, { inventoryUnboundAt: canceledAt });

        // 发送订单取消消息通知
        const canceledOrder = await this.orderRepo.findById(order.id);
        if (canceledOrder) {
          setImmediate(() => {
            this.messageNotificationService.notifyOrderCanceled(canceledOrder, cancelReason, 'lessee').catch(err => {
              this.logger.error(`发送订单取消消息失败: orderNo=${order.orderNo}`, err);
            });
          });
        }

        // 将进行中的押金扣款（待用户确认、用户拒绝、待平台审核、用户同意、平台已审核）统一改为已取消
        const cancelableStatuses = [
          DepositDeductionStatus.PENDING_USER_CONFIRM,
          DepositDeductionStatus.PENDING_AUDIT,
          DepositDeductionStatus.PLATFORM_APPROVED,
        ];
        const deductionResult = await manager.update(
          DepositDeductionEntity,
          { orderId: order.id, status: In(cancelableStatuses) },
          { status: DepositDeductionStatus.CANCELLED },
        );
        // 保存凭证（如果提供了凭证）
        const evidence = manager.getRepository(RentalOrderEvidenceEntity).create({
          rentalOrderId: order.id,
          rentalOrderNo: order.orderNo,
          submitterId: userId,
          submitterType: EvidenceSubmitterType.LESSOR,
          evidenceType: EvidenceType.ORDER_CANCEL_APPROVE,
          evidenceUrls: dto.evidenceUrls,
          description: dto.reason || '出租方同意取消订单',
          relatedOrderStatus: order.useageStatus,
          auditStatus: EvidenceAuditStatus.APPROVED,
        });
        await manager.save(RentalOrderEvidenceEntity, evidence);

        if (deductionResult.affected && deductionResult.affected > 0) {
          this.logger.log(
            `出租方同意取消订单，已关闭进行中的押金扣款: orderNo=${order.orderNo}, cancelledCount=${deductionResult.affected}`,
          );
        }

        // 发送订单取消消息通知
        const canceledOrderEntity = await manager.findOne(RentalOrderEntity, { where: { id: order.id } });
        if (canceledOrderEntity) {
          setImmediate(() => {
            this.messageNotificationService
              .notifyOrderCanceled(canceledOrderEntity, cancelReason, 'lessor')
              .catch(err => {
                this.logger.error(`发送订单取消消息失败: orderNo=${order.orderNo}`, err);
              });
          });
        }

        setImmediate(() => {
          // 取消24小时定时任务
          this.rentalOrderJobService.cancelCancelConfirmTimeoutJob(order.id).catch(err => {
            this.logger.error(
              `取消24小时定时任务失败: orderId=${order.id}, error=${err instanceof Error ? err.message : '未知错误'}`,
            );
          });
          // 取消订单相关任务
          this.support.cancelOrderRelatedJobs(order.id);

          // 取消押金扣款超时任务
          for (const deposit of order.depositList) {
            for (const deduction of deposit.deductions || []) {
              this.rentalOrderJobService.cancelDepositDeductionTimeoutJob(deduction.id).catch(err => {
                this.logger.error(
                  `取消押金扣款超时任务失败: deductionId=${deduction.id}, error=${err instanceof Error ? err.message : '未知错误'}`,
                );
              });
            }
          }
        });

        this.logger.log(
          `出租方同意取消订单: orderNo=${order.orderNo}, orderId=${orderId}, userId=${userId}, reason=${cancelReason}`,
        );

        return this.support.findUpdatedOrderAndToDto(manager, order.id);
      });
    }

    // 出租方拒绝取消订单
    return this.dataSource.transaction(async manager => {
      await manager.update(
        RentalOrderEntity,
        { id: order.id },
        {
          status: RentalOrderStatus.DISPUTE,
          lessorCancelRejectReason: dto.reason || '出租方拒绝取消申请',
        },
      );

      // 保存凭证（如果提供了凭证）
      const evidence = manager.getRepository(RentalOrderEvidenceEntity).create({
        rentalOrderId: order.id,
        rentalOrderNo: order.orderNo,
        submitterId: userId,
        submitterType: EvidenceSubmitterType.LESSOR,
        evidenceType: EvidenceType.ORDER_CANCEL_REJECT,
        evidenceUrls: dto.evidenceUrls,
        description: dto.reason || '出租方拒绝取消申请',
        relatedOrderStatus: order.useageStatus,
        auditStatus: EvidenceAuditStatus.PENDING,
      });
      await manager.save(RentalOrderEvidenceEntity, evidence);
      this.logger.log(
        `出租方拒绝取消申请，凭证已保存: orderNo=${order.orderNo}, evidenceUrlsCount=${dto.evidenceUrls?.length || 0}`,
      );

      // 取消24小时定时任务
      await this.rentalOrderJobService.cancelCancelConfirmTimeoutJob(order.id);

      this.logger.log(
        `出租方拒绝取消申请，订单进入争议状态: orderNo=${order.orderNo}, orderId=${orderId}, userId=${userId}, reason=${dto.reason}`,
      );

      const result = await this.support.findUpdatedOrderAndToDto(manager, order.id);

      // 发射信用事件：进入争议
      setImmediate(() => {
        this.eventEmitter.emit(CreditEvents.DISPUTE_OPENED, {
          userId: order.lessorId,
          actorRole: CreditActorRole.LESSOR,
          orderId: order.id,
          initiatorRole: CreditActorRole.LESSOR,
          operatorType: 'system',
        });
        this.eventEmitter.emit(CreditEvents.DISPUTE_OPENED, {
          userId: order.lesseeId,
          actorRole: CreditActorRole.LESSEE,
          orderId: order.id,
          initiatorRole: CreditActorRole.LESSOR,
          operatorType: 'system',
        });
      });

      return result;
    });
  }

  /**
   * 由出租方取消订单
   * @param userId 用户ID
   * @param orderId 订单ID
   * @param dto 取消订单请求DTO
   * @returns 更新后的订单DTO
   */
  async cancelByLessorOrder(userId: string, orderId: string, dto?: CancelByLessorDto): Promise<OutputRentalOrderDto> {
    const order = await this.orderRepo.findById(orderId, {
      relations: { payments: { paymentRecords: true }, deposits: true },
    });

    if (order.lessorId !== userId) {
      throw new ForbiddenException('只有出租方可以取消订单');
    }

    if (!order.isPendingReceipt) {
      throw new BadRequestException('仅待收货且未开始使用的订单可被取消');
    }

    return this.dataSource.transaction(async manager => {
      const closeReason = dto?.reason?.trim() || '商家拒绝接单，取消订单';
      const closedAt = new Date();

      // 处理订单退款、押金退款/解冻、状态更新
      await this.support.processOrderCancelRefund(order, closeReason, closedAt, manager);

      // 解绑资产实例（若已绑定）
      await this.assetInventoryService.unbindFromOrder(order.id, manager);

      this.logger.log(
        `出租方强制关闭订单: orderNo=${order.orderNo}, orderId=${orderId}, userId=${userId}, reason=${closeReason}`,
      );

      // 取消订单相关任务
      this.support.cancelOrderRelatedJobs(order.id);

      // 发送订单取消消息通知承租方
      setImmediate(() => {
        this.messageNotificationService.notifyOrderCanceled(order, closeReason, 'lessor').catch(err => {
          this.logger.error(`发送商家取消订单消息失败: orderNo=${order.orderNo}`, err);
        });
      });

      return this.support.findUpdatedOrderAndToDto(manager, order.id);
    });
  }
}
