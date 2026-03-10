import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CommunityRepository } from '../repositories';
import { CommunityEntity } from '../entities';
import { CommunityStatus } from '../enums';
import { RejectCommunityDto, ForceCloseCommunityDto } from '../dto';

/**
 * 社区审核服务（管理端）
 */
@Injectable()
export class CommunityAuditService {
  private readonly logger = new Logger(CommunityAuditService.name);

  constructor(
    private readonly communityRepo: CommunityRepository,
    private readonly dataSource: DataSource,
  ) {}

  async approve(communityId: string, auditorId: string): Promise<CommunityEntity> {
    const community = await this.communityRepo.findByIdOrNull(communityId);
    if (!community) {
      throw new NotFoundException('社区不存在');
    }

    if (community.status !== CommunityStatus.PENDING) {
      throw new BadRequestException({
        message: '仅待审核社区可执行通过操作',
        bizCode: 'COMMUNITY_STATUS_TRANSITION_INVALID',
      });
    }

    return this.dataSource.transaction(async manager => {
      const repo = manager.getRepository(CommunityEntity);
      await repo.update(communityId, {
        status: CommunityStatus.APPROVED,
        auditById: auditorId,
        auditAt: new Date(),
        auditRemark: undefined,
      });
      const updated = await repo.findOne({ where: { id: communityId } });
      this.logger.log(`社区审核通过: communityId=${communityId}, auditorId=${auditorId}`);
      return updated!;
    });
  }

  async reject(communityId: string, dto: RejectCommunityDto, auditorId: string): Promise<CommunityEntity> {
    const community = await this.communityRepo.findByIdOrNull(communityId);
    if (!community) {
      throw new NotFoundException('社区不存在');
    }

    if (community.status !== CommunityStatus.PENDING) {
      throw new BadRequestException({
        message: '仅待审核社区可执行拒绝操作',
        bizCode: 'COMMUNITY_STATUS_TRANSITION_INVALID',
      });
    }

    return this.dataSource.transaction(async manager => {
      const repo = manager.getRepository(CommunityEntity);
      await repo.update(communityId, {
        status: CommunityStatus.REJECTED,
        auditById: auditorId,
        auditAt: new Date(),
        auditRemark: dto.auditRemark,
      });
      const updated = await repo.findOne({ where: { id: communityId } });
      this.logger.log(`社区审核拒绝: communityId=${communityId}, auditorId=${auditorId}`);
      return updated!;
    });
  }

  async forceClose(communityId: string, dto: ForceCloseCommunityDto, auditorId: string): Promise<CommunityEntity> {
    const community = await this.communityRepo.findByIdOrNull(communityId);
    if (!community) {
      throw new NotFoundException('社区不存在');
    }

    if (community.status === CommunityStatus.CLOSED) {
      throw new BadRequestException('社区已关闭');
    }

    return this.dataSource.transaction(async manager => {
      const repo = manager.getRepository(CommunityEntity);
      await repo.update(communityId, {
        status: CommunityStatus.CLOSED,
        auditRemark: dto.reason,
        auditById: auditorId,
        auditAt: new Date(),
      });
      const updated = await repo.findOne({ where: { id: communityId } });
      this.logger.log(`社区强制关闭: communityId=${communityId}, auditorId=${auditorId}`);
      return updated!;
    });
  }
}
