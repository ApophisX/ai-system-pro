import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { FindOptionsWhere, In, DataSource, Not, Like } from 'typeorm';
import { RentalOrderRepository } from '../repositories';
import { RentalOrderEntity } from '../entities/rental-order.entity';
import {
  QueryRentalOrderDto,
  OutputRentalOrderDto,
  QueryPendingRentalOrderDto,
  OutputLessorOperationPermissionDto,
} from '../dto';
import { plainToInstance } from 'class-transformer';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';
import { OssService } from '@/modules/base/aliyun-oss/oss.service';
import { UserRepository } from '@/modules/base/user/repositories';
import { OutputOwnerBriefDto } from '@/modules/asset/dto';
import { RentalOrderSupportService } from './rental-order-support.service';
import { RentalReviewByOrderReader } from './rental-review-by-order.reader';
import {
  RentalOrderStatus,
  DepositStatus,
  DepositDeductionStatus,
  RentalOrderUsageStatus,
  RentalOrderOverdueStatus,
} from '../enums';
import { computeRentalOrderReviewPermissions } from '@/common/utils/rental-review-permission.util';
import Decimal from 'decimal.js';

/**
 * 租赁订单查询服务
 *
 * 订单列表（承租方/出租方）、订单详情
 */
@Injectable()
export class RentalOrderQueryService {
  constructor(
    private readonly orderRepo: RentalOrderRepository,
    private readonly reviewByOrderReader: RentalReviewByOrderReader,
    private readonly ossService: OssService,
    private readonly userRepo: UserRepository,
    private readonly support: RentalOrderSupportService,
    private readonly dataSource: DataSource,
  ) {
    //
  }
  /**
   * 查询租赁订单服务
   * 查询条件：status、refundStatus、assetId、orderNo
   * @param userId 用户ID（承租方或出租方）
   * @param dto 查询条件
   * @param role 用户角色（承租方或出租方）
   * @returns 订单列表（分页）
   */
  async queryOrders(
    userId: string,
    dto: QueryRentalOrderDto,
    role: 'lessee' | 'lessor' = 'lessee',
  ): Promise<{ data: OutputRentalOrderDto[]; meta: PaginationMetaDto }> {
    const where: FindOptionsWhere<RentalOrderEntity> = {};
    const whereList: FindOptionsWhere<RentalOrderEntity>[] = [];

    const pagination = new PaginationMetaDto(dto.page, dto.pageSize);

    if (role === 'lessee') {
      where.lesseeId = userId;
    } else {
      where.lessorId = userId;
    }

    if (dto.status) {
      const overdueStatuses = [
        RentalOrderOverdueStatus.OVERDUE,
        RentalOrderOverdueStatus.OVERDUE_USE,
        RentalOrderOverdueStatus.OVERDUE_FEE_PAID,
      ];
      const overStatus = [RentalOrderStatus.COMPLETED, RentalOrderStatus.CLOSED, RentalOrderStatus.CANCELED];

      // 使用中
      if (dto.status === RentalOrderUsageStatus.IN_USE) {
        where.useageStatus = In([
          RentalOrderUsageStatus.IN_USE,
          RentalOrderUsageStatus.RETURNED_PENDING,
          RentalOrderUsageStatus.WAIT_RETURN,
          RentalOrderUsageStatus.RETURNED,
        ]);
        where.status = Not(In(overStatus));
        where.overdueStatus = Not(In([RentalOrderOverdueStatus.OVERDUE_USE, RentalOrderOverdueStatus.OVERDUE]));
      } // 已逾期
      else if (overdueStatuses.includes(dto.status)) {
        // 逾期状态查询：useageStatus=IN_USE 且 overdueStatus 匹配
        where.status = Not(In(overStatus));
        where.overdueStatus = In([RentalOrderOverdueStatus.OVERDUE, RentalOrderOverdueStatus.OVERDUE_USE]);
        where.useageStatus = Not(In([RentalOrderUsageStatus.NONE, RentalOrderUsageStatus.REJECTED]));
      } else {
        where.status = dto.status as RentalOrderStatus;
        if (dto.status === RentalOrderStatus.RECEIVED) {
          // RECEIVED（已收货、使用中）：useageStatus=IN_USE
          where.useageStatus = RentalOrderUsageStatus.IN_USE;
        } else if (dto.status === RentalOrderStatus.PENDING_RECEIPT) {
          where.useageStatus = RentalOrderUsageStatus.NONE;
        }
      }
    }
    if (dto.refundStatus) where.refundStatus = dto.refundStatus;
    if (dto.assetId) where.assetId = dto.assetId;
    if (dto.orderNo) where.orderNo = Like(`%${dto.orderNo.trim()}%`);

    if (dto.keyword) {
      // 有 keyword 时，只使用 keyword 匹配条件（OR 连接）
      whereList.push({
        ...where,
        lessee: {
          phone: Like(`%${dto.keyword.trim()}%`),
        },
      });
      whereList.push({
        ...where,
        contactPhone: Like(`%${dto.keyword.trim()}%`),
      });
      whereList.push({
        ...where,
        contactName: Like(`%${dto.keyword.trim()}%`),
      });
      whereList.push({
        ...where,
        orderNo: Like(`%${dto.keyword.trim()}%`),
      });
    } else {
      // 没有 keyword 时，使用基础条件
      whereList.push(where);
    }

    const [orders, total] = await this.orderRepo.findMany(whereList, pagination.skip, pagination.pageSize);

    const data = orders.map(o => this.support.toOutputRentalOrderDto(o));

    const orderIds = orders.map(o => o.id);
    const reviews = await this.reviewByOrderReader.findByOrderIds(orderIds);
    const reviewByOrderId = new Map(reviews.map(r => [r.orderId, r]));

    data.forEach((item, index) => {
      const order = orders[index];
      item.assetSnapshot.images = item.assetSnapshot.images.map(img => this.ossService.getSignatureUrl(img));
      item.assetSnapshot.coverImage = this.ossService.getSignatureUrl(item.assetSnapshot.coverImage);
      item.lessor.avatar = this.ossService.getSignatureUrl(item.lessor.avatar);
      item.lessee.avatar = this.ossService.getSignatureUrl(item.lessee.avatar);

      const review = reviewByOrderId.get(order.id) ?? null;
      const perm = computeRentalOrderReviewPermissions(order, review, role);
      item.canReview = perm.canReview;
      item.canReplyToReview = perm.canReplyToReview;
    });

    pagination.total = total;

    return { data, meta: pagination };
  }

  /**
   * 查询租赁订单详情服务
   * @param id 订单ID
   * @param userId 用户ID（可选，用于权限检查）
   * @returns 订单详情（如果订单不存在或无权限，返回 null）
   */
  async getOrderById(id: string, userId?: string): Promise<OutputRentalOrderDto | null> {
    try {
      const order = await this.orderRepo.findById(id, {
        relations: { evidences: true, inventory: true },
      });
      if (userId && order.lesseeId !== userId && order.lessorId !== userId) {
        throw new ForbiddenException('无权查看此订单');
      }

      const result = this.support.toOutputRentalOrderDto(order);
      const owner = await this.userRepo.findOne({ where: { id: order.lessorId } });

      result.assetSnapshot.owner = plainToInstance(OutputOwnerBriefDto, owner, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      });

      if (result.assetSnapshot.owner) {
        result.assetSnapshot.owner.avatar = this.ossService.getSignatureUrl(result.assetSnapshot.owner.avatar);
      }

      result.assetSnapshot.images = result.assetSnapshot.images.map(img => this.ossService.getSignatureUrl(img));
      result.assetSnapshot.detailImages = result.assetSnapshot.detailImages?.map(img =>
        this.ossService.getSignatureUrl(img),
      );
      result.assetSnapshot.coverImage = this.ossService.getSignatureUrl(result.assetSnapshot.coverImage);

      result.lessee.avatar = this.ossService.getSignatureUrl(result.lessee.avatar);
      result.evidences.forEach(evidence => {
        evidence.evidenceUrls = evidence.evidenceUrls?.map(url => this.ossService.getSignatureUrl(url));
      });

      result.deposits.forEach(deposit => {
        deposit.deductions.forEach(deduction => {
          if (deduction.evidence) {
            deduction.evidence.urls = deduction.evidence?.urls?.map(url => this.ossService.getSignatureUrl(url));
          }
          if (deduction.userResponseEvidence) {
            deduction.userResponseEvidence.urls = deduction.userResponseEvidence?.urls?.map(url =>
              this.ossService.getSignatureUrl(url),
            );
          }
        });
      });

      if (result.inventory) {
        result.inventory.images = result.inventory.images?.map(img => this.ossService.getSignatureUrl(img));
      }

      const review = await this.reviewByOrderReader.findByOrderId(order.id);
      const role =
        userId && order.lesseeId === userId ? 'lessee' : userId && order.lessorId === userId ? 'lessor' : 'lessee';
      const perm = computeRentalOrderReviewPermissions(order, review, role);
      result.canReview = perm.canReview;
      result.canReplyToReview = perm.canReplyToReview;

      return result;
    } catch (e) {
      if (e instanceof NotFoundException) return null;
      throw e;
    }
  }

  /**
   * 查询待处理订单（出租方）
   * 待处理订单状态：cancel_pending、dispute、overdue、paid、returned_pending、wait_return
   * 注意：returned_pending 和 wait_return 是使用状态，需要通过 useageStatus 查询
   */
  async queryPendingOrders(
    userId: string,
    dto: QueryPendingRentalOrderDto,
  ): Promise<{ data: OutputRentalOrderDto[]; meta: PaginationMetaDto }> {
    const pendingStatuses = [
      RentalOrderStatus.CANCEL_PENDING,
      RentalOrderStatus.DISPUTE,
      RentalOrderStatus.PENDING_RECEIPT,
      RentalOrderOverdueStatus.OVERDUE,
      RentalOrderOverdueStatus.OVERDUE_USE,
      RentalOrderOverdueStatus.OVERDUE_FEE_PAID,
      RentalOrderUsageStatus.RETURNED_PENDING,
      RentalOrderUsageStatus.WAIT_RETURN,
    ];

    if (dto.status) {
      if (!pendingStatuses.includes(dto.status)) {
        throw new BadRequestException(`订单状态必须是待处理状态之一：${pendingStatuses.map(s => s).join('、')}`);
      }
    }
    const pagination = new PaginationMetaDto(dto.page, dto.pageSize);

    const queryBuilder = this.dataSource
      .getRepository(RentalOrderEntity)
      .createQueryBuilder('order')
      .where('order.lessorId = :userId', { userId })
      .leftJoinAndSelect('order.lessor', 'lessor')
      .leftJoinAndSelect('order.lessee', 'lessee')
      .leftJoinAndSelect('order.assetSnapshot', 'assetSnapshot')
      .leftJoinAndSelect('order.rentalPlanSnapshot', 'rentalPlanSnapshot')
      .orderBy('order.createdAt', 'DESC');

    // 已归还待确认 / 待归还
    if (dto.status === RentalOrderUsageStatus.RETURNED_PENDING || dto.status === RentalOrderUsageStatus.WAIT_RETURN) {
      queryBuilder.andWhere('order.useageStatus = :useageStatus', { useageStatus: dto.status });
    }
    // 逾期状态：overdueStatus 查询（useageStatus=IN_USE）
    else if (dto.status === RentalOrderOverdueStatus.OVERDUE) {
      queryBuilder
        // .andWhere('order.useageStatus = :useageStatus', { useageStatus: RentalOrderUsageStatus.IN_USE })
        .andWhere('order.overdueStatus IN (:...overdueStatuses)', {
          overdueStatuses: [RentalOrderOverdueStatus.OVERDUE, RentalOrderOverdueStatus.OVERDUE_USE],
        })
        .andWhere('order.status NOT IN (:...overStatus)', {
          overStatus: [RentalOrderStatus.COMPLETED, RentalOrderStatus.CLOSED, RentalOrderStatus.CANCELED],
        });
    } else if (dto.status) {
      const useageStatuses = [RentalOrderUsageStatus.IN_USE, RentalOrderUsageStatus.RETURNED];
      if (useageStatuses.includes(dto.status as RentalOrderUsageStatus)) {
        queryBuilder.andWhere('order.useageStatus = :useageStatus', { useageStatus: dto.status });
      } else {
        queryBuilder.andWhere('order.status = :status', { status: dto.status });
        if (dto.status === RentalOrderStatus.PENDING_RECEIPT) {
          queryBuilder.andWhere('order.useageStatus = :useageStatus', { useageStatus: RentalOrderUsageStatus.NONE });
        }
      }
    } else {
      // 无筛选时：待处理订单 = 取消确认/争议 + 待收货 + 已归还/待确认/待归还 + 逾期
      queryBuilder
        .andWhere('order.status IN (:...statuses)', {
          statuses: [RentalOrderStatus.CANCEL_PENDING, RentalOrderStatus.DISPUTE],
        })
        .orWhere('order.status = :status AND order.useageStatus = :useageStatus', {
          status: RentalOrderStatus.PENDING_RECEIPT,
          useageStatus: RentalOrderUsageStatus.NONE,
        })
        .orWhere('order.useageStatus IN (:...useageStatuses)', {
          useageStatuses: [RentalOrderUsageStatus.WAIT_RETURN, RentalOrderUsageStatus.RETURNED_PENDING],
        })
        .orWhere('(order.useageStatus = :inUse AND order.overdueStatus IN (:...overdueStatuses))', {
          inUse: RentalOrderUsageStatus.IN_USE,
          overdueStatuses: [RentalOrderOverdueStatus.OVERDUE, RentalOrderOverdueStatus.OVERDUE_USE],
        });
    }

    const [orders, total] = await queryBuilder.skip(pagination.skip).take(pagination.pageSize).getManyAndCount();

    const data = orders.map(o => this.support.toOutputRentalOrderDto(o));

    const orderIds = orders.map(o => o.id);
    const reviews = await this.reviewByOrderReader.findByOrderIds(orderIds);
    const reviewByOrderId = new Map(reviews.map(r => [r.orderId, r]));

    pagination.total = total;

    data.forEach((item, index) => {
      const order = orders[index];
      item.assetSnapshot.images = item.assetSnapshot.images.map(img => this.ossService.getSignatureUrl(img));
      item.assetSnapshot.coverImage = this.ossService.getSignatureUrl(item.assetSnapshot.coverImage);
      item.lessor.avatar = this.ossService.getSignatureUrl(item.lessor.avatar);
      item.lessee.avatar = this.ossService.getSignatureUrl(item.lessee.avatar);

      const review = reviewByOrderId.get(order.id) ?? null;
      const perm = computeRentalOrderReviewPermissions(order, review, 'lessor');
      item.canReview = perm.canReview; // 待处理列表为出租方视角，始终 false
      item.canReplyToReview = perm.canReplyToReview;
    });

    return { data, meta: pagination };
  }

  /**
   * 出租方获取当前订单的操作权限
   *
   * 用于前端根据权限做条件判断与 UI 展示（如按钮显隐、引导文案）
   * 规则与各操作接口的校验保持一致。
   *
   * @param userId 用户 ID（须为订单出租方）
   * @param orderId 订单 ID
   * @returns 操作权限 DTO
   */
  async getLessorOperationPermission(userId: string, orderId: string): Promise<OutputLessorOperationPermissionDto> {
    const order = await this.orderRepo.findById(orderId, {
      relations: { deposits: { deductions: true } },
    });

    if (order.lessorId !== userId) {
      throw new ForbiddenException('只有出租方可查看订单操作权限');
    }

    const forceCloseAllowedUsageStatuses = [
      RentalOrderUsageStatus.IN_USE,
      RentalOrderUsageStatus.WAIT_RETURN,
      RentalOrderUsageStatus.RETURNED_PENDING,
    ];
    const canForceClose =
      order.status === RentalOrderStatus.RECEIVED && forceCloseAllowedUsageStatuses.includes(order.useageStatus);

    const result: OutputLessorOperationPermissionDto = {
      canDeductDeposit: false,
      hasCancellableDeductions: false,
      canApproveCancel: order.isCancelPending,
      canCancelByLessor: order.isPendingReceipt,
      canEndOrder: order.isReturned,
      canForceClose,
      canForceCloseReason: !canForceClose
        ? order.status === RentalOrderStatus.CLOSED
          ? '订单已关闭'
          : order.status !== RentalOrderStatus.RECEIVED
            ? `仅「已收货、使用中」状态可强制关闭，当前：${order.statusLabel}`
            : !forceCloseAllowedUsageStatuses.includes(order.useageStatus)
              ? `当前使用状态不可强制关闭：${order.useageStatusLabel}`
              : undefined
        : undefined,
      // 注意：RETURNED_PENDING 是使用状态
      canRefundDeposit: false,
      // 与 refundPaymentRecord 接口校验保持一致：订单未完成、未失效、已支付租金
      canRefundPaymentRecord: !order.isCompleted && !order.isInvalid && order.isPaid,
      canRefundPaymentRecordReason: undefined,
      canSetOverdueUseDiscount: false,
    };

    // 单笔账单退款不可用时的原因
    if (!result.canRefundPaymentRecord) {
      if (order.isCompleted) {
        result.canRefundPaymentRecordReason = '订单已完成（履约结束并结算完成），不可发起单笔账单退款';
      } else if (order.isInvalid) {
        result.canRefundPaymentRecordReason =
          order.status === RentalOrderStatus.CLOSED
            ? '订单已关闭'
            : order.status === RentalOrderStatus.CANCELED
              ? '订单已取消'
              : '订单已失效，不可发起退款';
      } else if (!order.isPaid) {
        result.canRefundPaymentRecordReason = '订单租金未支付完成，无可退款账单';
      }
    }

    // 逾期订单 useageStatus=IN_USE，overdueStatus=OVERDUE/OVERDUE_USE
    const deductAllowedStatuses = [
      RentalOrderUsageStatus.IN_USE,
      RentalOrderUsageStatus.RETURNED,
      RentalOrderUsageStatus.RETURNED_PENDING,
    ];
    const deductAllowedMainStatuses = [
      RentalOrderStatus.COMPLETED,
      RentalOrderStatus.CANCEL_PENDING,
      RentalOrderStatus.DISPUTE,
      RentalOrderStatus.PENDING_RECEIPT,
      RentalOrderStatus.RECEIVED, // 已收货、使用中
    ];
    // 注意：WAIT_RETURN 和 RETURNED_PENDING 是使用状态

    if (
      (deductAllowedStatuses.includes(order.useageStatus) || deductAllowedMainStatuses.includes(order.status)) &&
      order.depositList.length > 0
    ) {
      const deposit = order.depositList.find(d => d.isPaidOrFree);
      if (deposit) {
        if (deposit.status === DepositStatus.FULLY_DEDUCTED) {
          result.canDeductDepositReason = '押金已全部扣除，无法再次扣款';
        } else {
          // 获取正在执行或已执行的扣款记录总金额
          const executingOrExecutedTotalDeductedAmount = deposit.getExecutingOrExecutedDeductionsTotalAmount();
          if (executingOrExecutedTotalDeductedAmount.gte(deposit.amount)) {
            result.canDeductDepositReason = `累计扣款金额不得超过初始押金金额，初始押金：${deposit.amount}元，当前累计扣款：${executingOrExecutedTotalDeductedAmount.toNumber()}元`;
          } else if (deposit.executedCount >= 3) {
            result.canDeductDepositReason = '单笔押金最多可成功扣除 3 次，已达到上限';
          } else if (deposit.inProgressCount >= 3 || deposit.executedList.length >= 3) {
            result.canDeductDepositReason = '最多发起 3 次扣款申请，若 3 次均失败或被拒绝则不可再发起';
          } else {
            result.canDeductDeposit = true;
          }
        }
      } else {
        result.canDeductDepositReason = '订单押金未支付或未冻结';
      }
    } else if (
      !deductAllowedStatuses.includes(order.useageStatus) &&
      !deductAllowedMainStatuses.includes(order.status)
    ) {
      result.canDeductDepositReason = `当前订单状态不可发起扣款，仅在使用中、已归还、逾期等状态下可操作`;
    } else if (order.depositList.length === 0) {
      result.canDeductDepositReason = '订单不存在押金记录';
    }

    const cancellableStatuses = [DepositDeductionStatus.PENDING_USER_CONFIRM, DepositDeductionStatus.PENDING_AUDIT];
    const cancellableDeductions = (order.depositList || [])
      .flatMap(d => d.deductions || [])
      .filter(d => cancellableStatuses.includes(d.status));
    result.hasCancellableDeductions = cancellableDeductions.length > 0;
    if (!result.hasCancellableDeductions) {
      result.canCancelDeductionReason = '当前没有可取消的扣款申请';
    }

    // 逾期订单 useageStatus=IN_USE，overdueStatus=OVERDUE/OVERDUE_USE
    const refundDepositStatuses = [RentalOrderUsageStatus.IN_USE, RentalOrderUsageStatus.RETURNED];
    const refundDepositMainStatuses = [RentalOrderStatus.COMPLETED];
    if (
      (refundDepositStatuses.includes(order.useageStatus) || refundDepositMainStatuses.includes(order.status)) &&
      order.needDeposit &&
      order.isDepositFrozenOrPaid &&
      order.deposits?.length
    ) {
      const hasRefundable = order.deposits.some(
        d => d.isPaidOrFree && new Decimal(d.amount).minus(d.deductedAmount).toNumber() > 0,
      );
      if (hasRefundable) {
        result.canRefundDeposit = true;
      } else {
        result.canRefundDepositReason = '没有可退款的押金，押金可能已全部扣除或已退款';
      }
    } else if (
      !refundDepositStatuses.includes(order.useageStatus) &&
      !refundDepositMainStatuses.includes(order.status)
    ) {
      result.canRefundDepositReason = '当前订单状态不允许押金退款';
    } else if (!order.needDeposit || !order.isDepositFrozenOrPaid || !order.deposits?.length) {
      result.canRefundDepositReason = '订单没有可退款的押金记录';
    }

    // 设置超期使用优惠：仅 overdueStatus=OVERDUE_USE、先付后用、非分期订单，且有待付超期费
    if (
      order.status === RentalOrderStatus.RECEIVED &&
      order.overdueStatus === RentalOrderOverdueStatus.OVERDUE_USE &&
      !order.isPostPayment &&
      !order.isInstallment
    ) {
      const overdueFee = order.rentalPlanSnapshot?.overdueFee ?? 0;
      if (!overdueFee || Number(overdueFee) <= 0) {
        result.canSetOverdueUseDiscountReason = '该租赁方案未配置超期费用';
      } else {
        const totalOverdue = order.overdueUseAmount;
        const paidOverdue = order.overdueFeePaidAmount ? Number(order.overdueFeePaidAmount) : 0;
        const maxDiscount = new Decimal(totalOverdue).minus(paidOverdue);
        if (maxDiscount.lte(0)) {
          result.canSetOverdueUseDiscountReason = '当前无待付超期使用费';
        } else {
          result.canSetOverdueUseDiscount = true;
        }
      }
    } else if (order.overdueStatus !== RentalOrderOverdueStatus.OVERDUE_USE) {
      result.canSetOverdueUseDiscountReason = '仅超时使用状态可设置超期使用优惠';
    } else if (order.isPostPayment || order.isInstallment) {
      result.canSetOverdueUseDiscountReason = '先用后付或分期订单请使用分期账单优惠接口';
    } else {
      result.canSetOverdueUseDiscountReason = '当前订单状态不允许设置超期使用优惠';
    }

    return result;
  }
}
