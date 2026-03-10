import { Injectable, Logger, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RentalOrderRepository } from '../repositories';
import { OutputRentalOrderDto, ConfirmReceiptDto } from '../dto';
import { RentalOrderSupportService } from './rental-order-support.service';
import {
  EvidenceAuditStatus,
  EvidenceSubmitterType,
  EvidenceType,
  RentalOrderUsageStatus,
  RentalOrderStatus,
} from '../enums';
import { RentalOrderEntity, RentalOrderEvidenceEntity } from '../entities';
import { PaymentEntity } from '@/modules/base/payment/entities';
import { computeRentalPeriodTime, computePaymentPeriodTime } from '../utils/rental-period-time.util';
import { FinanceService } from '@/modules/finance/services/finance.service';
import { MessageNotificationService } from '@/modules/base/message/services';

/**
 * 承租方确认收货服务
 *
 * 当订单绑定资产实例后，承租方确认收货：
 * - 租赁开始时间以收货时间为准
 * - 订单使用状态进入使用中
 * - 同步更新账单表的开始/结束时间
 * - 逾期检测由定时任务每分钟扫描，不使用延迟 Job
 */
@Injectable()
export class RentalOrderConfirmReceiptService {
  private readonly logger = new Logger(RentalOrderConfirmReceiptService.name);

  constructor(
    private readonly orderRepo: RentalOrderRepository,
    private readonly support: RentalOrderSupportService,
    private readonly dataSource: DataSource,
    private readonly financeService: FinanceService,
    private readonly messageNotificationService: MessageNotificationService,
  ) {}

  /**
   * 承租方确认收货
   *
   * 业务流程：
   * 1. 校验用户必须是承租方
   * 2. 校验订单主状态必须为 PENDING_RECEIPT（待收货）
   * 3. 校验订单已绑定资产实例（inventoryId 已设置）
   * 4. 校验订单尚未确认收货（receivedAt 为空）
   * 5. 在事务中完成：
   *    - 以收货时间为租赁开始时间，计算租赁结束时间
   *    - 更新订单 startDate、endDate、receivedAt、status
   *    - 同步更新所有账单的 startTime、endTime、payableTime
   *    - 若有凭证图片或说明，创建承租方收货证据
   * 6. 事务提交后：将该订单下出租方财务明细中的待入账订单租金改为已入账
   *
   * 前置条件：
   * - 订单主状态为 PENDING_RECEIPT（待收货）
   * - 订单已绑定资产实例
   * - 当前用户为承租方
   *
   * 后置状态：
   * - 订单主状态变为 RECEIVED（已收货、使用中），useageStatus 变为 IN_USE（使用中）
   * - 租赁开始时间 = 收货时间，租赁结束时间 = 开始时间 + 租期
   * - 逾期检测由定时任务每分钟扫描
   */
  async confirmReceipt(lesseeId: string, orderId: string, dto: ConfirmReceiptDto): Promise<OutputRentalOrderDto> {
    // 1. 查询订单（需包含 payments、assetSnapshot、rentalPlanSnapshot）
    const order = await this.orderRepo.findById(orderId);

    // 2. 权限校验：必须是承租方
    if (order.lesseeId !== lesseeId) {
      throw new ForbiddenException('只有承租方可以确认收货');
    }

    // 3. 状态校验：订单必须是待收货状态
    if (order.status !== RentalOrderStatus.PENDING_RECEIPT) {
      throw new BadRequestException(`仅「待收货」状态的订单可确认收货，当前订单状态为「${order.status}」`);
    }

    // 4. 校验订单已绑定资产实例
    if (!order.inventoryId) {
      throw new BadRequestException('订单尚未绑定资产实例，请等待出租方发货后再确认收货');
    }

    // 5. 幂等性校验：尚未确认收货
    if (order.receivedAt) {
      throw new ConflictException('订单已确认收货，请勿重复操作');
    }

    // 6. 校验租赁方案快照存在
    const rentalPlan = order.rentalPlanJson;
    if (!rentalPlan) {
      throw new BadRequestException('订单租赁方案信息缺失，无法计算租期');
    }

    // 7. 在事务中完成：更新订单时间、账单时间、创建证据
    await this.dataSource.transaction(async manager => {
      const now = new Date();
      // 租赁开始时间 = 收货时间，租期计算与 create 共用 util
      const { startDate, endDate, periodDuration, periodUnit } = computeRentalPeriodTime(
        now,
        order.duration,
        order.rentalPeriod,
        rentalPlan.rentalType,
      );

      // 7.2 更新订单：主状态、收货时间、租赁开始/结束时间、使用状态
      // PENDING_RECEIPT → RECEIVED（已收货、使用中）
      await manager.update(RentalOrderEntity, order.id, {
        status: RentalOrderStatus.RECEIVED, // 主状态：已收货、使用中
        receivedAt: now,
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        useageStatus: RentalOrderUsageStatus.IN_USE, // 使用状态：使用中
      });

      // 7.3 同步更新账单表的 startTime、endTime、payableTime（与 create 共用 util）
      const payments = (order.payments ?? []).sort((a, b) => a.periodIndex - b.periodIndex);
      const isPostPayment = order.assetSnapshot?.isPostPayment ?? false;

      for (const payment of payments) {
        const { startTime, endTime, payableTime } = computePaymentPeriodTime(
          payment.periodIndex,
          startDate,
          periodDuration,
          periodUnit,
          endDate,
          isPostPayment,
          order.isInstallment,
        );
        await manager.update(PaymentEntity, payment.id, {
          startTime,
          endTime,
          payableTime,
        });
      }

      // 7.4 若有凭证图片或说明，创建承租方收货证据
      const evidence = manager.getRepository(RentalOrderEvidenceEntity).create({
        rentalOrderId: order.id,
        rentalOrderNo: order.orderNo,
        submitterId: lesseeId,
        auditStatus: EvidenceAuditStatus.APPROVED,
        submitterType: EvidenceSubmitterType.LESSEE,
        evidenceType: EvidenceType.ASSET_RECEIPT_CONFIRM,
        evidenceUrls: dto.evidenceUrls,
        description: `${dto.confirmedReceipt}：${dto.description || '用户已确认收货，未填写收货说明'}`,
        relatedOrderStatus: RentalOrderUsageStatus.IN_USE, // 变更后的状态：PENDING_RECEIPT -> RECEIVED, useageStatus -> IN_USE
      });
      await manager.save(RentalOrderEvidenceEntity, evidence);

      this.logger.log(
        `订单 ${order.orderNo} 承租方已确认收货，使用状态更新为 IN_USE。收货时间: ${now.toISOString()}，租赁期: ${startDate.toISOString()} ~ ${endDate.toISOString()}`,
      );
    });

    // 7.1 发送确认收货消息通知出租方
    setImmediate(() => {
      this.messageNotificationService.notifyReceiptConfirmed(order).catch(err => {
        this.logger.error(`发送确认收货消息失败: orderNo=${order.orderNo}`, err);
      });
    });

    // 8. 将该订单下出租方财务明细中的待入账订单租金改为已入账（与确认收货解耦，失败仅打日志）
    try {
      await this.financeService.confirmFinanceByOrderId(order.id);
    } catch (err) {
      this.logger.error(
        `订单确认收货后财务确认入账失败，需人工或补偿任务处理: orderId=${order.id}, orderNo=${order.orderNo}`,
        err instanceof Error ? err.stack : String(err),
      );
    }

    // 9. 查询并返回更新后的订单（逾期由定时任务每分钟检测）
    const result = await this.orderRepo.findById(orderId);
    return this.support.toOutputRentalOrderDto(result);
  }
}
