import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { MerchantInviteCodeRepository, MerchantInviteRelationRepository } from '../repositories';
import { MerchantInviteRelationEntity } from '../entities';
import { MerchantInviteRelationStatus } from '../enums';

/**
 * 商户邀请注册服务
 *
 * 负责：邀请码生成/校验、注册绑定、认证/上架/首单状态更新
 */
@Injectable()
export class MerchantInviteRegisterService {
  private readonly logger = new Logger(MerchantInviteRegisterService.name);

  constructor(
    private readonly codeRepo: MerchantInviteCodeRepository,
    private readonly relationRepo: MerchantInviteRelationRepository,
  ) {}

  /**
   * 获取或创建员工的专属邀请码
   */
  async getOrCreateInviteCode(employeeId: string): Promise<string> {
    const code = await this.codeRepo.findOrCreateByEmployeeId(employeeId);
    return code.code;
  }

  /**
   * 校验邀请码并返回 employeeId，无效则抛出
   */
  async validateInviteCode(inviteCode: string): Promise<string> {
    const code = await this.codeRepo.findByCode(inviteCode.trim().toUpperCase());
    if (!code) {
      throw new BadRequestException('邀请码无效或已过期');
    }
    if (code.expireAt && code.expireAt < new Date()) {
      throw new BadRequestException('邀请码已过期');
    }
    return code.employeeId;
  }

  /**
   * 注册时绑定邀请关系
   *
   * @param merchantId 新注册用户 ID
   * @param inviteCode 使用的邀请码
   * @throws 邀请码无效、员工本人注册、商户已被邀请过
   */
  async bindOnRegister(merchantId: string, inviteCode: string): Promise<void> {
    const employeeId = await this.validateInviteCode(inviteCode);

    // 防作弊：员工本人不能作为被邀请商户
    if (employeeId === merchantId) {
      throw new BadRequestException('不能使用自己的邀请码注册');
    }

    // 一商户仅能被邀请一次
    const existing = await this.relationRepo.findByMerchantId(merchantId);
    if (existing) {
      this.logger.warn(`商户已被邀请过，跳过: merchantId=${merchantId}`);
      return;
    }

    const relation = this.relationRepo.create({
      employeeId,
      merchantId,
      inviteCode: inviteCode.trim().toUpperCase(),
      status: MerchantInviteRelationStatus.REGISTERED,
    });
    await this.relationRepo.save(relation);
    this.logger.log(`邀请关系已创建: merchantId=${merchantId}, employeeId=${employeeId}`);
  }

  /**
   * 用户认证通过时调用，更新 relation 为 VERIFIED
   */
  async onUserVerified(userId: string): Promise<void> {
    const relation = await this.relationRepo.findByMerchantId(userId);
    if (!relation) return;
    if (relation.status !== MerchantInviteRelationStatus.REGISTERED) return;

    relation.status = MerchantInviteRelationStatus.VERIFIED;
    relation.verifiedAt = new Date();
    await this.relationRepo.save(relation);
    this.logger.log(`邀请关系已更新为 VERIFIED: merchantId=${userId}`);
  }

  /**
   * 检查并更新上架达标（≥3 资产审核通过）
   *
   * @param ownerId 资产 owner
   * @param approvedAssetCount 该 owner 当前 approved+available 的资产数量
   */
  async updateListedIfNeeded(ownerId: string, approvedAssetCount: number): Promise<void> {
    const relation = await this.relationRepo.findByMerchantId(ownerId);
    if (!relation) return;
    if (relation.status !== MerchantInviteRelationStatus.VERIFIED) return;
    if (approvedAssetCount < 3) return;

    relation.status = MerchantInviteRelationStatus.LISTED;
    relation.listedAt = new Date();
    await this.relationRepo.save(relation);
    this.logger.log(`邀请关系已更新为 LISTED: merchantId=${ownerId}, assetCount=${approvedAssetCount}`);
  }

  /**
   * 订单完成时更新首单达标（若为首单）
   */
  async updateFirstOrderIfNeeded(merchantId: string, isFirstCompletedOrder: boolean): Promise<void> {
    if (!isFirstCompletedOrder) return;

    const relation = await this.relationRepo.findByMerchantId(merchantId);
    if (!relation) return;

    relation.status = MerchantInviteRelationStatus.FIRST_ORDER;
    relation.firstOrderAt = new Date();
    await this.relationRepo.save(relation);
    this.logger.log(`邀请关系已更新为 FIRST_ORDER: merchantId=${merchantId}`);
  }

  /**
   * 查询商户的邀请关系（用于分润归属判定）
   */
  async getRelationByMerchantId(merchantId: string): Promise<MerchantInviteRelationEntity | null> {
    return this.relationRepo.findByMerchantId(merchantId);
  }
}
