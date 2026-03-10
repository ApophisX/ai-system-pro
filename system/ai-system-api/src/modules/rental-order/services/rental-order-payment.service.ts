import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RentalOrderRepository } from '../repositories';
import { RentalOrderEntity } from '../entities';
import { RentalOrderOverdueStatus } from '../enums';
import {
  PayRentalOrderDto,
  PayInstallmentDto,
  PayOverdueUseFeeDto,
  OutputPayRentalOrderResultDto,
  OutputPayDepositResultDto,
} from '../dto';
import { plainToInstance } from 'class-transformer';
import Decimal from 'decimal.js';
import { PaymentService } from '@/modules/base/payment/services';
import { DepositService } from './deposit.service';
import { InstallmentStatus } from '@/modules/base/payment/enums';
import { DepositStatus } from '../enums';
import { RequestContext } from '@/common/dtos/request-context.dto';

/**
 * 租赁订单支付服务
 *
 * 支付订单（首期租金）、支付押金、支付分期账单
 */
@Injectable()
export class RentalOrderPaymentService {
  constructor(
    private readonly orderRepo: RentalOrderRepository,
    private readonly paymentService: PaymentService,
    private readonly depositService: DepositService,
    private readonly dataSource: DataSource,
  ) {
    //
  }

  // 支付订单
  async payOrder(userId: string, dto: PayRentalOrderDto, _ctx: RequestContext) {
    const order = await this.orderRepo.findById(dto.orderId, {
      where: { lesseeId: userId },
      relations: { payments: true, lessor: true },
    });

    if (!order.lessor.isEnterpriseVerified) {
      throw new BadRequestException('该订单的不支持支付');
    }

    // 检查订单状态和支付状态，确保订单处于待支付状态
    if (!order.isPending) {
      throw new BadRequestException('订单状态不允许支付');
    }

    if (order.needDeposit && !order.isDepositFrozenOrPaid) {
      throw new BadRequestException('请先完成押金支付');
    }

    if (order.isExpired) {
      throw new BadRequestException('订单已过期');
    }

    const firstPayment = order.paymentList.find(p => p.periodIndex === 1);
    if (!firstPayment) {
      throw new BadRequestException('未找到支付记录');
    }

    if (firstPayment.isPaid) {
      throw new BadRequestException('订单已支付');
    }

    if (!firstPayment.isPending) {
      throw new BadRequestException('支付状态不允许支付');
    }

    return this.paymentService.payFirstRentalOrderPayment(userId, order, firstPayment, dto.provider);
  }

  // 支付押金
  async payDeposit(userId: string, dto: PayRentalOrderDto, _ctx: RequestContext): Promise<OutputPayDepositResultDto> {
    const order = await this.orderRepo.findById(dto.orderId, {
      where: { lesseeId: userId },
      relations: { payments: true },
    });

    if (order.isExpired) throw new BadRequestException('订单已过期');
    // 检查订单状态和支付状态，确保订单处于待支付状态
    if (!order.isPending) {
      throw new BadRequestException('订单状态异常');
    }
    if (!order.canPayDeposit) throw new BadRequestException('押金状态异常');
    if (order.isDepositFrozenOrPaid) return { isPaid: true } as OutputPayDepositResultDto;

    try {
      return this.depositService.payDeposit(userId, order, dto);
    } catch (error) {
      await this.orderRepo.update({ id: order.id }, { depositStatus: DepositStatus.FAILED });
      throw error;
    }
  }

  // 支付分期账单
  async payInstallment(userId: string, dto: PayInstallmentDto, _ctx: RequestContext) {
    const order = await this.orderRepo.findById(dto.orderId, {
      where: { lesseeId: userId },
      relations: { payments: true },
    });

    // 支付分期账单的条件：订单状态为待收货（已支付首期）或使用中/逾期
    if (!order.isInUse) {
      throw new BadRequestException('订单状态不允许支付分期账单');
    }

    if (!order.isInstallment) {
      throw new BadRequestException('该订单不支持分期支付');
    }

    const payment = order.rentalPaymentList.find(p => p.id === dto.paymentId);
    if (!payment) {
      throw new NotFoundException('分期账单不存在或不属于该订单');
    }

    if (payment.isPaid) {
      throw new BadRequestException('该分期账单已支付');
    }

    const allowedStatuses = [
      InstallmentStatus.PENDING,
      InstallmentStatus.DUE,
      InstallmentStatus.OVERDUE,
      InstallmentStatus.GENERATING,
      InstallmentStatus.PARTIAL_PAID,
    ];
    if (!allowedStatuses.includes(payment.status)) {
      throw new BadRequestException(`分期账单状态不允许支付，当前状态：${payment.status}`);
    }

    if (payment.status === InstallmentStatus.GENERATING && !payment.canPrepay) {
      throw new BadRequestException('当前时间不在该分期账单的支付时间范围内');
    }

    const previousPayments = order.rentalPaymentList
      .filter(p => p.periodIndex < payment.periodIndex)
      .sort((a, b) => a.periodIndex - b.periodIndex);

    for (const prevPayment of previousPayments) {
      if (!prevPayment.isPaid && prevPayment.status !== InstallmentStatus.CANCELED) {
        throw new BadRequestException(`请先支付第 ${prevPayment.periodIndex} 期账单`);
      }
    }

    const result = await this.paymentService.createInstallmentPaymentRecord(userId, order, payment, dto.provider);

    return plainToInstance(OutputPayRentalOrderResultDto, result);
  }

  /**
   * 支付超时使用费用
   *
   * 适用场景（必须全部满足）：
   * - 先付后用订单（isPostPayment=false）：租金已预付，超期需补超期费
   * - 非分期订单（isInstallment=false）：分期订单超期走分期账单支付
   * - 超时使用状态（overdueStatus=OVERDUE_USE）：先用后付逾期为 OVERDUE，不在此接口
   * - overdueStatus=OVERDUE_FEE_PAID 时不可支付（已付清）
   *
   * 先用后付非分期订单逾期 → overdueStatus=OVERDUE → 走逾期账单支付，不在此接口
   */
  async payOverdueUseFee(
    userId: string,
    orderId: string,
    dto: PayOverdueUseFeeDto,
  ): Promise<OutputPayRentalOrderResultDto> {
    const order = await this.orderRepo.findById(orderId, {
      where: { lesseeId: userId },
      relations: { payments: true, rentalPlanSnapshot: true, assetSnapshot: true },
    });

    // 1. 权限校验：必须是承租方
    if (order.lesseeId !== userId) {
      throw new ForbiddenException('无权操作该订单');
    }

    // 2. 订单类型校验：必须是先付后用 + 非分期
    if (order.isPostPayment) {
      throw new BadRequestException('先用后付订单的超期费用不在此接口支付，请使用逾期账单支付');
    }
    if (order.isInstallment) {
      throw new BadRequestException('分期订单的超期费用请通过分期账单支付');
    }

    // 3. 状态校验：必须处于超时使用状态
    if (order.overdueStatus !== RentalOrderOverdueStatus.OVERDUE_USE) {
      throw new BadRequestException(
        `当前订单状态不允许支付超时使用费，仅超时使用状态可支付。当前逾期状态：${order.overdueStatus ?? 'none'}`,
      );
    }

    // 4. 使用状态校验：仅资产归还后可支付超时使用费
    if (!order.isReturned) {
      throw new BadRequestException('资产尚未归还，无法支付超时使用费');
    }

    // 5. 计算待付超期费
    const paidOverdueAmount = Number(order.overdueFeePaidAmount || 0);
    const amountToPay = new Decimal(order.payableOverdueUseAmount).minus(paidOverdueAmount).toNumber();

    // 5.1 全额优惠或已结清：直接更新状态，无需创建支付（避免死锁）
    if (amountToPay <= 0) {
      await this.dataSource.transaction(async manager => {
        await manager.update(
          RentalOrderEntity,
          { id: orderId },
          { overdueStatus: RentalOrderOverdueStatus.OVERDUE_FEE_PAID, isOverdue: false },
        );
      });
      return plainToInstance(OutputPayRentalOrderResultDto, { isPaid: true });
    }

    // 6. 超期费单价校验
    const overdueFee = order.rentalPlanSnapshot?.overdueFee ?? 0;
    if (!overdueFee || Number(overdueFee) <= 0) {
      throw new BadRequestException('该租赁方案未配置超期费用，无法支付');
    }

    const result = await this.paymentService.createOverdueFeePaymentRecord(userId, order, amountToPay, dto.provider);

    return plainToInstance(OutputPayRentalOrderResultDto, result);
  }
}
