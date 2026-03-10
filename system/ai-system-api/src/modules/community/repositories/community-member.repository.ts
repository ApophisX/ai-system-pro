import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { CommunityMemberEntity } from '../entities';
import { CommunityMemberRole } from '../enums';

/**
 * 社区成员仓储
 */
@Injectable()
export class CommunityMemberRepository extends Repository<CommunityMemberEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(CommunityMemberEntity, dataSource.createEntityManager());
  }

  async findByCommunityAndUser(communityId: string, userId: string): Promise<CommunityMemberEntity | null> {
    return this.findOne({
      where: { communityId, userId },
      withDeleted: true,
    });
  }

  async findActiveByCommunityAndUser(communityId: string, userId: string): Promise<CommunityMemberEntity | null> {
    return this.findOne({
      where: { communityId, userId },
    });
  }

  async isMember(communityId: string, userId: string): Promise<boolean> {
    const member = await this.findActiveByCommunityAndUser(communityId, userId);
    return !!member;
  }

  async getMemberRole(communityId: string, userId: string): Promise<CommunityMemberRole | null> {
    const member = await this.findActiveByCommunityAndUser(communityId, userId);
    return member?.role ?? null;
  }

  async restoreOrCreate(
    communityId: string,
    userId: string,
    role: CommunityMemberRole,
    manager?: { save: (entity: unknown, entityClass?: unknown) => Promise<CommunityMemberEntity> },
  ): Promise<CommunityMemberEntity> {
    const repo = manager ? { save: (e: CommunityMemberEntity) => manager.save(e, CommunityMemberEntity) } : this;
    const existing = await this.findByCommunityAndUser(communityId, userId);

    if (existing) {
      if (!existing.deletedAt) {
        return existing;
      }
      existing.deletedAt = undefined;
      existing.joinedAt = new Date();
      existing.role = role;
      return repo.save(existing);
    }

    const member = this.create({
      communityId,
      userId,
      role,
      joinedAt: new Date(),
    });
    return repo.save(member);
  }

  async softDeleteByCommunityAndUser(communityId: string, userId: string): Promise<void> {
    await this.softDelete({ communityId, userId });
  }
}
