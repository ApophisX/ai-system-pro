import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RentalOrderRepository } from '../repositories';
import { RentalOrderEntity } from '../entities';
import { RentalOrderStatus, RentalOrderUsageStatus } from '../enums';
import { RenewRentalOrderDto, RenewPreviewDto, OutputRentalOrderDto, OutputPayRentalOrderResultDto } from '../dto';
import { PaymentEntity } from '@/modules/base/payment/entities';
import { PaymentRepository } from '@/modules/base/payment/repositories';
import { InstallmentStatus, PaymentType } from '@/modules/base/payment/enums';
import { RentalOrderSupportService } from './rental-order-support.service';
import { PaymentService } from '@/modules/base/payment/services';
import { RentalOrderJobService } from '../jobs/services';
import { SequenceNumberPrefix, SequenceNumberService, SequenceNumberType } from '@/infrastructure/sequence-number';
import { computeRentalPeriodTime, computePaymentPeriodTime } from '../utils/rental-period-time.util';
import Decimal from 'decimal.js';
import dayjs from 'dayjs';
import { DEFAULT_RENEWAL_POLICY } from '@/common/constants/config.constant';

@Injectable()
export class RentalOrderRenewService {
  private readonly logger = new Logger(RentalOrderRenewService.name);

  constructor(
    private readonly orderRepo: RentalOrderRepository,
    private readonly paymentRepo: PaymentRepository,
    private readonly dataSource: DataSource,
    private readonly support: RentalOrderSupportService,
    private readonly rentalOrderJobService: RentalOrderJobService,
    private readonly sequenceNumberService: SequenceNumberService,
    private readonly paymentService: PaymentService,
  ) {}

  /**
   * 发起续租申请
   * 校验通过后创建续租支付账单，返回订单（含待支付账单）
   */
  async renewOrder(userId: string, orderId: string, dto: RenewRentalOrderDto): Promise<OutputRentalOrderDto> {
    const { outputOrder, timeoutPayload } = await this.dataSource.transaction(async manager => {
      const order = await manager.findOne(RentalOrderEntity, {
        where: { id: orderId },
        relations: { payments: true, rentalPlanSnapshot: true, assetSnapshot: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!order) {
        throw new NotFoundException('订单不存在');
      }

      // 事务内校验，避免并发请求下生成重复续租账单
      this.validateRenewOrder(userId, order, dto.duration);

      const renewalAmount = this.calculateRenewalAmount(order, dto.duration);
      const platformFee = this.support.calculatePlatformFee(
        renewalAmount,
        Number(order.rentalPlanSnapshot?.platformServiceRate || 0),
      );
      const totalAmount = new Decimal(renewalAmount).add(platformFee).toNumber();

      const paymentNo = await this.sequenceNumberService.generate({
        businessType: SequenceNumberType.PAYMENT,
        prefix: SequenceNumberPrefix.PAYMENT,
      });

      const maxPeriodIndex = Math.max(...order.renewalPaymentList.map(p => p.periodIndex), 0);
      const nextPeriodIndex = maxPeriodIndex + 1;

      const rentalPlan = order.rentalPlanJson;
      if (!rentalPlan?.rentalType) {
        throw new BadRequestException('订单租赁方案信息缺失');
      }

      const currentEndDate = order.endDate ? dayjs(order.endDate) : dayjs();
      const {
        startDate: renewalStartDate,
        endDate: newEndDate,
        periodDuration,
        periodUnit,
      } = computeRentalPeriodTime(currentEndDate.toDate(), dto.duration, 1, rentalPlan.rentalType);

      // 续租账单时间：从原 endDate 开始，到 newEndDate 结束
      // 使用 periodIndex=1 + startDate=renewalStartDate 来正确计算（续租只有 1 期）
      const isPostPayment = order.assetSnapshot?.isPostPayment ?? false;
      const { startTime, endTime, payableTime } = computePaymentPeriodTime(
        1, // 续租视为独立 1 期
        renewalStartDate,
        periodDuration,
        periodUnit,
        newEndDate,
        isPostPayment,
        order.isInstallment,
      );
      const paymentExpireAt = dayjs().add(30, 'minute').toDate();

      // 创建续租支付账单
      const payment = manager.getRepository(PaymentEntity).create({
        paymentNo,
        orderId: order.id,
        orderNo: order.orderNo,
        userId: order.lesseeId,
        lessorId: order.lessorId,
        paymentType: PaymentType.RENEWAL,
        periodIndex: nextPeriodIndex,
        rentalPeriod: 1,
        rentalAmount: renewalAmount.toString(),
        amount: totalAmount.toString(),
        startTime,
        endTime,
        paymentExpireAt,
        payableTime,
        overdueFee: order.rentalPlanSnapshot?.overdueFee ?? '0',
        overdueFeeUnit: order.rentalPlanSnapshot?.overdueFeeUnit ?? 'day',
        isInstallment: order.isInstallment,
        status: InstallmentStatus.PENDING,
        renewalInfo: {
          duration: dto.duration,
          userRemark: dto.userRemark,
        },
      });

      const savedPayment = await manager.save(PaymentEntity, payment);
      const currentTimeoutPayload = {
        paymentId: savedPayment.id,
        orderId: order.id,
        orderNo: order.orderNo,
        expiredAt: paymentExpireAt,
      };

      this.logger.log(
        `续租申请成功: orderNo=${order.orderNo}, orderId=${orderId}, paymentNo=${paymentNo}, renewalAmount=${renewalAmount}`,
      );

      const updatedOrder = await manager.findOne(RentalOrderEntity, {
        where: { id: orderId },
        relations: { payments: true, deposits: true, assetSnapshot: true, rentalPlanSnapshot: true },
      });
      if (!updatedOrder) throw new NotFoundException('订单不存在');
      return {
        outputOrder: this.support.toOutputRentalOrderDto(updatedOrder),
        timeoutPayload: currentTimeoutPayload,
      };
    });

    if (timeoutPayload) {
      this.rentalOrderJobService
        .addRenewalPaymentTimeoutJob(
          timeoutPayload.paymentId,
          timeoutPayload.orderId,
          timeoutPayload.orderNo,
          timeoutPayload.expiredAt,
        )
        .catch(error => {
          this.logger.error(
            `添加续租支付超时任务失败: paymentId=${timeoutPayload.paymentId}, orderId=${timeoutPayload.orderId}`,
            error instanceof Error ? error.stack : String(error),
          );
        });
    }

    return outputOrder;
  }

  /**
   * 续租预计算
   */
  async renewPreview(userId: string, orderId: string, duration: number): Promise<RenewPreviewDto> {
    const order = await this.orderRepo.findById(orderId, {
      relations: { payments: true, rentalPlanSnapshot: true, assetSnapshot: true },
    });

    const validation = this.validateRenewOrderForPreview(userId, order, duration);
    if (!validation.canRenew) {
      return {
        canRenew: false,
        renewalAmount: 0,
        platformFee: 0,
        totalAmount: 0,
        newEndDate: '',
        renewalCountAfter: order.renewalCount ?? 0,
        message: validation.message,
      };
    }

    const renewalAmount = this.calculateRenewalAmount(order, duration);
    const platformFee = this.support.calculatePlatformFee(
      renewalAmount,
      Number(order.rentalPlanSnapshot?.platformServiceRate || 0),
    );
    const totalAmount = new Decimal(renewalAmount).add(platformFee).toNumber();

    const rentalPlan = order.rentalPlanJson;
    const currentEndDate = order.endDate ? dayjs(order.endDate) : dayjs();
    const { endDate } = computeRentalPeriodTime(currentEndDate.toDate(), duration, 1, rentalPlan?.rentalType);

    return {
      canRenew: true,
      renewalAmount,
      platformFee,
      totalAmount,
      newEndDate: endDate.format('YYYY-MM-DD HH:mm:ss'),
      renewalCountAfter: (order.renewalCount ?? 0) + 1,
      message: undefined,
    };
  }

  /**
   * 续租支付成功后的处理（由 PaymentEventListener 调用）
   */
  async onRenewalPaymentCompleted(
    orderId: string,
    renewalRentalAmount: number,
    renewalDuration: number,
    newEndDate: Date,
  ): Promise<void> {
    await this.dataSource.transaction(async manager => {
      const order = await manager.findOne(RentalOrderEntity, {
        where: { id: orderId },
        relations: { payments: true, rentalPlanSnapshot: true },
      });
      if (!order) {
        this.logger.error(`续租支付完成：订单不存在 orderId=${orderId}`);
        return;
      }

      const currentRentalAmount = new Decimal(order.rentalAmount);
      const newRentalAmount = currentRentalAmount.plus(renewalRentalAmount).toFixed(2);

      const currentDuration = order.duration;
      const newDuration = order.isInstallment ? currentDuration : currentDuration + renewalDuration;

      const currentPlatformFee = new Decimal(order.platformFee);
      const renewalPlatformFee = new Decimal(renewalRentalAmount)
        .mul(Number(order.rentalPlanSnapshot?.platformServiceRate || 0))
        .div(100);
      const newPlatformFee = currentPlatformFee.plus(renewalPlatformFee).toFixed(2);

      const renewalCount = (order.renewalCount ?? 0) + 1;

      // 续租支付成功后，若订单为待归还（WAIT_RETURN），说明租期已到期、用户选择续租并支付，
      // 租期延长后应恢复为使用中（IN_USE），承租方继续使用资产
      await manager.update(
        RentalOrderEntity,
        { id: orderId },
        {
          endDate: newEndDate,
          duration: newDuration,
          rentalAmount: newRentalAmount,
          platformFee: newPlatformFee,
          isRenewal: true,
          renewalCount,
          ...(order.useageStatus === RentalOrderUsageStatus.WAIT_RETURN && {
            useageStatus: RentalOrderUsageStatus.IN_USE,
          }),
        },
      );

      this.logger.log(
        `续租支付完成：订单已扩展 orderNo=${order.orderNo}, newEndDate=${newEndDate.toISOString()}, renewalCount=${renewalCount}` +
          (order.useageStatus === RentalOrderUsageStatus.WAIT_RETURN ? ', useageStatus: WAIT_RETURN → IN_USE' : ''),
      );
    });

    const orderForJob = await this.orderRepo.findById(orderId);
    if (orderForJob) {
      setImmediate(() => {
        this.rentalOrderJobService.cancelRentalOverdueJob(orderId);
        this.rentalOrderJobService.addRentalOverdueJob(orderId, orderForJob.orderNo, newEndDate);
      });
    }
  }

  private validateRenewOrder(userId: string, order: RentalOrderEntity, duration: number): void {
    const preview = this.validateRenewOrderForPreview(userId, order, duration);
    if (!preview.canRenew) {
      throw new BadRequestException(preview.message || '不支持续租');
    }

    const cancelableRenewalPaymentStatuses = [
      InstallmentStatus.PENDING,
      InstallmentStatus.DUE,
      InstallmentStatus.GENERATING,
    ];
    const pendingRenewalPayment = order.renewalPaymentList?.find(
      p => this.isRenewalPayment(order, p) && !p.isPaid && cancelableRenewalPaymentStatuses.includes(p.status),
    );
    if (pendingRenewalPayment) {
      throw new BadRequestException('存在未支付的续租账单，请先完成支付或等待超时关闭后再申请');
    }
  }

  /**
   * 校验续租订单
   * @param userId 用户ID
   * @param order
   * @param duration
   * @returns
   */
  private validateRenewOrderForPreview(
    userId: string,
    order: RentalOrderEntity,
    duration: number,
  ): { canRenew: boolean; message?: string } {
    if (!order.isInstallment && order.isPostPayment) {
      return { canRenew: false, message: '后付短租订单不允许续租' };
    }

    if (order.isInstallment) {
      const allPaid = order.rentalPaymentList.every(p => p.isPaid);
      if (!allPaid) {
        return { canRenew: false, message: '分期订单未支付完成，不允许续租' };
      }
    }

    if (order.lesseeId !== userId) {
      return { canRenew: false, message: '仅承租方可发起续租' };
    }

    if (order.status !== RentalOrderStatus.RECEIVED) {
      return { canRenew: false, message: '仅已收货的订单可续租' };
    }

    if (order.useageStatus === RentalOrderUsageStatus.RETURNED_PENDING) {
      return { canRenew: false, message: '已申请归还的订单不允许续租' };
    }

    if (![RentalOrderUsageStatus.IN_USE, RentalOrderUsageStatus.WAIT_RETURN].includes(order.useageStatus)) {
      return { canRenew: false, message: '仅使用中的订单可续租' };
    }

    const blockedStatuses = [
      RentalOrderStatus.CREATED,
      RentalOrderStatus.PENDING_RECEIPT,
      RentalOrderStatus.CANCEL_PENDING,
      RentalOrderStatus.CANCELED,
      RentalOrderStatus.COMPLETED,
      RentalOrderStatus.CLOSED,
      RentalOrderStatus.DISPUTE,
    ];
    if (blockedStatuses.includes(order.status)) {
      return { canRenew: false, message: '订单状态不允许续租' };
    }

    // 逾期费结清判断：应付 = payableOverdueUseAmount，已结清 = overdueFeePaidAmount >= 应付
    const overduePaid = new Decimal(order.overdueFeePaidAmount || 0);
    const overduePayable = new Decimal(order.payableOverdueUseAmount);
    if (order.isOverdue && overduePaid.lt(overduePayable)) {
      return { canRenew: false, message: '请先付清逾期费后再续租' };
    }

    // 续租规则校验
    const policy = order.rentalPlanSnapshot?.renewalPolicy ?? DEFAULT_RENEWAL_POLICY;
    if (!policy.allowRenewal) {
      return { canRenew: false, message: '该租赁方案不允许续租' };
    }

    const maxTimes = policy.maxRenewalTimes ?? 0;
    if (maxTimes > 0 && (order.renewalCount ?? 0) >= maxTimes) {
      return { canRenew: false, message: `已达最大续租次数（${maxTimes}）` };
    }

    if (policy.minDuration !== undefined && duration < policy.minDuration) {
      return { canRenew: false, message: `续租时长不能少于 ${policy.minDuration}` };
    }
    if (policy.maxDuration !== undefined && policy.maxDuration > 0 && duration > policy.maxDuration) {
      return { canRenew: false, message: `续租时长不能超过 ${policy.maxDuration}` };
    }

    const now = dayjs();
    const endDate = order.endDate ? dayjs(order.endDate) : null;
    if (endDate && policy.applyBeforeEndMinutes !== undefined) {
      const windowStart = endDate.subtract(policy.applyBeforeEndMinutes, 'minute');
      if (now.isBefore(windowStart)) {
        return { canRenew: false, message: `请在到期前 ${policy.applyBeforeEndMinutes} 分钟内申请续租` };
      }
      if (now.isAfter(endDate) || now.isSame(endDate)) {
        if (order.isOverdue && overduePaid.lt(overduePayable)) {
          return { canRenew: false, message: '已逾期，请先付清逾期费' };
        }
      }
    }

    return { canRenew: true };
  }

  /**
   * 支付续租账单
   */
  async payRenewal(
    userId: string,
    orderId: string,
    dto: { paymentId: string; provider: import('@/modules/base/payment/enums').PaymentProvider },
  ): Promise<OutputPayRentalOrderResultDto> {
    const order = await this.orderRepo.findById(orderId, {
      where: { lesseeId: userId },
      relations: { payments: true, assetSnapshot: true, rentalPlanSnapshot: true },
    });

    const payment = order.renewalPaymentList.find(p => p.id === dto.paymentId);
    if (!payment) {
      throw new NotFoundException('续租账单不存在或不属于该订单');
    }

    const isRenewalPayment = this.isRenewalPayment(order, payment);
    if (!isRenewalPayment) {
      throw new BadRequestException('该账单不是续租账单');
    }

    const durationToValidate = payment.renewalInfo?.duration ?? 1;
    const validation = this.validateRenewOrderForPreview(userId, order, durationToValidate);
    if (!validation.canRenew) {
      throw new BadRequestException(validation.message || '订单当前状态不允许支付续租账单');
    }

    if (payment.isPaid) {
      throw new BadRequestException('该续租账单已支付');
    }

    if (![InstallmentStatus.PENDING, InstallmentStatus.DUE, InstallmentStatus.OVERDUE].includes(payment.status)) {
      throw new BadRequestException(`续租账单状态不允许支付，当前状态：${payment.status}`);
    }

    return this.paymentService.createRenewalPaymentRecord(userId, order, payment, dto.provider);
  }

  /**
   *  续租金额计算逻辑：
   * @param order
   * @param duration
   * @returns
   */
  private calculateRenewalAmount(order: RentalOrderEntity, duration: number): number {
    const policy = order.rentalPlanSnapshot?.renewalPolicy ?? DEFAULT_RENEWAL_POLICY;
    const discount = policy.renewalDiscount ?? 0;
    const price = Number(order.rentalPlanSnapshot?.price ?? 0);
    const baseAmount = new Decimal(price).mul(duration);
    return baseAmount.mul(1 - discount).toNumber();
  }

  /**
   * 兼容历史数据：
   * - 新数据优先使用 paymentType=renewal 判断
   * - 老数据（无 paymentType）回退 periodIndex 规则
   */
  private isRenewalPayment(order: RentalOrderEntity, payment: PaymentEntity): boolean {
    if (payment.paymentType === PaymentType.RENEWAL) {
      return true;
    }
    if (payment.paymentType) {
      return false;
    }
    return order.isInstallment ? payment.periodIndex > (order.rentalPeriod ?? 1) : payment.periodIndex > 1;
  }
}
