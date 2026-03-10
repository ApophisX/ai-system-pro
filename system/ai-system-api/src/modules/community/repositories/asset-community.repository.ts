import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { AssetCommunityEntity } from '../entities';
import { AppQueryAssetDto } from '@/modules/asset/dto';

/**
 * 资产-社区关联仓储
 */
@Injectable()
export class AssetCommunityRepository extends Repository<AssetCommunityEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(AssetCommunityEntity, dataSource.createEntityManager());
  }

  async findByAssetAndCommunity(assetId: string, communityId: string): Promise<AssetCommunityEntity | null> {
    return this.findOne({
      where: { assetId, communityId },
      withDeleted: true,
    });
  }

  async findActiveByAssetAndCommunity(assetId: string, communityId: string): Promise<AssetCommunityEntity | null> {
    return this.findOne({
      where: { assetId, communityId },
    });
  }

  async isBound(assetId: string, communityId: string): Promise<boolean> {
    const ac = await this.findActiveByAssetAndCommunity(assetId, communityId);
    return !!ac;
  }

  async findAssetIdsByCommunity(communityId: string): Promise<string[]> {
    const list = await this.find({
      where: { communityId },
      select: ['assetId'],
      order: { sortOrder: 'DESC', createdAt: 'DESC' },
    });
    return list.map(a => a.assetId);
  }

  /**
   * 分页查询社区内资产 ID（支持 assetType、categoryCode、sortBy 筛选）
   */
  async findAssetIdsByCommunityWithPagination(
    communityId: string,
    options: {
      assetType?: 'rental' | 'mall';
      categoryCode?: string;
      sortBy?: AppQueryAssetDto['sortBy'];
      order?: 'asc' | 'desc';
      skip: number;
      take: number;
      keyword?: string;
    },
  ): Promise<[string[], number]> {
    const qb = this.createQueryBuilder('ac')
      .innerJoin('ac.asset', 'a')
      .where('ac.communityId = :communityId', { communityId })
      .andWhere('ac.deletedAt IS NULL')
      .andWhere('a.deletedAt IS NULL')
      .andWhere('a.status = :status', { status: 'available' })
      .andWhere('a.auditStatus = :auditStatus', { auditStatus: 'approved' })
      .andWhere('a.isActive = 1');

    if (options.assetType === 'rental') {
      qb.andWhere('a.isMallProduct = 0');
    } else if (options.assetType === 'mall') {
      qb.andWhere('a.isMallProduct = 1');
    }

    if (options.categoryCode) {
      qb.andWhere('a.categoryCode = :categoryCode', { categoryCode: options.categoryCode });
    }

    if (options.keyword) {
      qb.andWhere('a.name LIKE :keyword', { keyword: `%${options.keyword}%` });
    }

    this.applySorting(qb, options);

    const countQb = qb.clone();
    const total = await countQb.getCount();

    const list = await qb
      .select('ac.assetId', 'assetId')
      .addOrderBy('ac.createdAt', 'DESC')
      .skip(options.skip)
      .take(options.take)
      .getRawMany<{ assetId: string }>();

    return [list.map(r => r.assetId), total];
  }

  /**
   * 应用排序（参考 AssetRepository.applySorting）
   */
  private applySorting(
    qb: ReturnType<typeof this.createQueryBuilder>,
    options: {
      sortBy?: AppQueryAssetDto['sortBy'];
      order?: 'asc' | 'desc';
    },
  ): void {
    const sortOrder = (options.order || 'desc').toUpperCase() as 'ASC' | 'DESC';

    switch (options.sortBy) {
      case 'price': {
        // 子查询直接用于 ORDER BY，避免后续 select() 覆盖 addSelect 导致 minPrice 丢失
        const subQuery = this.dataSource
          .createQueryBuilder()
          .select('MIN(arp.price)')
          .from('asset_rental_plan', 'arp')
          .where('arp.asset_id = a.id')
          .getQuery();
        qb.orderBy(`(${subQuery})`, sortOrder);
        break;
      }
      case 'viewCount':
        qb.orderBy('a.viewCount', sortOrder);
        break;
      case 'rentalCount':
        qb.orderBy('a.rentalCount', sortOrder);
        break;
      case 'rating':
        qb.orderBy('a.rating', sortOrder);
        break;
      case 'createdAt':
      case 'publishAt':
      case 'newest':
      case 'recommend':
      case 'nearby':
      default:
        qb.orderBy('a.publishAt', sortOrder);
        break;
    }
  }

  async restoreOrCreate(
    assetId: string,
    communityId: string,
    sortOrder: number,
    manager?: { save: (entity: unknown, entityClass?: unknown) => Promise<AssetCommunityEntity> },
  ): Promise<AssetCommunityEntity> {
    const repo = manager ? { save: (e: AssetCommunityEntity) => manager.save(e, AssetCommunityEntity) } : this;
    const existing = await this.findByAssetAndCommunity(assetId, communityId);

    if (existing) {
      if (!existing.deletedAt) {
        return existing;
      }
      existing.deletedAt = undefined;
      existing.sortOrder = sortOrder;
      return repo.save(existing);
    }

    const ac = this.create({
      assetId,
      communityId,
      sortOrder,
    });
    return repo.save(ac);
  }

  async softDeleteByAssetAndCommunity(assetId: string, communityId: string): Promise<void> {
    await this.softDelete({ assetId, communityId });
  }
}
