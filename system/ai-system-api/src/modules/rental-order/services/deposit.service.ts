import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { DepositRepository, DepositDeductionRepository, RentalOrderRepository } from '../repositories';
import { DepositEntity, DepositDeductionEntity, RentalOrderEntity, RentalOrderEvidenceEntity } from '../entities';
import {
  DepositStatus,
  DepositFreeType,
  DepositDeductionStatus,
  EvidenceSubmitterType,
  EvidenceType,
  EvidenceAuditStatus,
} from '../enums';
import {
  CreateDepositDto,
  PayDepositDto,
  DeductDepositDto,
  CreateDepositDeductionDto,
  QueryDepositDto,
  OutputDepositDto,
  OutputPayDepositResultDto,
  OutputLesseeDepositSummaryDto,
} from '../dto';
import { SequenceNumberPrefix, SequenceNumberService, SequenceNumberType } from '@/infrastructure/sequence-number';
import { plainToInstance } from 'class-transformer';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';
import Decimal from 'decimal.js';
import { UserRepository } from '@/modules/base/user/repositories';
import { PaymentProvider } from '@/modules/base/payment/enums';
import { ConfigService } from '@nestjs/config';
import { SERVER_CONFIG_KEY, ServerConfig } from '@/config';
import { WxPayService } from '@/modules/base/payment/services';
import dayjs from 'dayjs';
import { RentalOrderJobService } from '../jobs/services';
import { MessageNotificationService } from '@/modules/base/message/services';

/**
 * 押金服务
 *
 * 提供押金创建、支付、扣款、解冻等业务逻辑
 */
@Injectable()
export class DepositService {
  private readonly logger = new Logger(DepositService.name);

  private readonly wxpayNotifyUrl: string;
  private readonly wxpayRefundDepositNotifyUrl: string;
  constructor(
    private readonly depositRepo: DepositRepository,
    private readonly deductionRepo: DepositDeductionRepository,
    private readonly orderRepo: RentalOrderRepository,
    private readonly dataSource: DataSource,
    private readonly sequenceNumberService: SequenceNumberService,
    private readonly userRepo: UserRepository,
    private readonly configService: ConfigService,
    private readonly wxPayService: WxPayService,
    private readonly rentalOrderJobService: RentalOrderJobService,
    private readonly messageNotificationService: MessageNotificationService,
  ) {
    const serverConfig = this.configService.get<ServerConfig>(SERVER_CONFIG_KEY)!;
    this.wxpayNotifyUrl = `${serverConfig.apiHost}${serverConfig.apiPrefix}/payment/wx-pay/notify`;
    this.wxpayRefundDepositNotifyUrl = `${serverConfig.apiHost}${serverConfig.apiPrefix}/payment/wx-pay/refund-deposit-notify`;
  }

  // 创建押金
  /**
   * 创建押金
   * @param dto 创建押金请求DTO
   * @param manager 可选的事务管理器，如果提供则在事务内执行
   * @returns 创建押金结果
   */
  async createDeposit(dto: CreateDepositDto, manager?: EntityManager): Promise<OutputDepositDto> {
    const depositRepo = manager ? manager.getRepository(DepositEntity) : this.depositRepo;
    const orderRepo = manager ? manager.getRepository(RentalOrderEntity) : this.orderRepo;

    // 1. 验证订单是否存在
    const order = await orderRepo.findOne({ where: { id: dto.orderId } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 2. 验证押金金额是否与订单一致
    if (new Decimal(dto.amount).toNumber() !== new Decimal(order.depositAmount).toNumber()) {
      throw new BadRequestException(`押金金额不匹配，订单押金金额：${order.depositAmount}元`);
    }

    // 3. 验证押金金额必须大于0
    if (new Decimal(dto.amount).lte(0)) {
      throw new BadRequestException('押金金额必须大于0');
    }

    // 4. 生成押金单号
    const depositNo = await this.sequenceNumberService.generate({
      businessType: SequenceNumberType.DEPOSIT,
      prefix: SequenceNumberPrefix.DEPOSIT,
    });

    // 5. 创建押金记录
    const deposit = depositRepo.create({
      depositNo,
      orderId: dto.orderId,
      orderNo: dto.orderNo,
      userId: dto.userId,
      lessorId: order.lessorId,
      amount: dto.amount,
      deductedAmount: 0,
      remainingAmount: dto.amount,
      freeType: dto.freeType || DepositFreeType.NONE,
      freeAuthNo: dto.freeAuthNo,
      freeAuthData: dto.freeAuthData,
      status: DepositStatus.PENDING,
      paymentProvider: dto.paymentProvider,
      rentalOrder: order,
      remark: dto.remark,
    });

    const savedDeposit = await depositRepo.save(deposit);

    // 6. 同步更新订单的押金状态为待支付
    await orderRepo.update({ id: dto.orderId }, { depositStatus: DepositStatus.PENDING });

    this.logger.log(`押金已创建: 押金单号=${depositNo}, 订单号=${dto.orderNo}, 金额=${dto.amount}`);

    return plainToInstance(OutputDepositDto, savedDeposit, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 支付押金（支持免押）
   *
   * 修复内容：
   * 1. 防止重复创建押金记录 - 先检查是否已存在押金记录
   * 2. 添加用户微信 OpenID 检查
   * 3. 使用数据库事务和悲观锁防止并发问题
   * 4. 支付调用失败后更新押金状态
   */
  async payDeposit(userId: string, order: RentalOrderEntity, dto: PayDepositDto): Promise<OutputPayDepositResultDto> {
    // 1. 验证用户是否存在并检查微信 OpenID
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 2. 验证押金金额必须大于0
    const depositAmount = Number(order.depositAmount);
    if (depositAmount <= 0) {
      throw new BadRequestException('押金金额必须大于0');
    }

    // 3. 检查支付方式并验证 OpenID（提前检查，避免进入事务后才发现问题）
    if (dto.provider === PaymentProvider.WECHAT && !user.wechatOpenid) {
      throw new BadRequestException('用户未绑定微信，无法使用微信支付');
    }

    // 4. 使用事务和悲观锁防止并发问题，检查/创建押金记录
    const depositNo = await this.dataSource.transaction(async manager => {
      // 4.1 使用悲观锁锁定订单，防止并发支付
      const orderWithLock = await manager.findOne(RentalOrderEntity, {
        where: { id: order.id },
        lock: { mode: 'pessimistic_write' },
        relations: { assetSnapshot: true },
      });

      if (!orderWithLock) {
        throw new NotFoundException('订单不存在');
      }

      // 4.2 检查订单押金状态（双重检查）
      if (orderWithLock.isDepositFrozenOrPaid) {
        this.logger.warn(
          `押金已支付或已冻结，跳过支付: orderId=${order.id}, depositStatus=${orderWithLock.depositStatus}`,
        );
        throw new BadRequestException('押金已支付，无需重复支付');
      }

      // 4.3 查询是否已存在押金记录（使用悲观锁）
      const existingDeposit = await manager.findOne(DepositEntity, {
        where: { orderId: order.id },
        lock: { mode: 'pessimistic_write' },
        order: { createdAt: 'DESC' },
      });

      // 已存在押金记录，检查状态
      if (existingDeposit) {
        if (existingDeposit.status === DepositStatus.PAYING) {
          this.logger.warn(
            `押金支付中，无需重复支付: depositId=${existingDeposit.id}, status=${existingDeposit.status}`,
          );
          throw new BadRequestException('押金支付中，无需重复支付');
        }

        if (existingDeposit.status === DepositStatus.PAID || existingDeposit.status === DepositStatus.FROZEN) {
          this.logger.warn(
            `押金已支付，无需重复支付: depositId=${existingDeposit.id}, status=${existingDeposit.status}`,
          );
          throw new BadRequestException('押金已支付，无需重复支付');
        }

        if (existingDeposit.status === DepositStatus.PENDING || existingDeposit.status === DepositStatus.FAILED) {
          // 待支付状态，使用已存在的押金记录继续支付
          this.logger.log(
            `使用已存在的押金记录继续支付: depositId=${existingDeposit.id}, depositNo=${existingDeposit.depositNo}`,
          );
          return existingDeposit.depositNo;
        } else {
          throw new BadRequestException(`押金状态异常，无法支付：${existingDeposit.status}`);
        }
      }

      // 4.4 不存在押金记录，创建新的
      const depositPlain: CreateDepositDto = {
        orderId: order.id,
        orderNo: order.orderNo,
        userId: userId,
        amount: depositAmount,
        paymentProvider: dto.provider,
      };

      // TODO 支付宝支付押金
      if (dto.provider === PaymentProvider.ALIPAY) {
        if (orderWithLock.assetSnapshot.creditFreeDeposit) {
          // TODO 调用支付宝的免押逻辑
        } else {
          // TODO 调用支付宝支付
        }
        throw new BadRequestException('支付宝支付暂不支持支付押金');
      }

      // 微信支付押金
      if (dto.provider === PaymentProvider.WECHAT) {
        if (orderWithLock.assetSnapshot.creditFreeDeposit) {
          // TODO 调用微信的免押逻辑
          throw new BadRequestException('押金免押暂不支持支付');
        } else {
          // 在事务内创建押金记录
          const createdDeposit = await this.createDeposit(plainToInstance(CreateDepositDto, depositPlain), manager);
          return createdDeposit.depositNo;
        }
      }
      throw new BadRequestException('不支持的支付方式');
    });

    // 5. 事务提交后，查询押金记录并调用支付接口
    // const deposit = await this.depositRepo.findByDepositNo(depositNo);

    // 6. 调用微信支付（在事务外调用，避免长时间占用数据库连接）
    if (dto.provider === PaymentProvider.WECHAT) {
      try {
        const result = await this.wxPayService.jsApiPay({
          amount: {
            total: new Decimal(depositAmount).mul(100).toNumber(),
            currency: 'CNY',
          },
          description: `${order.assetSnapshot.name} 押金`,
          out_trade_no: depositNo,
          attach: JSON.stringify({
            type: 'deposit',
            amount: depositAmount,
            orderNo: order.orderNo,
          } as WxPay.WxPayAttach),
          payer: {
            openid: user.wechatOpenid!,
          },
          notify_url: this.wxpayNotifyUrl,
        });

        this.logger.log(`押金支付请求已创建: depositNo=${depositNo}, orderNo=${order.orderNo}`);

        await this.depositRepo.update(
          { depositNo: depositNo },
          {
            status: DepositStatus.PAYING,
          },
        );

        return plainToInstance(
          OutputPayDepositResultDto,
          { wxJsapiPay: result },
          { excludeExtraneousValues: true, exposeDefaultValues: true },
        );
      } catch (error) {
        // 支付调用失败，更新押金状态为失败
        await this.depositRepo.update(
          { depositNo: depositNo },
          {
            status: DepositStatus.FAILED,
            paymentFailureReason: error instanceof Error ? error.message : '支付调用失败',
          },
        );
        const errorMessage = error instanceof Error ? error.message : '支付调用失败';
        this.logger.error(`押金支付调用失败: depositNo=${depositNo}, error=${errorMessage}`);
        throw new BadRequestException(`支付调用失败：${errorMessage}`);
      }
    }

    throw new BadRequestException('不支持的支付方式');
  }

  /**
   * 创建押金扣款申请
   *
   * 出租方发起押金扣款申请
   * - 申请提交后，押金扣款记录状态为【待审核】
   * - 必须提交扣款说明，且至少提供一项凭证（图片/视频/文件）
   *
   * @param userId 用户 ID（出租方）
   * @param depositId 押金 ID
   * @param orderId 订单 ID
   * @param dto 扣款申请 DTO
   */
  async createDepositDeduction(
    userId: string,
    depositId: string,
    orderId: string,
    dto: CreateDepositDeductionDto,
  ): Promise<void> {
    // 1. 查询押金记录
    const deposit = await this.depositRepo.findById(depositId, {
      relations: { rentalOrder: true },
    });

    if (!deposit) {
      throw new NotFoundException('押金记录不存在');
    }

    // 2. 验证押金状态：只有已冻结或已支付的押金才能扣款
    if (![DepositStatus.FROZEN, DepositStatus.PAID, DepositStatus.PARTIAL_DEDUCTED].includes(deposit.status)) {
      throw new BadRequestException(`押金状态不允许扣款，当前状态：${deposit.statusLabel}`);
    }

    // 3. 验证凭证：必须至少提供一项凭证（图片/视频/文件）
    if (!dto.evidenceUrls || dto.evidenceUrls.length === 0) {
      throw new BadRequestException('必须至少提供一项凭证（图片/视频/文件）');
    }

    // 4. 查询用户信息（用于记录申请提交人）
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 5. 查询订单信息（用于创建凭证）
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 6. 在事务内创建扣款申请记录和凭证
    const deductionId = await this.dataSource.transaction(async manager => {
      // 6.1 生成扣款单号
      const deductionNo = await this.sequenceNumberService.generate({
        businessType: SequenceNumberType.DEPOSIT_DEDUCTION,
        prefix: SequenceNumberPrefix.DEPOSIT_DEDUCTION,
      });

      // 6.2 计算超时时间（申请提交后72小时）
      const appliedAt = new Date();
      const timeoutAt = dayjs(appliedAt).add(72, 'hour').toDate();

      // 6.3 创建扣款申请记录
      const deduction = manager.getRepository(DepositDeductionEntity).create({
        deductionNo,
        depositId: deposit.id,
        depositNo: deposit.depositNo,
        orderId: orderId,
        orderNo: deposit.orderNo,
        amount: dto.amount, // amount 是 decimal 类型，可以直接赋值 number
        reason: dto.reason,
        description: dto.description,
        status: DepositDeductionStatus.PENDING_USER_CONFIRM,
        appliedAt,
        timeoutAt,
        lesseeId: deposit.userId,
        lessorId: userId,
        lessorName: user.profile?.realName || user.username || user.profile?.nickname,
        // 保存凭证信息到 evidence 字段（JSON格式）
        evidence: {
          urls: dto.evidenceUrls,
          description: dto.description,
        },
      });

      const savedDeduction = await manager.save(DepositDeductionEntity, deduction);

      // 6.4 创建凭证记录
      const evidence = manager.getRepository(RentalOrderEvidenceEntity).create({
        rentalOrderId: orderId,
        rentalOrderNo: deposit.orderNo,
        submitterId: userId,
        submitterType: EvidenceSubmitterType.LESSOR,
        evidenceType: EvidenceType.DEPOSIT_DEDUCTION,
        evidenceUrls: dto.evidenceUrls,
        description: dto.description,
        relatedOrderStatus: order.useageStatus,
        auditStatus: EvidenceAuditStatus.PENDING,
      });

      await manager.save(RentalOrderEvidenceEntity, evidence);

      this.logger.log(
        `押金扣款申请已创建: deductionNo=${deductionNo}, depositId=${depositId}, orderId=${orderId}, amount=${dto.amount}, evidenceCount=${dto.evidenceUrls.length}`,
      );

      // 6.5 添加押金扣款超时任务（72小时后如果未响应，触发平台审核）
      // 注意：在事务外执行，避免长时间占用数据库连接
      // 使用 savedDeduction.id 确保获取到已保存的实体ID
      setImmediate(() => {
        this.rentalOrderJobService
          .addDepositDeductionTimeoutJob(
            savedDeduction.id,
            deductionNo,
            orderId,
            deposit.orderNo,
            deposit.id,
            timeoutAt,
          )
          .catch(err => {
            this.logger.error(
              `添加押金扣款超时任务失败: deductionId=${savedDeduction.id}, deductionNo=${deductionNo}, error=${err instanceof Error ? err.message : '未知错误'}`,
            );
          });
      });

      // 返回deductionId用于事务外发送消息
      return savedDeduction.id;
    });

    // 事务提交后，查询并发送消息（确保数据已持久化）
    const deduction = await this.deductionRepo.findOne({ where: { id: deductionId } });
    if (deduction) {
      await this.messageNotificationService.notifyDepositDeductionApplied(order, deduction);
    }
  }

  // 解冻押金（退还押金）
  /**
   * 解冻押金（退还押金）
   * @param depositId 押金ID
   * @param operatorId 操作人ID
   * @param operatorName 操作人名称
   * @returns 解冻后的押金DTO
   */
  async unfreezeDeposit(depositId: string, operatorId?: string, operatorName?: string) {
    // 1. 查找押金记录
    const deposit = await this.depositRepo.findById(depositId);

    if (deposit.status !== DepositStatus.FROZEN && deposit.status !== DepositStatus.PARTIAL_DEDUCTED) {
      throw new BadRequestException('押金状态不正确，无法解冻');
    }

    // return this.dataSource.transaction(async manager => {
    //   return this.unfreezeDepositWithManager(deposit, operatorId, operatorName, manager);
    // });
  }

  /**
   * 根据订单 ID 获取押金
   */
  async getDepositByOrderId(orderId: string): Promise<OutputDepositDto | null> {
    const deposit = await this.depositRepo.findByOrderId(orderId);
    if (!deposit) {
      return null;
    }

    return plainToInstance(OutputDepositDto, deposit, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 根据 ID 获取押金
   */
  async getDepositById(id: string, userId?: string): Promise<OutputDepositDto | null> {
    const deposit = await this.depositRepo.findById(id);

    if (userId && deposit.userId !== userId) {
      throw new BadRequestException('无权查看此押金记录');
    }

    return plainToInstance(OutputDepositDto, deposit, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 查询押金列表
   */
  async queryDeposits(
    userId: string,
    dto: QueryDepositDto,
  ): Promise<{ data: OutputDepositDto[]; meta: PaginationMetaDto }> {
    const where: any = { userId };

    const meta = new PaginationMetaDto(dto.page, dto.pageSize);

    if (dto.orderId) {
      where.orderId = dto.orderId;
    }
    if (dto.orderNo) {
      where.orderNo = dto.orderNo;
    }
    if (dto.status) {
      where.status = dto.status;
    }

    const [deposits, total] = await this.depositRepo.findMany(where, meta.skip, dto.pageSize);

    const data = plainToInstance(OutputDepositDto, deposits, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });

    meta.total = total;

    return { data, meta };
  }

  /**
   * 获取押金扣款记录列表
   */
  async getDeductions(depositId: string): Promise<DepositDeductionEntity[]> {
    return this.deductionRepo.findByDepositId(depositId);
  }

  /**
   * 获取承租方押金汇总数据
   *
   * 在数据库层完成聚合（SQL），减少内存占用与网络传输：
   * - 当前冻结押金总额
   * - 当前已扣除总额
   * - 累计退还金额
   * - 可释放金额（已归还未退还）
   */
  async getLesseeDepositSummary(userId: string): Promise<OutputLesseeDepositSummaryDto> {
    const row = await this.depositRepo.findByUserIdSummary(userId);

    return plainToInstance(
      OutputLesseeDepositSummaryDto,
      {
        frozenDepositTotal: Number(row.frozenDepositTotal),
        deductedTotal: Number(row.deductedTotal),
        refundedTotal: Number(row.refundedTotal),
        releasableAmount: Number(row.releasableAmount),
        orderCount: Number(row.orderCount),
      },
      { excludeExtraneousValues: true, exposeDefaultValues: true },
    );
  }

  // ======================================  退款相关  ===========================================
  //在订单取消时处理押金退款和解冻
  /**
   * 在订单取消时处理押金退款和解冻
   *
   * 业务逻辑：
   * 1. 如果押金状态为 FROZEN（已冻结），需要解冻
   * 2. 如果押金状态为 PAID（已支付），需要解冻（退款通过支付系统处理）
   * 3. 如果押金状态为 PARTIAL_DEDUCTED（部分扣除），需要解冻剩余部分（不退款已扣除部分）
   * 4. 更新订单的押金状态
   *
   * @param order 订单实体
   * @param cancelReason 取消原因
   * @param manager 事务管理器（需要在外部事务中执行）
   */
  async handleDepositRefundOrUnfreeze(deposits: DepositEntity[], cancelReason: string, manager: any): Promise<void> {
    // 处理每个押金记录（理论上一个订单只有一个押金）
    for (const deposit of deposits) {
      const depositStatus = deposit.status;

      const logMessage = `depositId=${deposit.id}, depositNo=${deposit.depositNo}, orderNo=${deposit.orderNo}`;

      const isNeedUnfreeze = [DepositStatus.FROZEN, DepositStatus.PAID, DepositStatus.PARTIAL_DEDUCTED].includes(
        depositStatus,
      );
      if (isNeedUnfreeze) {
        try {
          if (deposit.freeType === DepositFreeType.NONE) {
            // 押金退款
            await this.refundDepositWithManager(deposit, manager, `押金退款: ${cancelReason}`);
            this.logger.log(`押金退款成功: ${logMessage}`);
          } else {
            // TODO 押金解冻 待接入
            await this.unfreezeDepositWithManager(deposit, manager, `押金解冻: ${cancelReason}`);
            this.logger.log(`押金解冻成功: ${logMessage}`);
          }
        } catch (error) {
          this.logger.error(`押金解冻失败: ${logMessage}, error=${error}`);
          // throw error;
        }
      }
      // 押金已全部扣除 - 不需要处理
      else if (depositStatus === DepositStatus.FULLY_DEDUCTED) {
        this.logger.log(`押金已全部扣除，无需处理: ${logMessage}`);
      }
    }
  }

  // ======================================  Private Methods  ===========================================

  // TODO 押金解冻
  /**
   * 押金解冻
   * @param deposit 押金实体
   * @param manager 事务管理器
   * @returns 解冻结果
   */
  private async unfreezeDepositWithManager(deposit: DepositEntity, manager: EntityManager, remark: string) {
    if (deposit.freeType === DepositFreeType.WECHAT) {
      // TODO 微信解冻待接入
      deposit.status = DepositStatus.UNFROZEN;
      throw new BadRequestException('押金免押解冻待接入');
    } // 支付宝解冻
    else if (deposit.freeType === DepositFreeType.ALIPAY) {
      // TODO 支付宝解冻待接入
      deposit.status = DepositStatus.UNFROZEN;
      throw new BadRequestException('押金免押解冻待接入');
    } else {
      throw new BadRequestException('不支持的支付方式');
    }
  }

  // 押金退款
  /**
   * 押金退款（异步模式）
   *
   * 业务逻辑：
   * 1. 生成退款单号
   * 2. 调用微信退款API（异步，通过回调处理最终状态）
   * 3. 根据初始响应更新押金状态
   * 4. 保存押金信息
   * 5. 后续通过回调更新最终状态
   *
   * @param deposit 押金实体
   * @param manager 事务管理器
   * @param remark 退款备注
   * @returns 退款结果
   */
  private async refundDepositWithManager(
    deposit: DepositEntity,
    manager: EntityManager,
    remark: string,
  ): Promise<void> {
    // 调用微信支付进行退款
    if (deposit.paymentProvider === PaymentProvider.WECHAT) {
      // 1. 生成退款单号
      deposit.refundNo = await this.sequenceNumberService.generate({
        businessType: SequenceNumberType.DEPOSIT_REFUND,
        prefix: SequenceNumberPrefix.DEPOSIT_REFUND,
      });

      // 2. 计算退款金额（押金总额 - 已扣除金额）
      const refundAmount = new Decimal(deposit.amount).minus(deposit.deductedAmount);

      // 3. 调用微信退款API（异步，通过回调处理最终状态）
      try {
        const result = await this.wxPayService.jsApiRefund({
          transaction_id: deposit.thirdPartyPaymentNo,
          out_refund_no: deposit.refundNo,
          amount: {
            total: new Decimal(deposit.amount).mul(100).toNumber(),
            refund: refundAmount.mul(100).toNumber(),
            currency: 'CNY',
          },
          reason: remark,
          notify_url: this.wxpayRefundDepositNotifyUrl,
        });

        // 4. 保存初始响应数据
        deposit.refundCallbackData = result;
        deposit.thirdPartyRefundNo = result.refund_id;

        // 5. 根据初始响应更新状态
        // 注意：微信退款API的初始响应可能返回 SUCCESS 或 PROCESSING
        // 最终状态需要通过回调确认，这里先设置为 RETURNED（已退还）
        // 如果后续回调失败，会在 payment.service 中更新状态
        deposit.status = DepositStatus.REFUNDING;
        deposit.remark = remark;
        deposit.unfrozenAt = new Date();
        await manager.save(DepositEntity, deposit);
        this.logger.log(
          `押金退款请求已提交: depositNo=${deposit.depositNo}, refundNo=${deposit.refundNo}, refundId=${result.refund_id}, status=${result.status}`,
        );
      } catch (error) {
        // 退款API调用失败，更新状态为失败
        deposit.status = DepositStatus.FAILED;
        deposit.remark = remark;
        deposit.paymentFailureReason = error instanceof Error ? error.message : '退款调用失败';
        this.logger.error(
          `押金退款调用失败: depositNo=${deposit.depositNo}, refundNo=${deposit.refundNo}, error=${error instanceof Error ? error.message : '未知错误'}`,
        );
      }

      // 6. 保存押金信息
      await manager.save(DepositEntity, deposit);
      return;
    } // 调用支付宝支付进行退款
    else if (deposit.paymentProvider === PaymentProvider.ALIPAY) {
      // TODO 调用支付宝支付进行退款
      throw new BadRequestException('支付宝退款待接入');
    } else {
      throw new BadRequestException('不支持的支付方式');
    }
  }
}
