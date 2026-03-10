import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CommunityRepository, CommunityMemberRepository } from '../repositories';
import { CommunityEntity, CommunityMemberEntity } from '../entities';
import { CommunityStatus, CommunityMemberRole, CommunityType } from '../enums';
import { JoinCommunityDto } from '../dto';

/**
 * 社区加入/退出服务
 */
@Injectable()
export class CommunityJoinService {
  private readonly logger = new Logger(CommunityJoinService.name);

  constructor(
    private readonly communityRepo: CommunityRepository,
    private readonly memberRepo: CommunityMemberRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 加入社区
   *
   * 事务：成员创建/恢复 + memberCount+1
   */
  async join(communityId: string, userId: string, dto?: JoinCommunityDto): Promise<void> {
    const community = await this.communityRepo.findByIdOrNull(communityId);
    if (!community) {
      throw new NotFoundException({ message: '社区不存在', bizCode: 'COMMUNITY_NOT_FOUND' });
    }

    if (community.status === CommunityStatus.CLOSED) {
      throw new BadRequestException({ message: '社区已关闭', bizCode: 'COMMUNITY_CLOSED' });
    }

    if (community.status !== CommunityStatus.APPROVED) {
      throw new BadRequestException({ message: '社区未审核通过', bizCode: 'COMMUNITY_NOT_APPROVED' });
    }

    const alreadyJoined = await this.memberRepo.isMember(communityId, userId);
    if (alreadyJoined) {
      throw new ConflictException({ message: '已加入该社区，无需重复加入', bizCode: 'COMMUNITY_ALREADY_JOINED' });
    }

    if (community.type === CommunityType.PRIVATE) {
      if (!dto?.inviteCode || dto.inviteCode !== community.inviteCode) {
        throw new BadRequestException({ message: '邀请码错误', bizCode: 'COMMUNITY_INVITE_CODE_INVALID' });
      }
    }

    await this.dataSource.transaction(async manager => {
      const memberRepo = manager.getRepository(CommunityMemberEntity);
      const existing = await memberRepo.findOne({
        where: { communityId, userId },
        withDeleted: true,
      });

      let changed = false;
      if (existing) {
        if (existing.deletedAt) {
          existing.deletedAt = undefined;
          existing.joinedAt = new Date();
          existing.role = CommunityMemberRole.MEMBER;
          await memberRepo.save(existing);
          changed = true;
        }
      } else {
        const member = memberRepo.create({
          communityId,
          userId,
          role: CommunityMemberRole.MEMBER,
          joinedAt: new Date(),
        });
        await memberRepo.save(member);
        changed = true;
      }

      if (changed) {
        await manager
          .createQueryBuilder()
          .update(CommunityEntity)
          .set({ memberCount: () => 'member_count + 1' })
          .where('id = :id', { id: communityId })
          .execute();
      }
    });

    this.logger.log(`用户加入社区: communityId=${communityId}, userId=${userId}`);
  }

  /**
   * 退出社区
   *
   * 创建者不可退出。事务：成员软删除 + memberCount-1
   */
  async leave(communityId: string, userId: string): Promise<void> {
    const community = await this.communityRepo.findByIdOrNull(communityId);
    if (!community) {
      throw new NotFoundException({ message: '社区不存在', bizCode: 'COMMUNITY_NOT_FOUND' });
    }

    const role = await this.memberRepo.getMemberRole(communityId, userId);
    if (!role) {
      throw new BadRequestException({ message: '未加入该社区，无需退出' });
    }

    if (role === CommunityMemberRole.CREATOR) {
      throw new BadRequestException({ message: '创建者不可退出社区', bizCode: 'COMMUNITY_CREATOR_CANNOT_LEAVE' });
    }

    await this.dataSource.transaction(async manager => {
      const deleteResult = await manager
        .createQueryBuilder()
        .softDelete()
        .from(CommunityMemberEntity)
        .where('community_id = :communityId', { communityId })
        .andWhere('user_id = :userId', { userId })
        .andWhere('deleted_at IS NULL')
        .execute();

      if ((deleteResult.affected ?? 0) > 0) {
        await manager
          .createQueryBuilder()
          .update(CommunityEntity)
          .set({ memberCount: () => 'GREATEST(0, member_count - 1)' })
          .where('id = :id', { id: communityId })
          .execute();
      }
    });

    this.logger.log(`用户退出社区: communityId=${communityId}, userId=${userId}`);
  }
}
