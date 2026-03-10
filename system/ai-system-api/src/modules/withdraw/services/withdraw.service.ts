import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import Decimal from 'decimal.js';
import { WithdrawOrderEntity } from '../entities/withdraw-order.entity';
import { WithdrawOrderRepository } from '../repositories/withdraw-order.repository';
import { MerchantAccountService } from './merchant-account.service';
import { CreateWithdrawDto } from '../dto/create-withdraw.dto';
import { ReviewWithdrawDto } from '../dto/review-withdraw.dto';
import { OutputWithdrawOrderDto } from '../dto/output-withdraw.dto';
import { OutputMerchantAccountDto } from '../dto/output-merchant-account.dto';
import { QueryWithdrawDto } from '../dto/query-withdraw.dto';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';
import {
  WithdrawOrderStatus,
  WITHDRAW_CANCELABLE_STATUSES,
  WITHDRAW_REVIEW_STATUSES,
} from '../enums/withdraw-order-status.enum';
import { WithdrawChannel } from '../enums';
import { WITHDRAW_CONFIG_KEY, WithdrawConfig } from '@/config';
import { SequenceNumberService } from '@/infrastructure/sequence-number/sequence-number.service';
import { SequenceNumberType, SequenceNumberPrefix } from '@/infrastructure/sequence-number/sequence-number.enum';
import { LockService, LOCK_PREFIX } from '@/infrastructure/redis/lock.service';
import { UserRepository } from '@/modules/base/user/repositories/user.repository';
import { WithdrawJobService } from './withdraw-job.service';

@Injectable()
export class WithdrawService {
  private readonly logger = new Logger(WithdrawService.name);

  constructor(
    private readonly withdrawOrderRepo: WithdrawOrderRepository,
    private readonly withdrawJobService: WithdrawJobService,
    private readonly merchantAccountService: MerchantAccountService,
    private readonly sequenceNumberService: SequenceNumberService,
    private readonly lockService: LockService,
    private readonly userRepo: UserRepository,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  private get withdrawConfig(): WithdrawConfig {
    return this.configService.get<WithdrawConfig>(WITHDRAW_CONFIG_KEY)!;
  }

  /**
   * 获取商家账户余额（同步后）
   */
  async getAccount(merchantId: string): Promise<OutputMerchantAccountDto> {
    const account = await this.merchantAccountService.getOrCreateAndSync(merchantId);
    return plainToInstance(OutputMerchantAccountDto, account, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 商家申请提现
   */
  async applyWithdraw(merchantId: string, dto: CreateWithdrawDto): Promise<OutputWithdrawOrderDto> {
    const amountStr = new Decimal(dto.amount).toFixed(2);

    const user = await this.userRepo.findById(merchantId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    if (!user.isVerified) {
      throw new ForbiddenException('请先完成实名认证或企业认证后再申请提现');
    }

    const existing = await this.withdrawOrderRepo.findByIdempotencyKey(dto.idempotencyKey);
    if (existing) {
      this.logger.warn(`幂等键已存在，返回已有订单: idempotencyKey=${dto.idempotencyKey}`);
      return plainToInstance(OutputWithdrawOrderDto, existing, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      });
    }

    const config = this.withdrawConfig;
    const amountDec = new Decimal(amountStr);

    if (amountDec.lt(config.minAmountPerOrder)) {
      throw new BadRequestException(`单笔最低提现金额为 ${config.minAmountPerOrder} 元`);
    }
    if (amountDec.gt(config.maxAmountPerOrder)) {
      throw new BadRequestException(`单笔最高提现金额为 ${config.maxAmountPerOrder} 元`);
    }

    const account = await this.merchantAccountService.getOrCreateAndSync(merchantId);
    const available = new Decimal(account.availableBalance);
    if (available.lt(amountDec)) {
      throw new BadRequestException(`可提现余额不足，当前可提现：${available.toNumber()} 元`);
    }

    const [todayCount, todaySum] = await Promise.all([
      this.withdrawOrderRepo.countTodayByMerchantId(merchantId),
      this.withdrawOrderRepo.sumTodayAmountByMerchantId(merchantId),
    ]);

    if (todayCount >= config.maxCountPerDay) {
      throw new BadRequestException(`单日提现次数已达上限（${config.maxCountPerDay} 次）`);
    }
    const todaySumDec = new Decimal(todaySum);
    if (todaySumDec.plus(amountDec).gt(config.maxAmountPerDay)) {
      throw new BadRequestException(
        `单日提现限额不足，今日已提现 ${todaySumDec.toNumber()} 元，限额 ${config.maxAmountPerDay} 元`,
      );
    }

    const withdrawNo = await this.sequenceNumberService.generate({
      businessType: SequenceNumberType.WITHDRAW_ORDER,
      prefix: SequenceNumberPrefix.WITHDRAW_ORDER,
    });

    const fee = '0';
    const actualAmount = new Decimal(amountStr).minus(fee).toFixed(2);

    let targetAccount = dto.targetAccount?.trim();
    if (dto.withdrawChannel === WithdrawChannel.BANK) {
      if (!dto.targetAccount?.trim()) {
        throw new BadRequestException('选择银行卡提现时，银行卡号不能为空');
      }
      targetAccount = dto.targetAccount;
    } else if (dto.withdrawChannel === WithdrawChannel.WECHAT) {
      targetAccount = user.wechatOpenid ?? undefined;
      if (!targetAccount) {
        throw new BadRequestException('请先绑定微信或填写提现账户');
      }
    } else if (dto.withdrawChannel === WithdrawChannel.ALIPAY) {
      targetAccount = user.alipayOpenid ?? undefined;
      if (!targetAccount) {
        throw new BadRequestException('请先绑定支付宝或填写提现账户');
      }
    }

    const order = this.withdrawOrderRepo.create({
      withdrawNo,
      merchantId,
      amount: amountStr,
      fee,
      actualAmount,
      status: WithdrawOrderStatus.PENDING,
      withdrawChannel: dto.withdrawChannel,
      targetAccount: targetAccount ?? undefined,
      bankBranchAddress: dto.bankBranchAddress,
      idempotencyKey: dto.idempotencyKey,
      requestedAt: new Date(),
    });

    const saved = await this.withdrawOrderRepo.save(order);
    this.logger.log(`提现申请成功: withdrawNo=${withdrawNo}, merchantId=${merchantId}, amount=${amountStr}`);

    return plainToInstance(OutputWithdrawOrderDto, saved, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 商户主动取消（PENDING/REVIEWING 时）
   */
  async cancelByMerchant(merchantId: string, withdrawOrderId: string): Promise<OutputWithdrawOrderDto> {
    const order = await this.withdrawOrderRepo.findOne({
      where: { id: withdrawOrderId, merchantId },
    });

    if (!order) {
      throw new NotFoundException('提现单不存在或无权操作');
    }

    if (!WITHDRAW_CANCELABLE_STATUSES.includes(order.status)) {
      throw new BadRequestException(`当前状态不可取消，仅待审核/审核中时可取消`);
    }

    order.status = WithdrawOrderStatus.CANCELED;
    await this.withdrawOrderRepo.save(order);

    this.logger.log(`商户取消提现: withdrawNo=${order.withdrawNo}, merchantId=${merchantId}`);

    return plainToInstance(OutputWithdrawOrderDto, order, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 后台审核：通过 / 拒绝
   */
  async reviewWithdraw(withdrawOrderId: string, dto: ReviewWithdrawDto): Promise<OutputWithdrawOrderDto> {
    const order = await this.withdrawOrderRepo.findOne({ where: { id: withdrawOrderId } });
    if (!order) {
      throw new NotFoundException('提现单不存在');
    }

    if (!WITHDRAW_REVIEW_STATUSES.includes(order.status)) {
      throw new BadRequestException(`当前状态不可审核，仅待审核/审核中时可审核`);
    }

    if (dto.approved) {
      const lockKey = this.lockService.buildLockKey(LOCK_PREFIX.WITHDRAW_APPROVE, order.merchantId);
      const result = await this.lockService.withLock(
        lockKey,
        async () => {
          return this.dataSource.transaction(async manager => {
            const orderInTx = await manager.findOne(WithdrawOrderEntity, {
              where: { id: withdrawOrderId },
            });
            if (!orderInTx || !WITHDRAW_REVIEW_STATUSES.includes(orderInTx.status)) {
              throw new BadRequestException('提现单状态已变更，请重试');
            }

            await this.merchantAccountService.applyWithdrawDeduction(
              orderInTx.merchantId,
              orderInTx.amount,
              orderInTx.id,
              orderInTx.idempotencyKey,
              manager,
            );

            orderInTx.status = WithdrawOrderStatus.APPROVED;
            orderInTx.reviewedAt = new Date();
            await manager.save(WithdrawOrderEntity, orderInTx);

            this.logger.log(`提现审核通过: withdrawNo=${orderInTx.withdrawNo}, amount=${orderInTx.amount}`);

            return orderInTx;
          });
        },
        { ttlSeconds: 30 },
      );

      await this.withdrawJobService.addProcessJob(result.id);

      return plainToInstance(OutputWithdrawOrderDto, result, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      });
    } else {
      if (!dto.rejectReason?.trim()) {
        throw new BadRequestException('审核拒绝时请填写拒绝原因');
      }

      order.status = WithdrawOrderStatus.REJECTED;
      order.rejectReason = dto.rejectReason;
      order.reviewedAt = new Date();
      await this.withdrawOrderRepo.save(order);

      this.logger.log(`提现审核拒绝: withdrawNo=${order.withdrawNo}, reason=${dto.rejectReason}`);

      return plainToInstance(OutputWithdrawOrderDto, order, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      });
    }
  }

  /**
   * 查询商家提现订单列表
   */
  async findPageList(
    merchantId: string,
    dto: QueryWithdrawDto,
  ): Promise<{ data: OutputWithdrawOrderDto[]; meta: PaginationMetaDto }> {
    const pagination = new PaginationMetaDto(dto.page, dto.pageSize);
    const [list, total] = await this.withdrawOrderRepo.findByMerchantId(merchantId, {
      status: dto.status,
      withdrawChannel: dto.withdrawChannel,
      skip: pagination.skip,
      take: pagination.pageSize,
    });
    pagination.total = total;
    const data = plainToInstance(OutputWithdrawOrderDto, list, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
    return { data, meta: pagination };
  }

  /**
   * 查询提现单详情
   */
  async getById(merchantId: string, withdrawOrderId: string): Promise<OutputWithdrawOrderDto> {
    const order = await this.withdrawOrderRepo.findOne({
      where: { id: withdrawOrderId, merchantId },
    });
    if (!order) {
      throw new NotFoundException('提现单不存在');
    }
    return plainToInstance(OutputWithdrawOrderDto, order, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }
}
