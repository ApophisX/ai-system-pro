import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RentalOrderRepository } from '../repositories';
import { RentalOrderEntity } from '../entities/rental-order.entity';
import { RentalOrderAssetSnapshotEntity } from '../entities/rental-order-asset.entity';
import { RentalOrderAssetRentalPlanSnapshotEntity } from '../entities/rental-order-asset-rental-plan.entity';
import { RentalOrderStatus, RentalOrderRefundStatus, DepositStatus, RentalOrderPayStatus } from '../enums';
import { CreateRentalOrderDto, OutputRentalOrderDto } from '../dto';
import { plainToInstance } from 'class-transformer';
import { AssetRepository, AssetRentalPlanRepository, AssetInventoryRepository } from '@/modules/asset/repositories';
import { OutputAssetRentalPlanDto } from '@/modules/asset/dto';
import Decimal from 'decimal.js';
import { SequenceNumberPrefix, SequenceNumberService, SequenceNumberType } from '@/infrastructure/sequence-number';
import { ContactEntity } from '@/modules/contact/entities';
import { OutputContactDto } from '@/modules/contact/dto';
import { PaymentEntity } from '@/modules/base/payment/entities';
import { PaymentRepository } from '@/modules/base/payment/repositories';
import { computeRentalPeriodTime, computePaymentPeriodTime } from '../utils/rental-period-time.util';
import { InstallmentStatus, PaymentType } from '@/modules/base/payment/enums';
import dayjs from 'dayjs';
import { RentalOrderJobService } from '../jobs/services';
import { RentalOrderSupportService } from './rental-order-support.service';
import { MessageNotificationService } from '@/modules/base/message/services';
import { CreditRiskDecisionService } from '@/modules/credit/services/credit-risk-decision.service';
import { CreditActorRole } from '@/modules/credit/enums';
import { AssetInventoryStatus } from '@/modules/asset/enums';
import { UserService } from '@/modules/base/user/services';

/**
 * 租赁订单创建服务
 */
@Injectable()
export class RentalOrderCreateService {
  private readonly logger = new Logger(RentalOrderCreateService.name);

  constructor(
    private readonly orderRepo: RentalOrderRepository,
    private readonly assetRepo: AssetRepository,
    private readonly rentalPlanRepo: AssetRentalPlanRepository,
    private readonly assetInventoryRepo: AssetInventoryRepository,
    private readonly paymentRepo: PaymentRepository,
    private readonly dataSource: DataSource,
    private readonly sequenceNumberService: SequenceNumberService,
    private readonly rentalOrderJobService: RentalOrderJobService,
    private readonly support: RentalOrderSupportService,
    private readonly messageNotificationService: MessageNotificationService,
    private readonly creditRiskDecisionService: CreditRiskDecisionService,
    private readonly userService: UserService,
  ) {
    //
  }
  /**
   * 创建租赁订单
   * @param userId 用户 ID
   * @param dto 创建租赁订单请求 DTO
   * @returns 创建租赁订单结果
   */
  async createOrder(userId: string, dto: CreateRentalOrderDto): Promise<OutputRentalOrderDto> {
    const { startAt, inventoryCode, ...createOrderDto } = dto;
    const asset = await this.assetRepo.findByIdWithRelations(createOrderDto.assetId);
    // if (asset.ownerId === userId) {
    //   throw new BadRequestException(asset.isMallProduct ? '不能购买自己的商品' : '不能租赁自己的资产');
    // }

    if (!asset.owner.isEnterpriseVerified) {
      throw new BadRequestException('该商品暂不支持下单');
    }

    const rentalPlan = await this.rentalPlanRepo.findById(createOrderDto.rentalPlanId, {
      where: { assetId: asset.id },
    });

    if (!asset.isMallProduct) {
      // 实名认证校验
      if (asset.requireRealName) {
        const isRealNameVerified = await this.userService.isRealNameVerified(userId);
        if (!isRealNameVerified) {
          throw new BadRequestException('用户未实名认证，无法租赁资产');
        }
      }
      // 风控：信用冻结不允许下单
      const isCreditFrozen = await this.creditRiskDecisionService.isCreditFrozen(userId, CreditActorRole.LESSEE);
      if (isCreditFrozen) {
        throw new BadRequestException('当前信用状态不允许下单，请联系客服');
      }
    }

    // 风控：分期规则校验
    const planIsInstallment = rentalPlan.isInstallment ?? false;
    if (planIsInstallment) {
      const installmentAllowed = await this.creditRiskDecisionService.isInstallmentAllowed(userId);
      if (!installmentAllowed) {
        throw new BadRequestException('当前信用等级不支持分期支付');
      }
    }

    // 预绑定资产实例编号校验：若用户传入 inventoryCode，则校验实例存在且可用，支付完成后自动绑定
    const trimmedInventoryCode = inventoryCode?.trim();
    if (trimmedInventoryCode) {
      const inventory = await this.assetInventoryRepo.findByAssetIdAndInstanceCode(asset.id, trimmedInventoryCode);
      if (!inventory) {
        throw new BadRequestException('所选资产实例不存在或不属于该资产，请核对实例编号');
      }
      if (inventory.status !== AssetInventoryStatus.AVAILABLE) {
        throw new BadRequestException('所选资产实例当前不可用，请选择其他实例或联系出租方');
      }
      // 实例归属校验：须属于资产所有者（出租方）
      const instanceLessorId = inventory.lessorId ?? asset.ownerId;
      if (instanceLessorId !== asset.ownerId) {
        throw new BadRequestException('所选资产实例不属于该资产，请核对实例编号');
      }
    }

    const { id: _assetId, ...assetDataWithoutId } = asset;
    const { id: _planId, ...rentalPlanDataWithoutId } = rentalPlan;

    const now = dayjs();
    const { duration } = createOrderDto;

    const { startDate, endDate, periodDuration, periodUnit } = computeRentalPeriodTime(
      dayjs(startAt).toDate(),
      duration,
      rentalPlan.rentalPeriod,
      rentalPlan.rentalType,
    );

    const rentalAmount = this.support.calculateRentalAmount(rentalPlan, duration);
    const assetDepositAmount = new Decimal(Number(rentalPlan.deposit) || Number(asset.deposit) || 0).toNumber();
    // 风控：根据承租方信用决定实际押金（免押/按比例）
    const depositAmount = await this.creditRiskDecisionService.getActualDepositAmount(assetDepositAmount, userId);
    const platformFee = this.support.calculatePlatformFee(rentalAmount, Number(rentalPlan.platformServiceRate));
    const deliveryFee = createOrderDto.needDelivery ? new Decimal(asset.deliveryFee || 0).toNumber() : 0;
    const otherAmount = new Decimal(platformFee).add(deliveryFee);
    const totalAmount = new Decimal(rentalAmount).add(otherAmount).add(depositAmount).toNumber();

    const orderNo = await this.sequenceNumberService.generate({
      businessType: SequenceNumberType.ORDER,
      prefix: SequenceNumberPrefix.ORDER,
    });

    const result = await this.dataSource.transaction(async manager => {
      // 创建订单
      const order = this.orderRepo.create({
        ...createOrderDto,
        isProductPurchase: asset.isMallProduct || false,
        orderNo,
        inventoryCode: trimmedInventoryCode || undefined,
        status: RentalOrderStatus.CREATED,
        payStatus: RentalOrderPayStatus.PENDING, // 订单创建时，支付状态为待支付
        refundStatus: RentalOrderRefundStatus.NONE,
        lesseeId: userId,
        lessorId: asset.ownerId,
        assetId: asset.id,
        rentalPlanId: rentalPlan.id,
        rentalAmount: rentalAmount.toString(),
        depositAmount: depositAmount.toString(),
        platformFee: platformFee.toString(),
        totalAmount: totalAmount.toString(),
        paymentExpiredAt: now.add(30, 'minute').toDate(),
        isInstallment: rentalPlan.isInstallment,
        rentalPeriod: rentalPlan.rentalPeriod,
        depositStatus: depositAmount > 0 ? DepositStatus.PENDING : DepositStatus.NONE,
        rentalPlanJson: plainToInstance(OutputAssetRentalPlanDto, rentalPlan, {
          excludeExtraneousValues: true,
          exposeDefaultValues: true,
        }),
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
      });

      // 创建联系人信息，需要邮寄
      if (createOrderDto.needDelivery) {
        const contact = await manager.findOne(ContactEntity, {
          where: { id: createOrderDto.contactId, userId },
        });
        if (!contact) {
          throw new BadRequestException('联系人不存在');
        }
        const { contactName, contactPhone, addressName, address } = contact;
        order.contactSnapshot = plainToInstance(OutputContactDto, contact, {
          excludeExtraneousValues: true,
          exposeDefaultValues: true,
        });
        order.contactName = createOrderDto.contactName || contactName;
        order.contactPhone = createOrderDto.contactPhone || contactPhone;
        order.contactAddressName = addressName || address || '';
      }

      // 保存订单
      const savedOrder = await manager.save(RentalOrderEntity, order);

      // 创建支付账单
      const isPostPayment = asset.isPostPayment ?? false;
      const payments: PaymentEntity[] = [];
      for (let i = 0; i < rentalPlan.rentalPeriod; i++) {
        const periodIndex = i + 1;
        const { startTime, endTime, payableTime } = computePaymentPeriodTime(
          periodIndex,
          startDate,
          periodDuration,
          periodUnit,
          endDate,
          isPostPayment,
          rentalPlan.isInstallment,
        );
        const paymentNo = await this.sequenceNumberService.generate({
          businessType: SequenceNumberType.PAYMENT,
          prefix: SequenceNumberPrefix.PAYMENT,
        });

        const paymentAmount = order.isInstallment
          ? Number(rentalPlan.price)
          : new Decimal(rentalPlan.price).mul(duration).toNumber();

        const payment = this.paymentRepo.create({
          periodIndex,
          paymentNo,
          paymentType: order.isInstallment ? PaymentType.INSTALLMENT : PaymentType.RENTAL,
          isProductPurchase: savedOrder.isProductPurchase,
          isInstallment: savedOrder.isInstallment,
          isPostPayment: savedOrder.isPostPayment,
          orderId: savedOrder.id,
          orderNo: savedOrder.orderNo,
          userId,
          installmentPlanId: rentalPlan.id,
          rentalPeriod: rentalPlan.rentalPeriod,
          amount: (i === 0 ? otherAmount.add(paymentAmount).toNumber() : paymentAmount).toString(),
          rentalAmount: paymentAmount.toString(),
          startTime,
          endTime,
          payableTime,
          overdueFee: rentalPlan.overdueFee,
          overdueFeeUnit: rentalPlan.overdueFeeUnit,
          lessorId: asset.ownerId,
          status: i === 0 ? InstallmentStatus.PENDING : InstallmentStatus.GENERATING,
        });
        payments.push(payment);
      }
      await manager.save(PaymentEntity, payments);

      // 创建资产快照
      const assetSnapshot = manager.create(RentalOrderAssetSnapshotEntity, {
        ...assetDataWithoutId,
        order: savedOrder,
        orderId: savedOrder.id,
        orderNo: savedOrder.orderNo,
        assetId: asset.id,
      });
      await manager.save(RentalOrderAssetSnapshotEntity, assetSnapshot);

      // 创建租赁方案快照
      const planSnapshot = manager.create(RentalOrderAssetRentalPlanSnapshotEntity, {
        ...rentalPlanDataWithoutId,
        order: savedOrder,
        orderId: savedOrder.id,
        orderNo: savedOrder.orderNo,
      });
      await manager.save(RentalOrderAssetRentalPlanSnapshotEntity, planSnapshot);

      this.logger.log(`租赁订单创建成功: orderNo=${orderNo}, userId=${userId}, amount=${totalAmount}`);

      return this.support.toOutputRentalOrderDto(savedOrder);
    });

    await this.rentalOrderJobService.addPaymentTimeoutJob(result.id, result.orderNo, result.paymentExpiredAt);

    // 发送订单创建消息通知出租方
    const orderWithRelations = await this.orderRepo.findById(result.id);
    if (orderWithRelations) {
      await this.messageNotificationService.notifyOrderCreated(orderWithRelations);
    }

    return result;
  }
}
