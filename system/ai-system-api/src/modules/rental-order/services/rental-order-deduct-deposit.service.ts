import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource, FindOptionsWhere, Like } from 'typeorm';
import { RentalOrderRepository, DepositDeductionRepository } from '../repositories';
import {
  RentalOrderUsageStatus,
  RentalOrderStatus,
  DepositStatus,
  DepositDeductionStatus,
  EvidenceSubmitterType,
  EvidenceType,
  EvidenceAuditStatus,
} from '../enums';
import { RentalOrderEvidenceEntity, DepositEntity, RentalOrderEntity } from '../entities';
import {
  CreateDepositDeductionDto,
  OutputRentalOrderDto,
  ConfirmDepositDeductionDto,
  DepositDeductionResponseType,
  CancelDepositDeductionDto,
  ReviewDepositDeductionDto,
  QueryDepositDeductionAdminDto,
} from '../dto';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';
import Decimal from 'decimal.js';
import { DepositService } from './deposit.service';
import { RentalOrderSupportService } from './rental-order-support.service';
import { RentalOrderJobService } from '../jobs/services';
import { DepositDeductionEntity } from '../entities/deposit-deduction.entity';
import { FinanceDepositService } from '@/modules/finance/services';
import { MessageNotificationService } from '@/modules/base/message/services';
import { CreditEvents } from '@/modules/credit/events/credit.events';
import { CreditActorRole } from '@/modules/credit/enums';
import { DepositDeductedPayload } from '@/modules/credit/events/credit-event.payload';
import { OssService } from '@/modules/base/aliyun-oss/oss.service';
import { UserRepository } from '@/modules/base/user/repositories';
/**
 * 租赁订单押金扣款服务
 *
 * 出租方发起押金扣款申请，校验规则后调用 DepositService 创建扣款记录
 */
@Injectable()
export class RentalOrderDeductDepositService {
  private readonly logger = new Logger(RentalOrderDeductDepositService.name);

  constructor(
    private readonly orderRepo: RentalOrderRepository,
    private readonly depositService: DepositService,
    private readonly deductionRepo: DepositDeductionRepository,
    private readonly support: RentalOrderSupportService,
    private readonly dataSource: DataSource,
    private readonly rentalOrderJobService: RentalOrderJobService,
    private readonly financeDepositService: FinanceDepositService,
    private readonly messageNotificationService: MessageNotificationService,
    private readonly eventEmitter: EventEmitter2,
    private readonly userRepo: UserRepository,
    private readonly ossService: OssService,
  ) {
    //
  }

  // 出租方发起押金扣款申请
  async deductDeposit(userId: string, orderId: string, dto: CreateDepositDeductionDto): Promise<OutputRentalOrderDto> {
    const order = await this.orderRepo.findById(orderId, {
      relations: { deposits: true },
    });

    if (order.lessorId !== userId) {
      throw new ForbiddenException('只有出租方可以发起押金扣款申请');
    }

    // 押金扣款状态校验：与 canDeductDeposit 逻辑保持一致
    // 逾期订单 useageStatus=IN_USE，overdueStatus=OVERDUE/OVERDUE_USE（OVERDUE_FEE_PAID 多见于 RETURNED_PENDING）
    const deductAllowedUsageStatuses = [
      RentalOrderUsageStatus.IN_USE,
      RentalOrderUsageStatus.RETURNED,
      RentalOrderUsageStatus.RETURNED_PENDING,
    ];
    const deductAllowedMainStatuses = [
      RentalOrderStatus.COMPLETED,
      RentalOrderStatus.CANCEL_PENDING,
      RentalOrderStatus.DISPUTE,
      RentalOrderStatus.PENDING_RECEIPT,
      RentalOrderStatus.RECEIVED,
    ];
    const canDeduct =
      deductAllowedUsageStatuses.includes(order.useageStatus) || deductAllowedMainStatuses.includes(order.status);
    if (!canDeduct) {
      throw new BadRequestException(
        `订单状态不允许扣款，当前状态：${order.statusLabel} / ${order.useageStatusLabel}。`,
      );
    }
    if (order.depositList.length === 0) {
      throw new BadRequestException('订单不存在押金记录');
    }

    const deposit = order.depositList.find(d => d.isPaidOrFree);
    if (!deposit) {
      throw new BadRequestException('订单押金未支付或未冻结');
    }

    // 验证押金扣款申请
    await this.validateDepositDeduction(orderId, deposit.id, dto);

    // 创建押金扣款申请
    await this.depositService.createDepositDeduction(userId, deposit.id, orderId, dto);

    // 查询更新后的订单
    const updatedOrder = await this.orderRepo.findById(orderId, {
      relations: { payments: true, deposits: { deductions: true }, assetSnapshot: true, rentalPlanSnapshot: true },
    });

    this.logger.log(
      `押金扣款申请已提交: orderId=${orderId}, depositId=${deposit.id}, amount=${dto.amount}, userId=${userId}`,
    );

    return this.support.toOutputRentalOrderDto(updatedOrder);
  }

  // 验证押金扣款申请
  async validateDepositDeduction(orderId: string, depositId: string, dto: CreateDepositDeductionDto): Promise<void> {
    const order = await this.orderRepo.findById(orderId, {
      relations: { deposits: true },
    });

    const deposit = order.deposits?.find(d => d.id === depositId);
    if (!deposit) {
      throw new NotFoundException('押金记录不存在');
    }

    if (deposit.status === DepositStatus.FULLY_DEDUCTED) {
      throw new BadRequestException('押金已全部扣除，无法再次扣款');
    }

    // 所有扣款申请
    const allDeductions = await this.deductionRepo.find({
      where: { depositId },
      order: { appliedAt: 'DESC' },
    });

    const executedDeductions = allDeductions.filter(d => d.status === DepositDeductionStatus.EXECUTED);
    const executedCount = executedDeductions.length;

    if (executedCount >= 3) {
      throw new BadRequestException('单笔押金最多可成功扣除3次，已达到上限');
    }

    // 进行中的扣款申请数量
    const inProgressDeductions = allDeductions.filter(d =>
      [DepositDeductionStatus.PENDING_USER_CONFIRM, DepositDeductionStatus.PENDING_AUDIT].includes(d.status),
    ).length;

    // 平台拒绝的扣款申请数量
    const platformRejectedDeductions = allDeductions.filter(
      d => d.status === DepositDeductionStatus.PLATFORM_REJECTED,
    ).length;

    // 最多处理3次扣款申请，如果3次都失败或被拒绝，则不能再发起扣款申请。
    if (inProgressDeductions >= 3 || platformRejectedDeductions >= 3) {
      throw new BadRequestException('最多发起3次扣款申请，如果3次都失败或被拒绝，则不能再发起扣款申请。');
    }

    const availableAmount = deposit.availableDeductAmount;
    if (new Decimal(dto.amount).gt(availableAmount)) {
      throw new BadRequestException(`扣款金额超过当前可用押金余额，当前可用余额：${availableAmount}元`);
    }

    // 正在执行或已执行的扣款记录状态列表
    const executingOrExecutedStatuses = [
      DepositDeductionStatus.EXECUTED,
      DepositDeductionStatus.PLATFORM_APPROVED,
      DepositDeductionStatus.PENDING_AUDIT,
      DepositDeductionStatus.PENDING_USER_CONFIRM,
    ];

    const executingOrExecutedDeductionsTotalAmount = allDeductions
      .filter(d => executingOrExecutedStatuses.includes(d.status))
      .reduce((sum, d) => sum.plus(d.amount), new Decimal(0));

    const newTotalDeductedAmount = executingOrExecutedDeductionsTotalAmount.plus(dto.amount);
    if (newTotalDeductedAmount.gt(deposit.amount)) {
      throw new BadRequestException(
        `累计扣款金额不得超过初始押金金额，初始押金：${deposit.amount}元，当前累计扣款：${executingOrExecutedDeductionsTotalAmount.toNumber()}元`,
      );
    }

    this.logger.log(
      `押金扣款申请验证通过: orderId=${orderId}, depositId=${depositId}, amount=${dto.amount}, executedCount=${executedCount}`,
    );
  }

  /**
   * 承租方确认押金扣款申请
   *
   * 业务规则：
   * 1. 承租方可以对押金扣款申请进行确认
   * 2. 同意：记录承租方同意信息，状态自动标记为平台已审核，审核原因填写用户同意说明
   * 3. 拒绝：必须提交拒绝说明或凭证，状态标记为【用户拒绝】
   * 4. 只能确认状态为【待用户确认】的扣款申请
   * 5. 扣款申请必须属于该订单
   *
   * @param userId 用户 ID（承租方）
   * @param orderId 订单 ID
   * @param dto 确认扣款申请 DTO
   */
  async confirmDepositDeduction(
    userId: string,
    orderId: string,
    dto: ConfirmDepositDeductionDto,
  ): Promise<OutputRentalOrderDto> {
    // 1. 查询订单，验证用户是承租方
    const order = await this.orderRepo.findById(orderId, {
      relations: { deposits: { deductions: true } },
    });

    if (order.lesseeId !== userId) {
      throw new ForbiddenException('只有承租方可以确认押金扣款申请');
    }

    // 2. 验证拒绝时必须提供凭证
    if (dto.responseType === DepositDeductionResponseType.REJECTED && !dto.evidenceUrls?.length) {
      throw new BadRequestException('拒绝时必须提供凭证');
    }

    // 3. 在事务内查询并更新扣款申请状态
    await this.dataSource.transaction(async manager => {
      const deductionRepo = manager.getRepository(DepositDeductionEntity);
      const deduction = await deductionRepo.findOne({
        where: { id: dto.deductionId, orderId },
      });

      if (!deduction) {
        throw new NotFoundException('扣款申请不存在');
      }

      // 验证状态为待用户确认
      if (deduction.status !== DepositDeductionStatus.PENDING_USER_CONFIRM) {
        throw new BadRequestException(`扣款申请状态不允许确认，当前状态：${deduction.statusLabel}`);
      }

      // 记录承租方响应信息
      const respondedAt = new Date();
      deduction.userRespondedAt = respondedAt;
      deduction.userResponseType = dto.responseType;
      deduction.userResponseDescription = dto.description;
      deduction.userResponseEvidence = dto.evidenceUrls
        ? {
            urls: dto.evidenceUrls,
            description: dto.description,
          }
        : undefined;

      // 根据响应类型更新状态
      if (dto.responseType === DepositDeductionResponseType.APPROVED) {
        // 同意：状态自动标记为已执行，备注填写用户同意说明
        deduction.status = DepositDeductionStatus.EXECUTED;
        deduction.deductedAt = respondedAt;
        deduction.remark = `用户同意：${dto.description}`;
        this.logger.log(
          `承租方同意扣款申请: deductionId=${deduction.id}, deductionNo=${deduction.deductionNo}, orderId=${orderId}, userId=${userId}`,
        );

        // 更新押金和订单的押金状态
        const depositRepo = manager.getRepository(DepositEntity);
        const orderRepo = manager.getRepository(RentalOrderEntity);

        // 查询押金记录
        const deposit = await depositRepo.findOne({
          where: { id: deduction.depositId },
        });

        if (!deposit) {
          throw new NotFoundException('押金记录不存在');
        }

        // 计算新的扣除金额和剩余金额
        const deductionAmount = new Decimal(deduction.amount);
        const newDeductedAmount = new Decimal(deposit.deductedAmount || 0).plus(deductionAmount);
        const newRemainingAmount = new Decimal(deposit.amount).minus(newDeductedAmount);

        // 更新押金的扣除金额和剩余金额
        deposit.deductedAmount = newDeductedAmount.toNumber();
        deposit.remainingAmount = Math.max(newRemainingAmount.toNumber(), 0);

        // 根据剩余金额更新押金状态
        if (newRemainingAmount.lte(0)) {
          // 已全部扣除
          deposit.status = DepositStatus.FULLY_DEDUCTED;
        } else {
          // 部分扣除
          deposit.status = DepositStatus.PARTIAL_DEDUCTED;
        }

        await depositRepo.save(deposit);

        // 同步更新订单的押金状态
        await orderRepo.update({ id: orderId }, { depositStatus: deposit.status });

        this.logger.log(
          `押金状态已更新: depositId=${deposit.id}, depositNo=${deposit.depositNo}, deductedAmount=${deposit.deductedAmount}, remainingAmount=${deposit.remainingAmount}, status=${deposit.status}`,
        );

        // 创建财务记录（与当前事务同一 connection，避免 Lock wait timeout）
        await this.financeDepositService.handleDepositDeductionExecuted(deduction, manager);
      } else if (dto.responseType === DepositDeductionResponseType.REJECTED) {
        // 拒绝：状态标记为【待平台审核】
        deduction.status = DepositDeductionStatus.PENDING_AUDIT;
        this.logger.log(
          `承租方拒绝扣款申请，已提交至平台审核: deductionId=${deduction.id}, deductionNo=${deduction.deductionNo}, orderId=${orderId}, userId=${userId}`,
        );
      }

      await deductionRepo.save(deduction);

      // 如果提供了凭证，创建凭证记录
      if (dto.evidenceUrls && dto.evidenceUrls.length > 0) {
        const evidenceRepo = manager.getRepository(RentalOrderEvidenceEntity);
        const evidence = evidenceRepo.create({
          rentalOrderId: orderId,
          rentalOrderNo: order.orderNo,
          submitterId: userId,
          submitterType: EvidenceSubmitterType.LESSEE,
          evidenceType:
            dto.responseType === DepositDeductionResponseType.APPROVED
              ? EvidenceType.DEPOSIT_DEDUCTION_APPROVE
              : EvidenceType.DEPOSIT_DEDUCTION_REJECT,
          evidenceUrls: dto.evidenceUrls,
          description: dto.description,
          relatedOrderStatus: order.useageStatus,
          // 根据响应类型设置审核状态
          auditStatus:
            dto.responseType === DepositDeductionResponseType.APPROVED
              ? EvidenceAuditStatus.APPROVED
              : EvidenceAuditStatus.PENDING,
          auditedAt: dto.responseType === DepositDeductionResponseType.APPROVED ? respondedAt : undefined,
        });

        await evidenceRepo.save(evidence);

        this.logger.log(
          `押金扣款确认凭证已创建: deductionId=${deduction.id}, responseType=${dto.responseType}, evidenceCount=${dto.evidenceUrls.length}`,
        );
      }

      // 取消超时任务（用户已响应，不再需要超时处理）
      setImmediate(() => {
        this.rentalOrderJobService.cancelDepositDeductionTimeoutJob(deduction.id).catch(err => {
          this.logger.error(
            `取消押金扣款超时任务失败: deductionId=${deduction.id}, error=${err instanceof Error ? err.message : '未知错误'}`,
          );
        });
      });
    });

    // 6. 查询更新后的订单
    const updatedOrder = await this.orderRepo.findById(orderId, {
      relations: { payments: true, deposits: { deductions: true }, assetSnapshot: true, rentalPlanSnapshot: true },
    });

    // 7. 发送消息通知
    const deduction = updatedOrder.deposits?.[0]?.deductions?.find(d => d.id === dto.deductionId);
    if (deduction) {
      if (dto.responseType === DepositDeductionResponseType.APPROVED) {
        await this.messageNotificationService.notifyDepositDeductionConfirmed(updatedOrder, deduction);
        // 发射信用事件：押金扣除（承租方负面）
        this.eventEmitter.emit(CreditEvents.DEPOSIT_DEDUCTED, {
          userId: order.lesseeId,
          actorRole: CreditActorRole.LESSEE,
          orderId,
          deductionId: deduction.id,
          amount: Number(deduction.amount),
          operatorType: 'system',
        });
      } else {
        await this.messageNotificationService.notifyDepositDeductionRejected(updatedOrder, deduction);
      }
    }

    this.logger.log(`押金扣款申请确认完成: orderId=${orderId}, responseType=${dto.responseType}, userId=${userId}`);

    return this.support.toOutputRentalOrderDto(updatedOrder);
  }

  /**
   * @name 出租方取消押金扣款申请
   *
   * 业务规则：
   * 1. 只有出租方可以取消扣款申请
   * 2. 只有在扣款状态属于【待用户确认】、【待平台审核】时，才能取消扣款申请
   * 3. 取消指定的扣款申请（通过扣款ID）
   * 4. 取消相关的超时任务
   *
   * @param userId 用户 ID（出租方）
   * @param orderId 订单 ID
   * @param dto 取消扣款申请 DTO（包含扣款ID）
   */
  async cancelDepositDeduction(
    userId: string,
    orderId: string,
    dto: CancelDepositDeductionDto,
  ): Promise<OutputRentalOrderDto> {
    // 1. 查询订单，验证用户是出租方
    const order = await this.orderRepo.findById(orderId, {
      relations: { deposits: { deductions: true } },
    });

    if (order.lessorId !== userId) {
      throw new ForbiddenException('只有出租方可以取消押金扣款申请');
    }

    // 2. 在事务内查询并更新扣款申请状态
    await this.dataSource.transaction(async manager => {
      const deductionRepo = manager.getRepository(DepositDeductionEntity);
      const deduction = await deductionRepo.findOne({
        where: { id: dto.deductionId, orderId },
      });

      if (!deduction) {
        throw new NotFoundException('扣款申请不存在或不属于该订单');
      }

      // 验证扣款申请属于该订单的出租方
      if (deduction.lessorId !== userId) {
        throw new ForbiddenException('只能取消自己发起的扣款申请');
      }

      // 验证状态（防止并发修改）
      if (
        deduction.status !== DepositDeductionStatus.PENDING_USER_CONFIRM &&
        deduction.status !== DepositDeductionStatus.PENDING_AUDIT
      ) {
        throw new BadRequestException(
          `扣款申请状态不允许取消，当前状态：${deduction.statusLabel}，只有状态为【待用户确认】或【待平台审核】的扣款申请才能取消`,
        );
      }

      // 更新状态为已取消
      deduction.status = DepositDeductionStatus.CANCELLED;
      deduction.cancelReason = dto.cancelReason || '出租方取消扣款申请';
      deduction.cancelAt = new Date();
      await deductionRepo.save(deduction);

      this.logger.log(
        `出租方取消扣款申请: deductionId=${deduction.id}, deductionNo=${deduction.deductionNo}, orderId=${orderId}, userId=${userId}`,
      );

      // 取消超时任务（扣款申请已取消，不再需要超时处理）
      setImmediate(() => {
        this.rentalOrderJobService.cancelDepositDeductionTimeoutJob(deduction.id).catch(err => {
          this.logger.error(
            `取消押金扣款超时任务失败: deductionId=${deduction.id}, error=${err instanceof Error ? err.message : '未知错误'}`,
          );
        });
      });
    });

    // 3. 查询更新后的订单
    const updatedOrder = await this.orderRepo.findById(orderId, {
      relations: { payments: true, deposits: { deductions: true }, assetSnapshot: true, rentalPlanSnapshot: true },
    });

    this.logger.log(`押金扣款申请已取消: orderId=${orderId}, deductionId=${dto.deductionId}, userId=${userId}`);

    return this.support.toOutputRentalOrderDto(updatedOrder);
  }

  // ======================== 后台管理员：争议押金扣除审核 ========================

  /**
   * 后台分页查询押金扣款列表（管理员）
   */
  async getAdminDeductionList(
    dto: QueryDepositDeductionAdminDto,
  ): Promise<{ data: DepositDeductionEntity[]; meta: PaginationMetaDto }> {
    const where: FindOptionsWhere<DepositDeductionEntity> = {};
    const whereList: FindOptionsWhere<DepositDeductionEntity>[] = [];
    if (dto.status != null) whereList.push({ status: dto.status });
    if (dto.keyword) {
      whereList.push({
        ...where,
        orderNo: Like(`%${dto.keyword}%`),
      });
      whereList.push({
        ...where,
        deductionNo: Like(`%${dto.keyword}%`),
      });
    }

    const meta = new PaginationMetaDto(dto.page, dto.pageSize);
    const [data, total] = await this.deductionRepo.findManyForAdmin(whereList, meta.skip, dto.pageSize, {
      lessor: true,
      lessee: true,
    });
    meta.total = total;
    data.forEach(item => {
      if (item.evidence) {
        item.evidence.urls = item.evidence?.urls?.map(url => this.ossService.getSignatureUrl(url));
      }
      if (item.userResponseEvidence) {
        item.userResponseEvidence.urls = item.userResponseEvidence?.urls?.map(url =>
          this.ossService.getSignatureUrl(url),
        );
      }
    });

    return { data, meta };
  }

  /**
   * 后台根据 ID 获取扣款详情（含押金，管理员）
   */
  async getAdminDeductionById(id: string): Promise<DepositDeductionEntity> {
    const deduction = await this.deductionRepo.findByIdWithDeposit(id);
    if (!deduction) {
      throw new NotFoundException('扣款记录不存在');
    }
    return deduction;
  }

  /**
   * 管理员审核争议押金扣除（通过则执行扣款并更新押金/订单/财务，拒绝则仅更新状态）
   *
   * 业务规则：
   * 1. 仅状态为【待审核】的扣款可被审核
   * 2. 通过：可指定认定金额（不传则用原申请金额），认定金额不得超过原申请金额与押金可用余额的较小值
   * 3. 通过后：扣款状态置为已执行，更新押金 deductedAmount/remainingAmount/status，同步订单押金状态，创建财务收入记录
   * 4. 拒绝：扣款状态置为平台已拒绝，记录审核说明
   * 5. 金额与数据一致性在单事务内完成
   */
  async reviewDepositDeductionByAdmin(
    deductionId: string,
    dto: ReviewDepositDeductionDto,
    auditorId: string,
    auditorName: string,
  ): Promise<DepositDeductionEntity> {
    const now = new Date();

    const result = await this.dataSource.transaction(async manager => {
      const deductionRepo = manager.getRepository(DepositDeductionEntity);
      const depositRepo = manager.getRepository(DepositEntity);
      const orderRepo = manager.getRepository(RentalOrderEntity);

      const deduction = await deductionRepo.findOne({
        where: { id: deductionId },
        relations: ['deposit'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!deduction) {
        throw new NotFoundException('扣款记录不存在');
      }

      if (deduction.status !== DepositDeductionStatus.PENDING_AUDIT) {
        throw new BadRequestException(`当前状态不允许审核，仅【待审核】可审核，当前：${deduction.statusLabel}`);
      }

      deduction.platformAuditedAt = now;
      deduction.platformAuditorId = auditorId;
      deduction.platformAuditorName = auditorName;
      deduction.platformAuditDescription = dto.auditDescription ?? undefined;

      // 拒绝
      if (!dto.approved) {
        deduction.status = DepositDeductionStatus.PLATFORM_REJECTED;
        await deductionRepo.save(deduction);
        this.logger.log(
          `管理员拒绝押金扣款: deductionId=${deductionId}, deductionNo=${deduction.deductionNo}, auditorId=${auditorId}`,
        );
        return deduction;
      }

      const deposit = deduction.deposit;
      if (!deposit) {
        throw new NotFoundException('关联押金不存在');
      }

      const depositLocked = await depositRepo.findOne({
        where: { id: deposit.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!depositLocked) {
        throw new NotFoundException('关联押金不存在');
      }

      const originalAmount = new Decimal(deduction.amount);
      const availableAmount = new Decimal(depositLocked.amount).minus(depositLocked.deductedAmount ?? 0);
      const approvedAmountDecimal = dto.approvedAmount != null ? new Decimal(dto.approvedAmount) : originalAmount;

      if (approvedAmountDecimal.lte(0)) {
        throw new BadRequestException('认定扣除金额必须大于 0');
      }
      if (approvedAmountDecimal.gt(originalAmount)) {
        throw new BadRequestException(`认定扣除金额不得超过原申请金额（${originalAmount.toNumber()} 元）`);
      }
      if (approvedAmountDecimal.gt(availableAmount)) {
        throw new BadRequestException(`认定扣除金额不得超过押金可用余额（${availableAmount.toNumber()} 元）`);
      }

      const approvedAmount = approvedAmountDecimal.toNumber();

      deduction.amount = approvedAmount;
      deduction.status = DepositDeductionStatus.EXECUTED;
      deduction.deductedAt = now;
      await deductionRepo.save(deduction);

      const newDeductedAmount = new Decimal(depositLocked.deductedAmount ?? 0).plus(approvedAmount);
      const newRemainingAmount = new Decimal(depositLocked.amount).minus(newDeductedAmount);

      depositLocked.deductedAmount = newDeductedAmount.toNumber();
      depositLocked.remainingAmount = Math.max(newRemainingAmount.toNumber(), 0);
      depositLocked.status = newRemainingAmount.lte(0) ? DepositStatus.FULLY_DEDUCTED : DepositStatus.PARTIAL_DEDUCTED;
      await depositRepo.save(depositLocked);

      await orderRepo.update({ id: deduction.orderId }, { depositStatus: depositLocked.status });

      await this.financeDepositService.handleDepositDeductionExecuted(deduction, manager);

      this.logger.log(
        `管理员审核通过并执行押金扣款: deductionId=${deductionId}, deductionNo=${deduction.deductionNo}, approvedAmount=${approvedAmount}, depositId=${depositLocked.id}, auditorId=${auditorId}`,
      );

      return deduction;
    });

    const order = await this.orderRepo.findById(result.orderId, {
      relations: { deposits: { deductions: true } },
    });

    if (result.status === DepositDeductionStatus.PLATFORM_REJECTED) {
      // 审核拒绝：通知出租方平台审核未通过
      if (order) {
        await this.messageNotificationService.notifyDepositDeductionPlatformRejected(order, result);
      }
    } else if (result.status === DepositDeductionStatus.EXECUTED && order) {
      // 审核通过并已执行：通知出租方扣款已确认，并发射信用事件（承租方负面）
      const deductionForNotify = order.deposits?.flatMap(d => d.deductions ?? []).find(d => d.id === deductionId);
      if (deductionForNotify) {
        await this.messageNotificationService.notifyDepositDeductionConfirmed(order, deductionForNotify);
      }
      this.eventEmitter.emit(CreditEvents.DEPOSIT_DEDUCTED, {
        userId: order.lesseeId,
        actorRole: CreditActorRole.LESSEE,
        orderId: order.id,
        deductionId: result.id,
        amount: Number(result.amount),
        operatorType: 'manual',
      } as DepositDeductedPayload);
    }

    return result;
  }
}
