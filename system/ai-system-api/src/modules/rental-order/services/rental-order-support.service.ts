import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EntityManager, FindOptionsRelations, In } from 'typeorm';
import { RentalOrderEntity } from '../entities/rental-order.entity';
import { RentalOrderStatus, RentalOrderRefundStatus, DepositStatus } from '../enums';
import { OutputRentalOrderDto } from '../dto';
import { plainToInstance } from 'class-transformer';
import { PaymentEntity } from '@/modules/base/payment/entities';
import { InstallmentStatus, PaymentType } from '@/modules/base/payment/enums';
import { PaymentService } from '@/modules/base/payment/services';
import { DepositService } from './deposit.service';
import { RentalOrderJobService } from '../jobs/services';
import { RentalOrderRepository } from '../repositories';
import { AssetRentalPlanEntity } from '@/modules/asset/entities/asset-rental-plan.entity';
import Decimal from 'decimal.js';

/**
 * 租赁订单支撑服务
 *
 * 提供订单相关共享能力：DTO 转换、定时任务取消、事务内查询、取消退款逻辑、金额计算等。
 * 供 Create / Cancel / End / Refund 等 feature 服务复用。
 */
@Injectable()
export class RentalOrderSupportService {
  private readonly logger = new Logger(RentalOrderSupportService.name);

  static readonly ORDER_DETAIL_RELATIONS: FindOptionsRelations<RentalOrderEntity> = {
    payments: true,
    deposits: true,
    assetSnapshot: true,
    rentalPlanSnapshot: true,
  };

  constructor(
    private readonly paymentService: PaymentService,
    private readonly depositService: DepositService,
    private readonly rentalOrderJobService: RentalOrderJobService,
  ) {
    //
  }

  toOutputRentalOrderDto(order: RentalOrderEntity): OutputRentalOrderDto {
    return plainToInstance(OutputRentalOrderDto, order, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  //  取消订单相关任务
  cancelOrderRelatedJobs(orderId: string): void {
    setImmediate(() => {
      this.rentalOrderJobService.cancelPaymentTimeoutJob(orderId).catch(err => {
        this.logger.error(`取消支付超时任务失败: orderId=${orderId}`, err);
      });
      this.rentalOrderJobService.cancelInstallmentOverdueJob(orderId).catch(err => {
        this.logger.error(`取消分期逾期任务失败: orderId=${orderId}`, err);
      });
      this.rentalOrderJobService.cancelRentalOverdueJob(orderId).catch(err => {
        this.logger.error(`取消租赁逾期任务失败: orderId=${orderId}`, err);
      });
      // this.rentalOrderJobService.cancelCancelConfirmTimeoutJob(orderId).catch(err => {
      //   this.logger.error(`取消出租方24小时未操作，系统自动同意取消并退款任务失败: orderId=${orderId}`, err);
      // });
    });
  }

  /**
   * 查询并转换订单实体为DTO
   */
  async findUpdatedOrderAndToDto(
    manager: EntityManager,
    orderId: string,
    relations?: FindOptionsRelations<RentalOrderEntity>,
  ): Promise<OutputRentalOrderDto> {
    const rel = relations ?? RentalOrderSupportService.ORDER_DETAIL_RELATIONS;
    const updatedOrder = await manager.findOne(RentalOrderEntity, {
      where: { id: orderId },
      relations: rel,
    });
    if (!updatedOrder) {
      throw new NotFoundException('订单不存在');
    }
    return this.toOutputRentalOrderDto(updatedOrder);
  }

  /**
   * 处理订单退款、押金退款/解冻、状态更新
   * @param order 订单实体
   * @param cancelReason 取消原因
   * @param canceledAt 取消时间
   * @param manager 事务管理器
   */
  async processOrderCancelRefund(
    order: RentalOrderEntity,
    cancelReason: string,
    canceledAt: Date,
    manager: EntityManager,
  ): Promise<void> {
    await this.processOrderRefundAndStatusUpdate(order, cancelReason, canceledAt, RentalOrderStatus.CANCELED, manager);
  }

  /**
   * 处理订单押金退款/解冻
   *
   * 业务逻辑：
   * 1. 检查订单是否需要押金
   * 2. 检查押金状态（已冻结、已支付、部分扣除）
   * 3. 更新订单押金状态为 REFUNDING（如果需要）
   * 4. 调用押金服务处理退款/解冻
   *
   * @param order 订单实体
   * @param reason 退款原因
   * @param manager 事务管理器
   * @returns 是否成功处理了押金退款（true：已处理，false：无需处理或已处理过）
   */
  async processDepositRefund(order: RentalOrderEntity, reason: string, manager: EntityManager): Promise<boolean> {
    // 检查订单是否需要押金
    if (!order.needDeposit) {
      this.logger.log(`订单无需押金，跳过押金处理: orderNo=${order.orderNo}`);
      return false;
    }

    // 检查押金状态
    if (!order.isDepositFrozenOrPaid) {
      // 押金状态为待支付或失败，更新为已取消
      if ([DepositStatus.PENDING, DepositStatus.FAILED].includes(order.depositStatus)) {
        await manager.update(RentalOrderEntity, { id: order.id }, { depositStatus: DepositStatus.CANCELED });
        this.logger.log(`订单押金状态已更新为已取消: orderNo=${order.orderNo}`);
      } else {
        this.logger.log(`订单押金状态无需处理: orderNo=${order.orderNo}, depositStatus=${order.depositStatus}`);
      }
      return false;
    }

    // 押金已冻结或已支付，需要退款/解冻
    try {
      this.logger.log(`订单押金需要退款/解冻: orderNo=${order.orderNo}, depositStatus=${order.depositStatus}`);

      // 检查是否有已支付或已冻结的押金记录
      const paidDepositCount = order.deposits?.filter(d => d.status === DepositStatus.PAID)?.length || 0;
      const frozenDepositCount = order.deposits?.filter(d => d.status === DepositStatus.FROZEN)?.length || 0;

      // 如果有已支付或已冻结的押金，更新订单押金状态为退款中
      if (paidDepositCount > 0 || frozenDepositCount > 0) {
        await manager.update(RentalOrderEntity, { id: order.id }, { depositStatus: DepositStatus.REFUNDING });
      }

      // 处理押金退款/解冻
      await this.depositService.handleDepositRefundOrUnfreeze(order.deposits || [], reason, manager);
      this.logger.log(`订单押金退款/解冻已处理: orderNo=${order.orderNo}`);
      return true;
    } catch (error) {
      this.logger.error(
        `订单押金退款/解冻失败: orderNo=${order.orderNo}, error=${error instanceof Error ? error.message : error}`,
      );
      // 不抛出异常，让调用方决定如何处理
      return false;
    }
  }

  /**
   * 处理订单退款、押金退款/解冻、状态更新
   * @param order 订单实体
   * @param reason 退款原因
   * @param updatedAt 更新时间
   * @param targetStatus 目标状态
   * @param manager 事务管理器
   */
  async processOrderRefundAndStatusUpdate(
    order: RentalOrderEntity,
    reason: string,
    updatedAt: Date,
    targetStatus: RentalOrderStatus,
    manager: EntityManager,
  ): Promise<void> {
    // 1. 处理已支付的账单退款
    const paidPayments = order.paymentList.filter(p => p.isPaid);
    if (paidPayments.length > 0) {
      this.logger.log(
        `订单有已支付的账单，开始退款: orderNo=${order.orderNo}, paidPaymentsCount=${paidPayments.length}`,
      );
      await manager.update(RentalOrderEntity, { id: order.id }, { refundStatus: RentalOrderRefundStatus.PROCESSING });
      try {
        await this.paymentService.refundAllPaymentsForOrderCancel(paidPayments, reason, manager);
        this.logger.log(
          `订单租金退款已处理，待回调通知处理: orderNo=${order.orderNo}, paidPaymentsCount=${paidPayments.length}`,
        );
      } catch (error) {
        this.logger.error(
          `订单租金退款处理失败: orderNo=${order.orderNo}, error=${error instanceof Error ? error.message : error}`,
        );
        await manager.update(RentalOrderEntity, { id: order.id }, { refundStatus: RentalOrderRefundStatus.FAILED });
        throw error;
      }
    } else {
      this.logger.log(`订单无已支付账单，跳过退款: orderNo=${order.orderNo}`);
    }

    // 2. 取消未支付的分期账单
    const cancelableInstallmentPaymentStatuses = [
      InstallmentStatus.GENERATING,
      InstallmentStatus.PENDING,
      InstallmentStatus.DUE,
      InstallmentStatus.OVERDUE,
    ];
    const unpaidPayments = order.paymentList.filter(
      p => !p.isPaid && cancelableInstallmentPaymentStatuses.includes(p.status),
    );
    if (unpaidPayments.length > 0) {
      await manager.update(
        PaymentEntity,
        { id: In(unpaidPayments.map(p => p.id)) },
        { status: InstallmentStatus.CANCELED },
      );
      this.logger.log(`已取消未支付的分期账单: orderNo=${order.orderNo}, unpaidPaymentsCount=${unpaidPayments.length}`);
    }

    // 3. 处理押金退款/解冻（使用抽取的方法）
    await this.processDepositRefund(order, reason, manager);

    // 4. 更新订单状态
    await manager.update(
      RentalOrderEntity,
      { id: order.id },
      {
        status: targetStatus,
        cancelReason: reason,
        canceledAt: updatedAt,
      },
    );
  }

  /**
   * 计算租金金额
   * @param rentalPlan 租赁计划实体
   * @param duration 租赁时长
   * @returns 租金金额
   */
  calculateRentalAmount(rentalPlan: AssetRentalPlanEntity, duration: number): number {
    const price = new Decimal(rentalPlan.price);
    if (rentalPlan.isInstallment) {
      return price.mul(rentalPlan.rentalPeriod).toNumber();
    }
    return price.mul(duration).toNumber();
  }

  /**
   * 计算平台服务费
   * @param rentalAmount 租金金额
   * @param platformServiceRate 平台服务费率
   * @returns 平台服务费
   */
  calculatePlatformFee(rentalAmount: number, platformServiceRate: number): number {
    return new Decimal(rentalAmount).mul(platformServiceRate).div(100).toNumber();
  }
}
