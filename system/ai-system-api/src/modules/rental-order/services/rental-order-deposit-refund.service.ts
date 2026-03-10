import { Injectable, Logger, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RentalOrderRepository } from '../repositories';
import { RentalOrderStatus, RentalOrderUsageStatus } from '../enums';
import { OutputRentalOrderDto } from '../dto';
import { RentalOrderSupportService } from './rental-order-support.service';
import Decimal from 'decimal.js';

/**
 * 租赁订单押金退款服务
 *
 * 处理订单押金退款业务逻辑
 */
@Injectable()
export class RentalOrderDepositRefundService {
  private readonly logger = new Logger(RentalOrderDepositRefundService.name);

  constructor(
    private readonly orderRepo: RentalOrderRepository,
    private readonly dataSource: DataSource,
    private readonly support: RentalOrderSupportService,
  ) {
    //
  }

  /**
   * 押金退款
   *
   * 业务逻辑：
   * 1. 验证订单状态和权限
   * 2. 检查押金状态
   * 3. 执行押金退款（使用抽取的方法）
   *
   * @param userId 用户 ID（出租方）
   * @param orderId 订单 ID
   * @param remark 退款备注（可选）
   * @returns 更新后的订单 DTO
   */
  async refundDeposit(userId: string, orderId: string, remark?: string): Promise<OutputRentalOrderDto> {
    const order = await this.orderRepo.findById(orderId, {
      relations: { deposits: true },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 验证权限：只有出租方可以发起押金退款
    if (order.lessorId !== userId) {
      throw new ForbiddenException('只有出租方可以发起押金退款');
    }

    //  TODO，待定 验证订单状态：只有已完成的订单或者已归还的订单才能退款，
    if (
      ![RentalOrderStatus.COMPLETED, RentalOrderStatus.CANCELED, RentalOrderStatus.CLOSED].includes(order.status) &&
      ![RentalOrderUsageStatus.RETURNED].includes(order.useageStatus)
    ) {
      throw new BadRequestException(
        `订单状态不允许押金退款，当前状态：${order.statusLabel}。只有已完成、已取消、已关闭、已归还的订单才能退款`,
      );
    }

    // 检查是否有押金记录
    if (!order.needDeposit) {
      throw new BadRequestException('订单无需押金，无法退款');
    }

    if (!order.isDepositFrozenOrPaid || !order.deposits || order.deposits.length === 0) {
      throw new BadRequestException('订单没有押金记录，无法退款');
    }

    // 检查是否有可退款的押金
    const hasRefundableDeposit = order.deposits.some(
      deposit => deposit.isPaidOrFree && new Decimal(deposit.amount).minus(deposit.deductedAmount).toNumber() > 0,
    );

    if (!hasRefundableDeposit) {
      throw new BadRequestException('没有可退款的押金，押金可能已全部扣除或已退款');
    }

    // 在事务中处理押金退款
    return this.dataSource.transaction(async manager => {
      const refundReason = remark || `订单押金退款: ${order.orderNo}`;
      const processed = await this.support.processDepositRefund(order, refundReason, manager);

      if (!processed) {
        throw new BadRequestException('押金退款处理失败，请检查押金状态');
      }

      this.logger.log(`押金退款已处理: orderNo=${order.orderNo}, orderId=${orderId}`);

      // 返回更新后的订单
      return this.support.findUpdatedOrderAndToDto(manager, order.id);
    });
  }
}
