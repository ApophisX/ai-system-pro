import { Injectable } from '@nestjs/common';
import { CreditAccountRepository } from '../repositories/credit-account.repository';
import { CreditActorRole, CreditLevel, CreditStatus } from '../enums';

/**
 * 信用风控决策服务
 *
 * 根据信用等级/状态提供业务侧决策接口
 * - 是否免押、押金比例
 * - 是否支持分期
 * - 是否冻结（禁止下单）
 */
@Injectable()
export class CreditRiskDecisionService {
  constructor(private readonly accountRepo: CreditAccountRepository) {}

  /**
   * 信用是否冻结（禁止下单）
   */
  async isCreditFrozen(userId: string, actorRole: CreditActorRole = CreditActorRole.LESSEE): Promise<boolean> {
    const account = await this.accountRepo.findByUserAndRole(userId, actorRole);
    return account?.creditStatus === CreditStatus.FROZEN;
  }

  /**
   * 是否支持分期
   * 文档第六节：if credit_level >= AA 支持分期，即仅 AAA、AA
   */
  async isInstallmentAllowed(userId: string): Promise<boolean> {
    const account = await this.accountRepo.findOrCreateByUserAndRole(userId, CreditActorRole.LESSEE);
    return [CreditLevel.AAA, CreditLevel.AA, CreditLevel.B, CreditLevel.C].includes(account.creditLevel);
  }

  /**
   * 根据信用等级获取实际押金金额
   * AA 及以上：免押 0
   * B 及以上：30%
   * 其他：100%
   */
  async getActualDepositAmount(assetDepositAmount: number, userId: string): Promise<number> {
    const account = await this.accountRepo.findOrCreateByUserAndRole(userId, CreditActorRole.LESSEE);

    if (account.creditLevel === CreditLevel.AAA || account.creditLevel === CreditLevel.AA) {
      return 0;
    }
    if (account.creditLevel === CreditLevel.A || account.creditLevel === CreditLevel.B) {
      return Math.round(assetDepositAmount * 0.3);
    }
    return assetDepositAmount;
  }

  /**
   * 获取押金比例 0-1
   */
  async getDepositRatio(userId: string): Promise<number> {
    const account = await this.accountRepo.findOrCreateByUserAndRole(userId, CreditActorRole.LESSEE);
    if (account.creditLevel === CreditLevel.AAA || account.creditLevel === CreditLevel.AA) return 0;
    if (account.creditLevel === CreditLevel.A || account.creditLevel === CreditLevel.B) return 0.3;
    return 1;
  }

  /**
   * 是否免押
   */
  async isDepositFree(userId: string): Promise<boolean> {
    const ratio = await this.getDepositRatio(userId);
    return ratio === 0;
  }
}
