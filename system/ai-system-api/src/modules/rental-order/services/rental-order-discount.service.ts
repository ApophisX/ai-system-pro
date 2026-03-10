import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, QueryDeepPartialEntity } from 'typeorm';
import { RentalOrderRepository } from '../repositories';
import { RentalOrderEntity } from '../entities';
import { RentalOrderStatus, RentalOrderPayStatus, RentalOrderOverdueStatus } from '../enums';
import { OutputRentalOrderDto, SetDiscountDto, SetPaymentDiscountDto, SetOverdueUseDiscountDto } from '../dto';
import { PaymentEntity } from '@/modules/base/payment/entities';
import { InstallmentStatus, PaymentType } from '@/modules/base/payment/enums';
import { RentalOrderSupportService } from './rental-order-support.service';
import Decimal from 'decimal.js';

/** 可设置优惠的账单状态（未支付或部分支付） */
const ALLOWED_PAYMENT_STATUSES = [
  InstallmentStatus.PENDING,
  InstallmentStatus.GENERATING,
  InstallmentStatus.DUE,
  InstallmentStatus.OVERDUE,
  InstallmentStatus.PARTIAL_PAID,
];

/**
 * 租赁订单优惠服务
 *
 * 订单待支付时，出租方可设置账单优惠金额。
 * - 分期租赁：优惠平摊到每期账单
 * - 一次性租赁：优惠应用于单笔账单
 * - 续租：优惠应用于续租账单（多笔时平摊）
 */
@Injectable()
export class RentalOrderDiscountService {
  private readonly logger = new Logger(RentalOrderDiscountService.name);

  constructor(
    private readonly orderRepo: RentalOrderRepository,
    private readonly dataSource: DataSource,
    private readonly support: RentalOrderSupportService,
  ) {}

  /**
   * 设置分期账单、续租账单优惠金额（单笔）
   *
   * 分期账单或续租账单待支付时，出租方可单独设置某一笔账单的优惠金额。
   * 优惠金额必须小于该账单金额（不能大于等于）。
   *
   * @param lessorId 出租方 ID
   * @param orderId 订单 ID
   * @param dto 含 paymentId 和 discountAmount
   * @returns 更新后的订单
   */
  async setPaymentDiscount(
    lessorId: string,
    orderId: string,
    dto: SetPaymentDiscountDto,
  ): Promise<OutputRentalOrderDto> {
    const order = await this.orderRepo.findById(orderId, {
      relations: { payments: true },
    });

    if (order.lessorId !== lessorId) {
      throw new ForbiddenException('无权操作该订单');
    }

    const payment = order.paymentList.find(p => p.id === dto.paymentId);
    if (!payment) {
      throw new NotFoundException('账单不存在或不属于该订单');
    }

    const isInstallmentOrRenewal =
      payment.paymentType === PaymentType.INSTALLMENT || payment.paymentType === PaymentType.RENEWAL;
    if (!isInstallmentOrRenewal) {
      throw new BadRequestException('仅支持分期账单或续租账单设置优惠');
    }

    if (!ALLOWED_PAYMENT_STATUSES.includes(payment.status)) {
      throw new BadRequestException('仅待支付状态可设置优惠，当前账单状态不允许');
    }

    const discountAmount = new Decimal(dto.discountAmount);
    const maxDiscount = new Decimal(payment.amount || 0);
    if (discountAmount.greaterThanOrEqualTo(maxDiscount)) {
      throw new BadRequestException(
        `优惠金额需小于当前待支付账单金额（${maxDiscount.toString()} 元），请重新输入优惠金额`,
      );
    }

    const updatedOrder = await this.dataSource.transaction(async manager => {
      await manager.update(PaymentEntity, { id: dto.paymentId }, { discountAmount: discountAmount.toString() });

      const targetIds = new Set([dto.paymentId]);
      const otherDiscount = order.paymentList
        .filter(p => !targetIds.has(p.id))
        .reduce((acc, p) => acc.plus(p.discountAmount || 0), new Decimal(0));
      const orderTotalDiscount = otherDiscount.plus(discountAmount);

      await manager.update(RentalOrderEntity, { id: orderId }, { discountAmount: orderTotalDiscount.toString() });

      const updated = await manager.findOne(RentalOrderEntity, {
        where: { id: orderId },
        relations: {
          payments: { paymentRecords: true, refundRecords: true },
          assetSnapshot: true,
          rentalPlanSnapshot: true,
          deposits: { deductions: true },
          lessor: { profile: true },
          lessee: { profile: true },
        },
      });
      if (!updated) {
        throw new NotFoundException('订单不存在');
      }
      return updated;
    });

    this.logger.log(
      `分期/续租账单优惠已设置: orderId=${orderId}, paymentId=${dto.paymentId}, discountAmount=${dto.discountAmount}`,
    );

    return this.support.toOutputRentalOrderDto(updatedOrder);
  }

  /**
   * 设置超期使用优惠金额
   *
   * 超期使用费用待支付时，出租方可设置超期使用费优惠金额。
   * 仅适用于：先付后用、非分期订单，且 overdueStatus = OVERDUE_USE。
   *
   * 业务规则：
   * - 优惠金额不能超过待付超期费（overdueUseAmount - overdueFeePaidAmount）
   * - 优惠金额可为 0（清除优惠）
   * - 订单状态必须为 RECEIVED（使用中或已归还待确认）
   *
   * @param lessorId 出租方 ID
   * @param orderId 订单 ID
   * @param dto 优惠金额
   * @returns 更新后的订单
   */
  async setOverdueUseDiscount(
    lessorId: string,
    orderId: string,
    dto: SetOverdueUseDiscountDto,
  ): Promise<OutputRentalOrderDto> {
    const order = await this.orderRepo.findById(orderId, {
      relations: {
        payments: true,
        rentalPlanSnapshot: true,
        assetSnapshot: true,
      },
    });

    // 1. 权限校验：必须是该订单的出租方
    if (order.lessorId !== lessorId) {
      throw new ForbiddenException('无权操作该订单');
    }

    // 2. 订单状态校验：必须为已收货（使用中或已归还待确认）
    if (order.status !== RentalOrderStatus.RECEIVED) {
      throw new BadRequestException(`仅使用中或已归还待确认的订单可设置超期使用优惠，当前订单状态：${order.status}`);
    }

    // 3. 逾期状态校验：必须处于超时使用状态（超期使用费用待支付）
    if (order.overdueStatus !== RentalOrderOverdueStatus.OVERDUE_USE) {
      throw new BadRequestException(
        `仅超时使用状态可设置超期使用优惠，当前逾期状态：${order.overdueStatus ?? 'none'}。逾期订单请通过分期账单优惠接口设置`,
      );
    }

    // 4. 订单类型校验：必须是先付后用、非分期（与 payOverdueUseFee 保持一致）
    if (order.isPostPayment) {
      throw new BadRequestException('先用后付订单的超期费用不在此接口设置优惠，请使用分期账单优惠接口');
    }
    if (order.isInstallment) {
      throw new BadRequestException('分期订单的超期费用请通过分期账单优惠接口设置');
    }

    // 5. 待付超期费校验：必须有待付金额
    const paidOverdueAmount = Number(order.overdueFeePaidAmount ?? 0);
    const maxDiscount = new Decimal(order.overdueUseAmount).minus(paidOverdueAmount);

    if (maxDiscount.lte(0)) {
      throw new BadRequestException('当前无待付超期使用费，无法设置优惠');
    }

    // 6. 超期费单价校验：租赁方案必须配置超期费
    const overdueFee = order.rentalPlanSnapshot?.overdueFee ?? 0;
    if (!overdueFee || Number(overdueFee) <= 0) {
      throw new BadRequestException('该租赁方案未配置超期费用，无法设置超期使用优惠');
    }

    // 7. 优惠金额校验：不能超过待付超期费
    const discountAmount = new Decimal(dto.discountAmount);
    if (discountAmount.greaterThan(maxDiscount)) {
      throw new BadRequestException(`优惠金额不能超过待付超期费（${maxDiscount.toFixed(2)} 元），请重新输入`);
    }

    // 8. 全额优惠时结清状态：仅当资产已归还（returnedAt 已设，计费已停止）时才可置为 OVERDUE_FEE_PAID
    //    若未归还即置为 OVERDUE_FEE_PAID，后续继续使用导致 overdueUseAmount 增长，调度器会跳过该状态，
    //    归还后也无法走支付入口（仅允许 OVERDUE_USE），形成漏收风险
    const amountToPayAfterDiscount = maxDiscount.minus(discountAmount);
    const isFullDiscount = amountToPayAfterDiscount.lte(0);
    const isBillingStopped = !!order.returnedAt;

    const updatedOrder = await this.dataSource.transaction(async manager => {
      const updateData: QueryDeepPartialEntity<RentalOrderEntity> = {
        overdueUseDiscountAmount: discountAmount.toString(),
        overdueUseDiscountRemark: dto.remark?.trim() ?? '',
      };
      if (isFullDiscount && isBillingStopped) {
        updateData.overdueStatus = RentalOrderOverdueStatus.OVERDUE_FEE_PAID;
        updateData.isOverdue = false;
      }
      await manager.update(RentalOrderEntity, { id: orderId }, updateData);

      const updated = await manager.findOne(RentalOrderEntity, {
        where: { id: orderId },
        relations: {
          payments: { paymentRecords: true, refundRecords: true },
          assetSnapshot: true,
          rentalPlanSnapshot: true,
          deposits: { deductions: true },
          lessor: { profile: true },
          lessee: { profile: true },
        },
      });
      if (!updated) {
        throw new NotFoundException('订单不存在');
      }
      return updated;
    });

    this.logger.log(
      `超期使用优惠已设置: orderId=${orderId}, discountAmount=${dto.discountAmount}, maxDiscount=${maxDiscount.toString()}${isFullDiscount && isBillingStopped ? ', 全额优惠已结清状态' : isFullDiscount && !isBillingStopped ? ', 全额优惠待归还后结清' : ''}`,
    );

    return this.support.toOutputRentalOrderDto(updatedOrder);
  }

  /**
   * 设置订单金额优惠（仅非分期订单）
   *
   * 非分期订单待支付时，出租方可设置整单优惠金额。
   * 分期订单请使用「设置分期账单、续租账单优惠」接口。
   *
   * @param lessorId 出租方 ID
   * @param orderId 订单 ID
   * @param dto 优惠金额
   * @returns 更新后的订单
   */
  async setOrderDiscount(lessorId: string, orderId: string, dto: SetDiscountDto): Promise<OutputRentalOrderDto> {
    return this.setOrderDiscountInternal(lessorId, orderId, { discountAmount: dto.discountAmount });
  }

  /**
   * 内部实现：设置非分期订单待支付账单的优惠金额
   *
   * 业务规则：
   * - 仅非分期订单
   * - 优惠金额必须小于待支付账单总金额（不能大于等于）
   * - 订单 discountAmount 为冗余字段，更新为所有账单优惠之和
   * - 首笔待支付时同步更新 order.totalAmount
   */
  private async setOrderDiscountInternal(
    lessorId: string,
    orderId: string,
    dto: { discountAmount: number },
  ): Promise<OutputRentalOrderDto> {
    const order = await this.orderRepo.findById(orderId, {
      relations: { payments: true },
    });

    if (order.lessorId !== lessorId) {
      throw new ForbiddenException('无权操作该订单');
    }

    if (order.isInstallment) {
      throw new BadRequestException('分期订单不支持订单金额优惠，请使用「设置分期账单、续租账单优惠」接口');
    }

    const targetPayments = this.resolveOrderDiscountTargetPayments(order);
    if (targetPayments.length === 0) {
      throw new BadRequestException('当前订单没有可设置优惠的待支付账单');
    }

    const discountAmount = new Decimal(dto.discountAmount);
    const maxDiscount = this.calculateMaxDiscount(targetPayments);
    if (discountAmount.greaterThanOrEqualTo(maxDiscount)) {
      throw new BadRequestException(
        `优惠金额需小于当前待支付账单金额（${maxDiscount.toString()} 元），请重新输入优惠金额`,
      );
    }

    const discountPerPayment = this.distributeDiscount(discountAmount, targetPayments);
    this.validateDiscountPerPayment(targetPayments, discountPerPayment);

    const updatedOrder = await this.dataSource.transaction(async manager => {
      for (let i = 0; i < targetPayments.length; i++) {
        const payment = targetPayments[i];
        const discount = discountPerPayment[i];
        await manager.update(
          PaymentEntity,
          { id: payment.id },
          {
            discountAmount: discount.toString(),
          },
        );
      }

      const totalDiscount = discountPerPayment.reduce((acc, d) => acc.plus(d), new Decimal(0));

      const targetIds = new Set(targetPayments.map(p => p.id));
      const otherDiscount = order.paymentList
        .filter(p => !targetIds.has(p.id))
        .reduce((acc, p) => acc.plus(p.discountAmount || 0), new Decimal(0));
      const orderTotalDiscount = otherDiscount.plus(totalDiscount);

      const isFirstPaymentPending =
        order.status === RentalOrderStatus.CREATED && order.payStatus === RentalOrderPayStatus.PENDING;

      const updateData: QueryDeepPartialEntity<RentalOrderEntity> = {
        discountAmount: orderTotalDiscount.toString(),
      };

      if (isFirstPaymentPending) {
        updateData.totalAmount = new Decimal(order.rentalAmount || 0)
          .plus(order.otherFee ?? 0)
          .plus(order.payableOverdueUseAmount ?? 0)
          .plus(order.depositAmount || 0)
          .minus(orderTotalDiscount)
          .toString();
      }

      await manager.update(RentalOrderEntity, { id: orderId }, updateData);

      const updated = await manager.findOne(RentalOrderEntity, {
        where: { id: orderId },
        relations: {
          payments: { paymentRecords: true, refundRecords: true },
          assetSnapshot: true,
          rentalPlanSnapshot: true,
          deposits: { deductions: true },
          lessor: { profile: true },
          lessee: { profile: true },
        },
      });
      if (!updated) {
        throw new NotFoundException('订单不存在');
      }
      return updated;
    });

    this.logger.log(
      `订单优惠已设置: orderId=${orderId}, discountAmount=${dto.discountAmount}, paymentsCount=${targetPayments.length}`,
    );

    return this.support.toOutputRentalOrderDto(updatedOrder);
  }

  /**
   * 解析非分期订单可设置优惠的待支付账单
   *
   * 仅非分期订单：首笔租金待支付（CREATED + PENDING）或续租待支付
   */
  private resolveOrderDiscountTargetPayments(order: RentalOrderEntity): PaymentEntity[] {
    const isFirstPaymentPending =
      order.status === RentalOrderStatus.CREATED && order.payStatus === RentalOrderPayStatus.PENDING;

    if (isFirstPaymentPending) {
      const rentalPayments = order.paymentList.filter(
        p =>
          (p.paymentType === PaymentType.RENTAL || p.paymentType === PaymentType.ORDER) &&
          ALLOWED_PAYMENT_STATUSES.includes(p.status),
      );
      return rentalPayments.sort((a, b) => a.periodIndex - b.periodIndex);
    }

    return order.renewalPaymentList
      .filter(p => ALLOWED_PAYMENT_STATUSES.includes(p.status))
      .sort((a, b) => a.periodIndex - b.periodIndex);
  }

  /**
   * 计算最大可设置优惠金额（待支付账单的 amount 总和）
   */
  private calculateMaxDiscount(payments: PaymentEntity[]): Decimal {
    return payments.reduce((acc, p) => {
      const amount = new Decimal(p.amount || 0);
      return acc.plus(amount);
    }, new Decimal(0));
  }

  /**
   * 分配优惠金额到各账单
   *
   * 分期/多笔：平摊，余数加在第 1 期，确保总和精确
   */
  private distributeDiscount(totalDiscount: Decimal, payments: PaymentEntity[]): Decimal[] {
    if (payments.length === 0) return [];
    if (payments.length === 1) return [totalDiscount];

    const n = payments.length;
    const basePerPeriod = totalDiscount.div(n).toDecimalPlaces(2, Decimal.ROUND_DOWN);
    const remainder = totalDiscount.minus(basePerPeriod.mul(n));
    const result: Decimal[] = [];
    for (let i = 0; i < n; i++) {
      result.push(i === 0 ? basePerPeriod.plus(remainder) : basePerPeriod);
    }
    return result;
  }

  /**
   * 校验每期优惠不超过该期账单金额
   */
  private validateDiscountPerPayment(payments: PaymentEntity[], discountPerPayment: Decimal[]): void {
    for (let i = 0; i < payments.length; i++) {
      const amount = new Decimal(payments[i].amount || 0);
      const discount = discountPerPayment[i];
      if (discount.greaterThan(amount)) {
        throw new BadRequestException(
          `第 ${i + 1} 期账单优惠金额（${discount.toString()} 元）不能超过账单金额（${amount.toString()} 元）`,
        );
      }
    }
  }
}
