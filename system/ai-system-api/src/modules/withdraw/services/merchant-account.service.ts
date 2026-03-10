import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import Decimal from 'decimal.js';
import { MerchantAccountRepository } from '../repositories/merchant-account.repository';
import { WithdrawOrderRepository } from '../repositories/withdraw-order.repository';
import { MerchantAccountEntity } from '../entities/merchant-account.entity';
import { AccountFlowEntity } from '../entities/account-flow.entity';
import { AccountFlowType, BalanceType, AccountFlowRelatedType } from '../enums';
import { FinanceRepository } from '@/modules/finance/repositories/finance.repository';
import { SequenceNumberService } from '@/infrastructure/sequence-number/sequence-number.service';
import { SequenceNumberType, SequenceNumberPrefix } from '@/infrastructure/sequence-number/sequence-number.enum';
import { WithdrawOrderStatus } from '../enums/withdraw-order-status.enum';

@Injectable()
export class MerchantAccountService {
  private readonly logger = new Logger(MerchantAccountService.name);

  constructor(
    private readonly merchantAccountRepo: MerchantAccountRepository,
    private readonly withdrawOrderRepo: WithdrawOrderRepository,
    private readonly financeRepo: FinanceRepository,
    private readonly sequenceNumberService: SequenceNumberService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 从 LessorFinance 同步并获取商家账户
   * 用于首次提现或需要最新余额时
   */
  async getOrCreateAndSync(merchantId: string): Promise<MerchantAccountEntity> {
    const [creditedIncome, withdrawnSum, refundedRentSum, withdrawFrozenSum, withdrawCompletedSum] = await Promise.all([
      this.financeRepo.calculateCreditedIncomeSum(merchantId),
      this.financeRepo.calculateWithdrawnSum(merchantId),
      this.financeRepo.calculateRefundedRentRefundSum(merchantId),
      this.withdrawOrderRepo
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.amount), 0)', 'total')
        .where('order.merchantId = :merchantId', { merchantId })
        .andWhere('order.status IN (:...statuses)', {
          statuses: [WithdrawOrderStatus.APPROVED, WithdrawOrderStatus.PROCESSING],
        })
        .getRawOne<{ total: string }>()
        .then(r => r?.total || '0'),
      this.withdrawOrderRepo
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.amount), 0)', 'total')
        .where('order.merchantId = :merchantId', { merchantId })
        .andWhere('order.status = :status', { status: WithdrawOrderStatus.COMPLETED })
        .getRawOne<{ total: string }>()
        .then(r => r?.total || '0'),
    ]);

    const availableBase = new Decimal(creditedIncome)
      .minus(withdrawnSum)
      .minus(refundedRentSum)
      .minus(withdrawCompletedSum);
    const withdrawFrozen = new Decimal(withdrawFrozenSum);
    const availableBalance = Decimal.max(0, availableBase.minus(withdrawFrozen));

    let account = await this.merchantAccountRepo.findByMerchantId(merchantId);
    if (!account) {
      account = this.merchantAccountRepo.create({
        merchantId,
        totalBalance: availableBase.toString(),
        frozenBalance: withdrawFrozen.toString(),
        availableBalance: availableBalance.toString(),
      });
      account = await this.merchantAccountRepo.save(account);
      this.logger.log(`创建商家账户: merchantId=${merchantId}, available=${availableBalance.toNumber()}`);
    } else {
      account.totalBalance = availableBase.toString();
      account.frozenBalance = withdrawFrozen.toString();
      account.availableBalance = availableBalance.toString();
      await this.merchantAccountRepo.save(account);
    }
    return account;
  }

  /**
   * 审核通过：扣减 available，增加 frozen
   * 必须在事务内 + 行级锁
   */
  async applyWithdrawDeduction(
    merchantId: string,
    amount: string,
    withdrawOrderId: string,
    idempotencyKey: string,
    manager: EntityManager,
  ): Promise<void> {
    const accountRepo = manager.getRepository(MerchantAccountEntity);
    const account = await accountRepo
      .createQueryBuilder('account')
      .where('account.merchantId = :merchantId', { merchantId })
      .setLock('pessimistic_write')
      .getOne();

    if (!account) {
      throw new BadRequestException(`商家账户不存在: merchantId=${merchantId}`);
    }

    const available = new Decimal(account.availableBalance);
    const amountDec = new Decimal(amount);
    if (available.lt(amountDec)) {
      throw new BadRequestException(`可提现余额不足: available=${available.toNumber()}, amount=${amount}`);
    }

    const availableAfter = available.minus(amountDec);
    const frozenAfter = new Decimal(account.frozenBalance).plus(amountDec);
    const availableBefore = account.availableBalance;
    const frozenBefore = account.frozenBalance;

    account.availableBalance = availableAfter.toString();
    account.frozenBalance = frozenAfter.toString();
    await accountRepo.save(account);

    await this.writeAccountFlow(manager, {
      merchantId,
      amount: `-${amount}`,
      type: AccountFlowType.WITHDRAW_APPLY,
      balanceType: BalanceType.AVAILABLE,
      balanceBefore: availableBefore,
      balanceAfter: availableAfter.toString(),
      relatedType: AccountFlowRelatedType.WITHDRAW,
      relatedId: withdrawOrderId,
      idempotencyKey: `${idempotencyKey}:available`,
    });

    await this.writeAccountFlow(manager, {
      merchantId,
      amount,
      type: AccountFlowType.WITHDRAW_APPLY,
      balanceType: BalanceType.FROZEN,
      balanceBefore: frozenBefore,
      balanceAfter: frozenAfter.toString(),
      relatedType: AccountFlowRelatedType.WITHDRAW,
      relatedId: withdrawOrderId,
      idempotencyKey: `${idempotencyKey}:frozen`,
    });
  }

  /**
   * 打款成功：扣减 frozen
   */
  async onWithdrawSuccess(
    merchantId: string,
    amount: string,
    withdrawOrderId: string,
    idempotencyKey: string,
    manager: EntityManager,
  ): Promise<void> {
    const accountRepo = manager.getRepository(MerchantAccountEntity);
    const account = await accountRepo
      .createQueryBuilder('account')
      .where('account.merchantId = :merchantId', { merchantId })
      .setLock('pessimistic_write')
      .getOne();

    if (!account) {
      throw new BadRequestException(`商家账户不存在: merchantId=${merchantId}`);
    }

    const frozenBefore = new Decimal(account.frozenBalance);
    const amountDec = new Decimal(amount);
    const frozenAfter = Decimal.max(0, frozenBefore.minus(amountDec));

    const totalBefore = new Decimal(account.totalBalance);
    const totalAfter = totalBefore.minus(amountDec);

    account.frozenBalance = frozenAfter.toString();
    account.totalBalance = totalAfter.toString();
    await accountRepo.save(account);

    await this.writeAccountFlow(manager, {
      merchantId,
      amount: `-${amount}`,
      type: AccountFlowType.WITHDRAW_SUCCESS,
      balanceType: BalanceType.FROZEN,
      balanceBefore: frozenBefore.toString(),
      balanceAfter: frozenAfter.toString(),
      relatedType: AccountFlowRelatedType.WITHDRAW,
      relatedId: withdrawOrderId,
      idempotencyKey: `${idempotencyKey}:success`,
    });
  }

  /**
   * 打款失败：frozen 减少，available 增加
   */
  async onWithdrawFail(
    merchantId: string,
    amount: string,
    withdrawOrderId: string,
    idempotencyKey: string,
    manager: EntityManager,
  ): Promise<void> {
    const accountRepo = manager.getRepository(MerchantAccountEntity);
    const account = await accountRepo
      .createQueryBuilder('account')
      .where('account.merchantId = :merchantId', { merchantId })
      .setLock('pessimistic_write')
      .getOne();

    if (!account) {
      throw new BadRequestException(`商家账户不存在: merchantId=${merchantId}`);
    }

    const frozenBefore = new Decimal(account.frozenBalance);
    const availableBefore = new Decimal(account.availableBalance);
    const amountDec = new Decimal(amount);

    const frozenAfter = Decimal.max(0, frozenBefore.minus(amountDec));
    const availableAfter = availableBefore.plus(amountDec);

    account.frozenBalance = frozenAfter.toString();
    account.availableBalance = availableAfter.toString();
    await accountRepo.save(account);

    await this.writeAccountFlow(manager, {
      merchantId,
      amount: `-${amount}`,
      type: AccountFlowType.WITHDRAW_FAIL,
      balanceType: BalanceType.FROZEN,
      balanceBefore: frozenBefore.toString(),
      balanceAfter: frozenAfter.toString(),
      relatedType: AccountFlowRelatedType.WITHDRAW,
      relatedId: withdrawOrderId,
      idempotencyKey: `${idempotencyKey}:fail:frozen`,
    });

    await this.writeAccountFlow(manager, {
      merchantId,
      amount,
      type: AccountFlowType.WITHDRAW_FAIL,
      balanceType: BalanceType.AVAILABLE,
      balanceBefore: availableBefore.toString(),
      balanceAfter: availableAfter.toString(),
      relatedType: AccountFlowRelatedType.WITHDRAW,
      relatedId: withdrawOrderId,
      idempotencyKey: `${idempotencyKey}:fail:available`,
    });
  }

  private async writeAccountFlow(
    manager: EntityManager,
    data: {
      merchantId: string;
      amount: string;
      type: AccountFlowType;
      balanceType: BalanceType;
      balanceBefore: string;
      balanceAfter: string;
      relatedType: AccountFlowRelatedType;
      relatedId: string;
      idempotencyKey: string;
    },
  ): Promise<void> {
    const flowRepo = manager.getRepository(AccountFlowEntity);
    const exists = await flowRepo.count({ where: { idempotencyKey: data.idempotencyKey } });
    if (exists > 0) {
      this.logger.warn(`流水已存在，跳过: idempotencyKey=${data.idempotencyKey}`);
      return;
    }

    const flowNo = await this.sequenceNumberService.generate({
      businessType: SequenceNumberType.ACCOUNT_FLOW,
      prefix: SequenceNumberPrefix.ACCOUNT_FLOW,
    });

    const flow = flowRepo.create({
      ...data,
      flowNo,
    });
    await flowRepo.save(flow);
  }
}
