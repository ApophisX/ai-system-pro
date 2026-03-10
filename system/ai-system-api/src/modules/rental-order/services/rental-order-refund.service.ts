import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RentalOrderEntity } from '../entities';
import { RentalOrderRepository } from '../repositories';
import { RentalOrderStatus, RentalOrderRefundStatus } from '../enums';
import { RefundRentalOrderDto, RefundPaymentRecordDto, OutputRentalOrderDto } from '../dto';
import { PaymentService } from '@/modules/base/payment/services';
import { PaymentRecordRepository } from '@/modules/base/payment/repositories';
import { RefundStatus, PaymentStatus, WithdrawalStatus, PaymentType } from '@/modules/base/payment/enums';
import Decimal from 'decimal.js';
import { RentalOrderSupportService } from './rental-order-support.service';

/**
 * 租赁订单退款服务
 *
 * 订单退款、单笔账单退款（基于 payment_record）
 */
@Injectable()
export class RentalOrderRefundService {
  private readonly logger = new Logger(RentalOrderRefundService.name);

  constructor(
    private readonly orderRepo: RentalOrderRepository,
    private readonly dataSource: DataSource,
    private readonly paymentService: PaymentService,
    private readonly paymentRecordRepo: PaymentRecordRepository,
    private readonly support: RentalOrderSupportService,
  ) {}

  async refundOrder(userId: string, dto: RefundRentalOrderDto): Promise<OutputRentalOrderDto> {
    const order = await this.orderRepo.findById(dto.orderId);

    if (order.lesseeId !== userId && order.lessorId !== userId) {
      throw new ForbiddenException('无权操作此订单');
    }

    if (!order.isPaidRental) {
      throw new BadRequestException('只有已支付的订单才能退款');
    }

    const payments = await this.paymentService.getPaymentsByOrderId(order.id);
    if (payments.length === 0) {
      throw new BadRequestException('未找到支付记录');
    }

    const payment = payments[0];

    // 检查是否已提现
    if (payment.isWithdrawn) {
      throw new BadRequestException('账单已被提现，无法退款');
    }
    const refundAmount = dto.amount || order.totalAmount;

    await this.paymentService.createRefund(userId, {
      paymentId: payment.id,
      amount: Number(refundAmount),
      reason: dto.reason || '订单退款',
    });

    if (refundAmount < order.totalAmount) {
      await this.orderRepo.updateRefundStatus(order.id, RentalOrderRefundStatus.PARTIAL_REFUND);
    } else {
      await this.orderRepo.updateRefundStatus(order.id, RentalOrderRefundStatus.PROCESSING);
    }

    this.logger.log(`Order refund initiated: orderNo=${order.orderNo}, amount=${refundAmount}`);

    const updatedOrder = await this.orderRepo.findById(dto.orderId);
    return this.support.toOutputRentalOrderDto(updatedOrder);
  }

  async refundPaymentRecord(
    userId: string,
    orderId: string,
    dto: RefundPaymentRecordDto,
  ): Promise<OutputRentalOrderDto> {
    const order = await this.orderRepo.findById(orderId, {
      relations: { payments: { paymentRecords: true }, deposits: true },
    });

    if (order.lessorId !== userId) {
      throw new ForbiddenException('只有出租方可以发起单笔账单退款');
    }

    if (order.isCompleted) {
      throw new BadRequestException('订单已完成（履约结束并结算完成），不可发起单笔账单退款');
    }
    if (order.isInvalid) {
      throw new BadRequestException(
        order.status === RentalOrderStatus.CLOSED
          ? '订单已关闭，不可发起退款'
          : order.status === RentalOrderStatus.CANCELED
            ? '订单已取消，不可发起退款'
            : '订单已失效，不可发起退款',
      );
    }
    if (!order.isPaid) {
      throw new BadRequestException('订单租金未支付完成，无可退款账单');
    }

    const paymentRecord = await this.paymentRecordRepo.findOne({
      where: { id: dto.paymentRecordId },
      relations: ['payment'],
    });

    if (!paymentRecord) {
      throw new NotFoundException('支付记录不存在');
    }

    if (paymentRecord.orderId !== orderId) {
      throw new BadRequestException('支付记录不属于该订单');
    }

    // 仅支持租金类账单：分期租赁、单次短租、续租（文档约定）
    const allowedPaymentTypes: string[] = [
      PaymentType.RENTAL,
      PaymentType.INSTALLMENT,
      PaymentType.RENEWAL,
      PaymentType.ORDER,
    ];
    if (!allowedPaymentTypes.includes(paymentRecord.paymentType ?? '')) {
      throw new BadRequestException(
        `该支付记录类型不允许退款，仅支持租金/分期/续租账单，当前类型：${paymentRecord.paymentType || '未知'}`,
      );
    }

    // 租金类账单应有 paymentId，确保回调链路可正确回写
    if (!paymentRecord.paymentId) {
      throw new BadRequestException('该支付记录无关联账单，无法发起退款');
    }

    if (paymentRecord.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('支付记录状态不允许退款，必须是已支付状态');
    }

    if (paymentRecord.refundStatus === RefundStatus.COMPLETED) {
      throw new BadRequestException('该支付记录已全额退款，无法再次退款');
    }

    // 检查是否已提现
    if (paymentRecord.withdrawalStatus && paymentRecord.withdrawalStatus !== WithdrawalStatus.NONE) {
      throw new BadRequestException('支付记录已被提现，无法退款');
    }

    const paidAmount = new Decimal(paymentRecord.amount).toNumber();
    const refundedAmount = await this.paymentService.getRefundedAmountForPaymentRecord(paymentRecord.id);
    const availableRefundAmount = paidAmount - refundedAmount;

    if (dto.amount <= 0) {
      throw new BadRequestException('退款金额必须大于0');
    }

    if (new Decimal(dto.amount).gt(availableRefundAmount)) {
      throw new BadRequestException(
        `退款金额超过剩余可退款金额，已支付金额：${paidAmount}元，已退款金额：${refundedAmount}元，剩余可退款金额：${availableRefundAmount}元`,
      );
    }

    return this.dataSource.transaction(async manager => {
      const refundStatus = await this.paymentService.refundPaymentRecordPartialWithManager(
        paymentRecord,
        dto.amount,
        dto.reason || '商家发起单笔账单退款',
        manager,
      );

      if (refundStatus === RefundStatus.COMPLETED) {
        this.logger.log(
          `单笔账单退款成功: orderNo=${order.orderNo}, paymentRecordId=${paymentRecord.id}, refundAmount=${dto.amount}`,
        );
      } else if (refundStatus === RefundStatus.PROCESSING) {
        this.logger.warn(
          `单笔账单退款处理中，等待回调通知: orderNo=${order.orderNo}, paymentRecordId=${paymentRecord.id}, refundAmount=${dto.amount}`,
        );
      } else {
        this.logger.warn(
          `单笔账单退款失败: orderNo=${order.orderNo}, paymentRecordId=${paymentRecord.id}, refundAmount=${dto.amount}, status=${refundStatus}`,
        );
      }

      // 按本次退款实际状态更新订单 refundStatus
      const orderRefundStatus =
        refundStatus === RefundStatus.FAILED
          ? RentalOrderRefundStatus.FAILED
          : refundStatus === RefundStatus.COMPLETED
            ? RentalOrderRefundStatus.PARTIAL_REFUND
            : RentalOrderRefundStatus.PROCESSING;
      await manager.update(RentalOrderEntity, { id: order.id }, { refundStatus: orderRefundStatus });

      return this.support.findUpdatedOrderAndToDto(manager, order.id, {
        payments: { paymentRecords: true },
        deposits: true,
        assetSnapshot: true,
        rentalPlanSnapshot: true,
      });
    });
  }
}
