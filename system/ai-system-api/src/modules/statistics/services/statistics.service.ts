import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Brackets, DataSource, FindOptionsWhere, In, Not } from 'typeorm';
import { RentalOrderRepository } from '@/modules/rental-order/repositories';
import { DepositRepository } from '@/modules/rental-order/repositories/deposit.repository';
import { FavoriteService } from '@/modules/favorite/services';
import {
  RentalOrderUsageStatus,
  RentalOrderStatus,
  RentalOrderOverdueStatus,
  InUseUsageStatuses,
} from '@/modules/rental-order/enums';
import { DepositStatus, DepositDeductionStatus } from '@/modules/rental-order/enums';
import {
  OutputLesseeStatisticsDto,
  OutputLesseeOrderStatisticsDto,
  OutputLessorStatisticsDto,
  OutputLessorPendingOrderStatisticsDto,
  OutputLessorFinanceStatisticsDto,
  OutputLessorOrderStatisticsDto,
} from '../dto';
import { AssetRepository } from '@/modules/asset/repositories';
import { PaymentRepository, RefundRecordRepository } from '@/modules/base/payment/repositories';
import { PaymentEntity } from '@/modules/base/payment/entities';
import { AssetStatus, AssetAuditStatus } from '@/modules/asset/enums';
import { InstallmentStatus } from '@/modules/base/payment/enums';
import { DepositDeductionEntity, RentalOrderEntity } from '@/modules/rental-order/entities';
import { FinanceRepository } from '@/modules/finance/repositories/finance.repository';
import Decimal from 'decimal.js';
import dayjs from 'dayjs';
import { QueryLessorFinanceStatisticsDto } from '../dto';

/**
 * 统计服务
 *
 * 提供各种统计数据的查询服务
 */
@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(
    private readonly rentalOrderRepo: RentalOrderRepository,
    private readonly depositRepo: DepositRepository,
    private readonly favoriteService: FavoriteService,
    private readonly assetRepo: AssetRepository,
    private readonly paymentRepo: PaymentRepository,
    private readonly refundRecordRepo: RefundRecordRepository,
    private readonly financeRepo: FinanceRepository,
    private readonly dataSource: DataSource,
  ) {
    //
  }

  /**
   * @name 获取承租方统计数据
   * @description
   * 用于"我的"页面展示承租方相关统计信息：
   * - 订单总数
   * - 待支付订单数量
   * - 押金总金额（已冻结和部分扣除的押金）
   * - 收藏的资产数量
   */
  async getLesseeStatistics(userId: string): Promise<OutputLesseeStatisticsDto> {
    // 1. 查询订单总数（承租方的所有订单）
    const [, totalOrderCount] = await this.rentalOrderRepo.findByLesseeId(userId);

    // 2. 查询待支付订单数量（订单状态为CREATED或支付状态为PENDING）
    const [, pendingOrderCount] = await this.rentalOrderRepo.findMany({
      lesseeId: userId,
      status: RentalOrderStatus.CREATED,
    });

    // 3. 查询押金总金额（统计已冻结和部分扣除状态的押金）
    const [deposits] = await this.depositRepo.findMany({
      userId,
      status: In([DepositStatus.FROZEN, DepositStatus.PARTIAL_DEDUCTED, DepositStatus.PAID]),
    });

    // 计算押金总金额（已冻结押金 + 部分扣除押金的剩余金额）
    let totalDepositAmount = new Decimal(0);
    deposits?.forEach(deposit => {
      if ([DepositStatus.FROZEN, DepositStatus.PAID].includes(deposit.status)) {
        // 已冻结的押金，统计总金额
        totalDepositAmount = totalDepositAmount.plus(deposit.amount);
      } else if (deposit.status === DepositStatus.PARTIAL_DEDUCTED) {
        // 部分扣除的押金，统计剩余金额
        totalDepositAmount = totalDepositAmount.plus(deposit.remainingAmount);
      }
    });

    // 4. 查询收藏数量
    const favoriteCount = await this.favoriteService.getCount(userId);

    // 5. 查询待收货订单数量
    const [, paidPendingReceiveOrderCount] = await this.rentalOrderRepo.findMany({
      lesseeId: userId,
      status: RentalOrderStatus.PENDING_RECEIPT,
    });

    return {
      orderCount: totalOrderCount,
      pendingPaymentOrderCount: pendingOrderCount,
      totalDepositAmount: totalDepositAmount.toNumber(),
      favoriteAssetCount: favoriteCount,
      paidPendingReceiveOrderCount: paidPendingReceiveOrderCount,
    };
  }

  /**
   * @name 获取承租方订单统计数量
   * @description
   *
   * 统计各个状态的订单数量：
   * - 待支付订单数量（CREATED 或 PAYMENT_TIMEOUT 且支付状态为 PENDING）
   * - 使用中（IN_USE）
   * - 已逾期（overdueStatus=OVERDUE/OVERDUE_USE，不含 OVERDUE_FEE_PAID 因超时费已付清）
   * - 已完成（COMPLETED）
   * - 售后中（争议中）（DISPUTE）
   */
  async getLesseeOrderStatistics(
    userId: string,
    role: 'lessee' | 'lessor' = 'lessee',
  ): Promise<OutputLesseeOrderStatisticsDto> {
    const where: FindOptionsWhere<RentalOrderEntity> = {};
    if (role === 'lessee') {
      where.lesseeId = userId;
    } else {
      where.lessorId = userId;
    }

    // 1. 待支付订单数量：CREATED 或 PAYMENT_TIMEOUT 且支付状态为 PENDING
    const pendingPaymentCount = await this.rentalOrderRepo.count({
      where: {
        ...where,
        status: RentalOrderStatus.CREATED,
      },
    });

    // 2. 已支付待收货订单数量
    const paidPendingReceiveOrderCount = await this.rentalOrderRepo.count({
      where: {
        ...where,
        status: RentalOrderStatus.PENDING_RECEIPT,
        useageStatus: RentalOrderUsageStatus.NONE,
      },
    });

    // 3. 进行中的订单数量
    const inUseCount = await this.rentalOrderRepo.count({
      where: {
        ...where,
        status: Not(RentalOrderStatus.COMPLETED),
        useageStatus: Not(RentalOrderUsageStatus.NONE),
        overdueStatus: Not(In([RentalOrderOverdueStatus.OVERDUE_USE, RentalOrderOverdueStatus.OVERDUE])),
      },
    });

    // 4. 已逾期订单数量（useageStatus=IN_USE 且 overdueStatus=OVERDUE/OVERDUE_USE，不含 OVERDUE_FEE_PAID）
    const overdueCount = await this.rentalOrderRepo.count({
      where: {
        ...where,
        status: RentalOrderStatus.RECEIVED,
        useageStatus: Not(In([RentalOrderUsageStatus.NONE, RentalOrderUsageStatus.REJECTED])),
        overdueStatus: In([RentalOrderOverdueStatus.OVERDUE, RentalOrderOverdueStatus.OVERDUE_USE]),
      },
    });

    // 5. 已完成订单数量
    const completedCount = await this.rentalOrderRepo.count({
      where: {
        ...where,
        status: RentalOrderStatus.COMPLETED,
      },
    });

    // 6. 售后中（争议中）订单数量
    const disputeCount = await this.rentalOrderRepo.count({
      where: {
        ...where,
        status: RentalOrderStatus.DISPUTE,
      },
    });

    return {
      pendingPaymentCount,
      paidPendingReceiveOrderCount,
      inUseCount,
      overdueCount,
      completedCount,
      disputeCount,
    };
  }

  /**
   * @name 获取出租方统计数据
   * @description
   * 用于统计出租方相关数据：
   * - 已发布的资产数量
   * - 进行中的订单数量
   * - 待处理订单数量
   * - 累计收入
   */
  async getLessorStatistics(userId: string): Promise<OutputLessorStatisticsDto> {
    const [publishedAssetCount, totalAssetCount, inProgressOrderCount, pendingOrderCount, totalIncome] =
      await Promise.all([
        // 1. 查询已发布的资产数量（状态为AVAILABLE且审核状态为APPROVED）
        this.assetRepo.count({
          where: {
            ownerId: userId,
            status: AssetStatus.AVAILABLE,
            auditStatus: AssetAuditStatus.APPROVED,
            isActive: true,
          },
        }),
        // 2. 查询总资产数量
        this.assetRepo.count({ where: { ownerId: userId, isActive: true } }),
        // 3. 查询进行中的订单数量（状态为IN_USE）
        this.rentalOrderRepo.countBy({
          lessorId: userId,
          status: In([
            RentalOrderStatus.RECEIVED,
            RentalOrderStatus.PENDING_RECEIPT,
            RentalOrderStatus.CANCEL_PENDING,
            RentalOrderStatus.DISPUTE,
          ]),
        }),
        // 4. 查询待处理订单数量（含 useageStatus=IN_USE 且 overdueStatus=OVERDUE/OVERDUE_USE，不含 OVERDUE_FEE_PAID）
        // 待处理订单：主状态为待处理/纠纷、或使用状态为逾期/待归还、或已支付未使用
        this.dataSource
          .getRepository(RentalOrderEntity)
          .createQueryBuilder('order')
          .where('order.lessorId = :lessorId', { lessorId: userId })
          .andWhere(
            new Brackets(qb => {
              qb.where('order.status IN (:...mainStatuses)', {
                mainStatuses: [RentalOrderStatus.CANCEL_PENDING, RentalOrderStatus.DISPUTE],
              })
                .orWhere('order.overdueStatus IN (:...overdueStatuses)', {
                  overdueStatuses: [RentalOrderOverdueStatus.OVERDUE, RentalOrderOverdueStatus.OVERDUE_USE],
                })
                .orWhere('order.useageStatus IN (:...usageStatuses)', {
                  usageStatuses: [RentalOrderUsageStatus.RETURNED_PENDING, RentalOrderUsageStatus.WAIT_RETURN],
                })
                .orWhere('order.status = :pendingReceiptStatus AND order.useageStatus = :noneUsageStatus', {
                  pendingReceiptStatus: RentalOrderStatus.PENDING_RECEIPT,
                  noneUsageStatus: RentalOrderUsageStatus.NONE,
                });
            }),
          )
          .getCount(),

        // 5. 查询累计收入，已入账金额
        this.financeRepo.calculateTotalIncome(userId),
      ]);

    return {
      publishedAssetCount,
      totalAssetCount,
      inProgressOrderCount,
      pendingOrderCount,
      totalIncome: Number(totalIncome),
    };
  }

  /**
   * @name 获取出租方待处理订单统计数据
   * @description
   * 用于统计出租方待处理的订单数量：
   * - 已支付数量（PAID）
   * - 取消订单确认数量（CANCEL_PENDING）
   * - 逾期订单数量（overdueStatus=OVERDUE/OVERDUE_USE，不含 OVERDUE_FEE_PAID）
   * - 已归还待确认数量（RETURNED + RETURNED_PENDING）
   * - 待归还数量（WAIT_RETURN）
   * - 争议中数量（DISPUTE）
   */
  async getLessorPendingOrderStatistics(userId: string): Promise<OutputLessorPendingOrderStatisticsDto> {
    // 使用 Promise.all 并行查询所有统计数据，提高性能
    const [
      [, paidCount],
      [, cancelPendingCount],
      [, overdueCount],
      [, returnedPendingCount],
      [, waitReturnCount],
      [, disputeCount],
    ] = await Promise.all([
      // 1. 已支付数量（待收货）
      this.rentalOrderRepo.findMany({
        lessorId: userId,
        status: RentalOrderStatus.PENDING_RECEIPT,
        useageStatus: RentalOrderUsageStatus.NONE,
      }),
      // 2. 取消订单确认数量
      this.rentalOrderRepo.findMany({ lessorId: userId, status: RentalOrderStatus.CANCEL_PENDING }),

      // 3. 逾期订单数量（overdueStatus=OVERDUE/OVERDUE_USE，不含 OVERDUE_FEE_PAID）
      this.rentalOrderRepo.findMany({
        lessorId: userId,
        useageStatus: Not(RentalOrderUsageStatus.NONE),
        overdueStatus: In([RentalOrderOverdueStatus.OVERDUE, RentalOrderOverdueStatus.OVERDUE_USE]),
      }),

      // 4. 已归还待确认数量
      this.rentalOrderRepo.findMany({
        lessorId: userId,
        useageStatus: RentalOrderUsageStatus.RETURNED_PENDING,
      }),

      // 5. 待归还数量
      this.rentalOrderRepo.findMany({ lessorId: userId, useageStatus: RentalOrderUsageStatus.WAIT_RETURN }),

      // 6. 争议中数量
      this.rentalOrderRepo.findMany({ lessorId: userId, status: RentalOrderStatus.DISPUTE }),
    ]);

    return {
      paidCount,
      cancelPendingCount,
      overdueCount,
      returnedPendingCount,
      waitReturnCount,
      disputeCount,
    };
  }

  /**
   * @name 获取出租方财务统计数据
   * @description
   * 根据 status + flowStatus 统计：
   * - 累计结算：已提现的金额
   * - 可提现余额：已入账收入 - 已提现 - 已退款租金
   * - 待入账金额：已支付但订单还未完成的金额
   * 时间筛选按业务发生时间（businessOccurredAt）过滤
   */
  async getLessorFinanceStatistics(
    userId: string,
    dto?: QueryLessorFinanceStatisticsDto,
  ): Promise<OutputLessorFinanceStatisticsDto> {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (dto?.startDate) {
      startDate = dayjs(dto.startDate).startOf('day').toDate();
    }
    if (dto?.endDate) {
      endDate = dayjs(dto.endDate).endOf('day').toDate();
    }

    if (startDate && endDate && dayjs(startDate).isAfter(endDate)) {
      throw new BadRequestException('开始日期不能晚于结束日期');
    }

    const dateRange = startDate || endDate ? { startDate, endDate } : undefined;

    const [creditedIncome, withdrawnSum, refundedRentSum, pendingAmount] = await Promise.all([
      this.financeRepo.calculateCreditedIncomeSum(userId, dateRange),
      this.financeRepo.calculateWithdrawnSum(userId, dateRange),
      this.financeRepo.calculateRefundedRentRefundSum(userId, dateRange),
      this.financeRepo.calculatePendingAmountByFlowStatus(userId, dateRange),
    ]);

    // 可提现余额 = 已入账收入 - 已提现 - 已退款租金
    const withdrawableBalance = new Decimal(creditedIncome).minus(withdrawnSum).minus(refundedRentSum).toNumber();

    return {
      totalSettledAmount: new Decimal(withdrawnSum).toNumber(),
      withdrawableBalance: Math.max(0, withdrawableBalance),
      pendingAmount: new Decimal(pendingAmount).toNumber(),
    };
  }

  /**
   * @name 获取出租方订单统计数据
   * @description
   * 获取出租方各个状态的订单数量：待支付、使用中、已逾期、已完成、售后中（争议中）
   */
  async getLessorOrderStatistics(userId: string): Promise<OutputLessorOrderStatisticsDto> {
    return this.getLesseeOrderStatistics(userId, 'lessor');
  }
}
