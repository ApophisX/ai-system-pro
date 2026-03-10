import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { CommunityEntity } from '../entities';
import { CommunityStatus, CommunityType } from '../enums';

export interface CommunityQueryOptions {
  keyword?: string;
  status?: CommunityStatus;
  type?: CommunityType;
  joined?: boolean;
  userId?: string;
  sort?: 'memberCount' | 'assetCount' | 'createdAt';
  order?: 'ASC' | 'DESC';
  skip: number;
  take: number;
}

/**
 * 社区仓储
 */
@Injectable()
export class CommunityRepository extends Repository<CommunityEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(CommunityEntity, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<CommunityEntity> {
    const community = await this.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!community) {
      throw new NotFoundException('社区不存在');
    }
    return community;
  }

  async findByIdOrNull(id: string): Promise<CommunityEntity | null> {
    return this.findOne({
      where: { id },
      relations: ['creator'],
    });
  }

  async findByIdWithAudit(id: string): Promise<CommunityEntity> {
    const community = await this.findOne({
      where: { id },
      relations: ['creator', 'auditBy'],
    });
    if (!community) {
      throw new NotFoundException('社区不存在');
    }
    return community;
  }

  async findApprovedWithPagination(options: CommunityQueryOptions): Promise<[CommunityEntity[], number]> {
    const qb = this.createQueryBuilder('c')
      .leftJoinAndSelect('c.creator', 'creator')
      .where('c.status = :status', { status: CommunityStatus.APPROVED })
      .andWhere('c.deleted_at IS NULL');

    if (options.type) {
      qb.andWhere('c.type = :type', { type: options.type });
    }

    if (options.keyword?.trim()) {
      qb.andWhere('(c.name LIKE :keyword OR c.description LIKE :keyword)', {
        keyword: `%${options.keyword.trim()}%`,
      });
    }

    if (options.joined !== undefined && options.userId) {
      if (options.joined) {
        qb.innerJoin(
          'community_member',
          'cm',
          'cm.community_id = c.id AND cm.user_id = :userId AND cm.deleted_at IS NULL',
          { userId: options.userId },
        );
      } else {
        qb.andWhere(
          `NOT EXISTS (
            SELECT 1 FROM community_member cm2
            WHERE cm2.community_id = c.id AND cm2.user_id = :userId AND cm2.deleted_at IS NULL
          )`,
          { userId: options.userId },
        );
      }
    }

    const sortField = options.sort || 'createdAt';
    const order = options.order || 'DESC';
    qb.orderBy(`c.${sortField}`, order);

    qb.skip(options.skip).take(options.take);

    return qb.getManyAndCount();
  }

  async findCreatedByUser(
    userId: string,
    options: { status?: CommunityStatus; skip: number; take: number },
  ): Promise<[CommunityEntity[], number]> {
    const qb = this.createQueryBuilder('c')
      .leftJoinAndSelect('c.creator', 'creator')
      .where('c.creator_id = :userId', { userId })
      .andWhere('c.deleted_at IS NULL');

    if (options.status) {
      qb.andWhere('c.status = :status', { status: options.status });
    }

    qb.orderBy('c.createdAt', 'DESC').skip(options.skip).take(options.take);

    return qb.getManyAndCount();
  }

  async findJoinedByUser(
    userId: string,
    options: { keyword?: string; skip: number; take: number },
  ): Promise<[CommunityEntity[], number]> {
    const qb = this.createQueryBuilder('c')
      .innerJoin(
        'community_member',
        'cm',
        'cm.community_id = c.id AND cm.user_id = :userId AND cm.deleted_at IS NULL',
        { userId },
      )
      .leftJoinAndSelect('c.creator', 'creator')
      .where('c.status = :status', { status: CommunityStatus.APPROVED })
      .andWhere('c.deleted_at IS NULL');

    if (options.keyword?.trim()) {
      qb.andWhere('(c.name LIKE :keyword OR c.description LIKE :keyword)', {
        keyword: `%${options.keyword.trim()}%`,
      });
    }

    return qb
      .orderBy('c.sortOrder', 'DESC')
      .addOrderBy('c.createdAt', 'DESC')
      .skip(options.skip)
      .take(options.take)
      .getManyAndCount();
  }

  async incrementMemberCount(id: string, delta: number): Promise<void> {
    await this.createQueryBuilder()
      .update(CommunityEntity)
      .set({ memberCount: () => `GREATEST(0, member_count + ${delta})` })
      .where('id = :id', { id })
      .execute();
  }

  async incrementAssetCount(id: string, delta: number): Promise<void> {
    await this.createQueryBuilder()
      .update(CommunityEntity)
      .set({ assetCount: () => `GREATEST(0, asset_count + ${delta})` })
      .where('id = :id', { id })
      .execute();
  }

  async existsByInviteCode(inviteCode: string, excludeId?: string): Promise<boolean> {
    const qb = this.createQueryBuilder('c')
      .where('c.invite_code = :inviteCode', { inviteCode })
      .andWhere('c.deleted_at IS NULL');
    if (excludeId) {
      qb.andWhere('c.id != :excludeId', { excludeId });
    }
    return (await qb.getCount()) > 0;
  }
}
