import { Injectable, Logger } from '@nestjs/common';
import { CreditEventRepository } from '../repositories/credit-event.repository';
import { CreditAccountRepository } from '../repositories/credit-account.repository';
import { CreditScoreHistoryRepository } from '../repositories/credit-score-history.repository';
import { CreditScoreHistoryEntity } from '../entities';
import { CreditActorRole, CreditLevel } from '../enums';
import { getCreditLevelByScore } from '../enums/credit-level.enum';

const MODEL_VERSION = 'v1';
const INITIAL_SCORE = 600;
const SCORE_MIN = 300;
const SCORE_MAX = 950;
const DECAY_LAMBDA = 0.001; // 负面权重衰减系数 e^(-λt)，t 为天数

/**
 * 信用评分服务
 *
 * 基于历史事件重算评分
 * credit_score = behavior_score * 0.5 + risk_score * 0.3 + stability_score * 0.2
 */
@Injectable()
export class CreditScoringService {
  private readonly logger = new Logger(CreditScoringService.name);

  constructor(
    private readonly eventRepo: CreditEventRepository,
    private readonly accountRepo: CreditAccountRepository,
    private readonly historyRepo: CreditScoreHistoryRepository,
  ) {}

  /**
   * 重算用户指定角色的信用分
   */
  async recalculate(
    userId: string,
    actorRole: CreditActorRole = CreditActorRole.LESSEE,
  ): Promise<{ creditScore: number; creditLevel: CreditLevel }> {
    const events = await this.eventRepo.findEventsForScoring(userId, actorRole);
    const now = new Date();

    let behaviorScore = INITIAL_SCORE;
    let riskScore = INITIAL_SCORE;
    let stabilityScore = INITIAL_SCORE;

    for (const event of events) {
      const daysSince = Math.max(0, (now.getTime() - new Date(event.createdAt).getTime()) / (24 * 60 * 60 * 1000));
      const decay = Math.exp(-DECAY_LAMBDA * daysSince);
      const riskWeight = typeof event.riskWeight === 'number' ? event.riskWeight : 1;
      const effectiveImpact = Math.round(event.impactScore * decay * riskWeight);

      behaviorScore += effectiveImpact;
      if (effectiveImpact < 0) {
        riskScore += Math.round(effectiveImpact * 0.8);
      } else {
        stabilityScore += Math.round(effectiveImpact * 0.5);
      }
    }

    behaviorScore = Math.max(SCORE_MIN, Math.min(SCORE_MAX, behaviorScore));
    riskScore = Math.max(SCORE_MIN, Math.min(SCORE_MAX, riskScore));
    stabilityScore = Math.max(SCORE_MIN, Math.min(SCORE_MAX, stabilityScore));

    const creditScore = Math.round(behaviorScore * 0.5 + riskScore * 0.3 + stabilityScore * 0.2);
    const clampedScore = Math.max(SCORE_MIN, Math.min(SCORE_MAX, creditScore));
    const creditLevel = getCreditLevelByScore(clampedScore);

    const account = await this.accountRepo.findOrCreateByUserAndRole(userId, actorRole);
    account.creditScore = clampedScore;
    account.behaviorScore = behaviorScore;
    account.riskScore = riskScore;
    account.stabilityScore = stabilityScore;
    account.creditLevel = creditLevel;
    account.modelVersion = MODEL_VERSION;
    account.lastCalculatedAt = now;
    await this.accountRepo.save(account);

    const historyEntity = new CreditScoreHistoryEntity();
    historyEntity.userId = userId;
    historyEntity.actorRole = actorRole;
    historyEntity.creditScore = clampedScore;
    historyEntity.behaviorScore = behaviorScore;
    historyEntity.riskScore = riskScore;
    historyEntity.stabilityScore = stabilityScore;
    historyEntity.creditLevel = creditLevel;
    historyEntity.modelVersion = MODEL_VERSION;
    historyEntity.calculatedAt = now;
    await this.historyRepo.save(historyEntity);

    this.logger.log(
      `信用分重算完成: userId=${userId}, actorRole=${actorRole}, score=${clampedScore}, level=${creditLevel}`,
    );

    return { creditScore: clampedScore, creditLevel };
  }

  /**
   * 事件写入后触发异步重算（供 Subscriber 调用）
   */
  triggerRecalculate(userId: string, actorRole: CreditActorRole): void {
    setImmediate(() => {
      this.recalculate(userId, actorRole).catch(err => {
        this.logger.error(`信用分重算失败: userId=${userId}`, err instanceof Error ? err.stack : err);
      });
    });
  }
}
