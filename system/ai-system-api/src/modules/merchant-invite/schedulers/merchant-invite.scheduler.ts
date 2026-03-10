import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { MerchantInviteRegisterService } from '../services/merchant-invite-register.service';
import { MerchantInviteRewardService } from '../services/merchant-invite-reward.service';
import { MERCHANT_INVITE_CONFIG } from '../constants/merchant-invite.constant';

/**
 * 商户邀请定时任务
 *
 * - 上架达标检查：每日统计商户 approved+available 资产数，更新 LISTED
 * - 分润释放：每日将超过 7 天的 PENDING 分润置为 RELEASED/REVOKED
 */
@Injectable()
export class MerchantInviteScheduler {
  private readonly logger = new Logger(MerchantInviteScheduler.name);

  constructor(
    private readonly registerService: MerchantInviteRegisterService,
    private readonly rewardService: MerchantInviteRewardService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 每日 2:00 检查上架达标
   */
  @Cron('0 2 * * *')
  async checkListedStatus(): Promise<void> {
    this.logger.log('开始执行上架达标检查');

    try {
      const relations = await this.dataSource
        .createQueryBuilder()
        .select('r.merchant_id', 'merchantId')
        .from('merchant_invite_relation', 'r')
        .where('r.status = :status', { status: 'verified' })
        .andWhere('r.deleted_at IS NULL')
        .getRawMany();

      for (const { merchantId } of relations) {
        const count = await this.dataSource
          .createQueryBuilder()
          .select('COUNT(asset.id)', 'count')
          .from('asset', 'asset')
          .where('asset.owner_id = :merchantId', { merchantId })
          .andWhere('asset.status = :assetStatus', { assetStatus: 'available' })
          .andWhere('asset.audit_status = :auditStatus', { auditStatus: 'approved' })
          .andWhere('asset.deleted_at IS NULL')
          .getRawOne();

        const approvedCount = Number(count?.count ?? 0);
        await this.registerService.updateListedIfNeeded(merchantId, approvedCount);
      }

      this.logger.log('上架达标检查完成');
    } catch (error) {
      this.logger.error('上架达标检查失败', error instanceof Error ? error.stack : error);
    }
  }

  /**
   * 每日 3:00 处理 7 天观察期后的分润
   */
  @Cron('0 3 * * *')
  async processPendingRebates(): Promise<void> {
    this.logger.log('开始执行分润释放/回收');

    try {
      const { released, revoked } = await this.rewardService.processPendingRebates();
      this.logger.log(`分润处理完成: released=${released}, revoked=${revoked}`);
    } catch (error) {
      this.logger.error('分润处理失败', error instanceof Error ? error.stack : error);
    }
  }
}
