import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DataSource, In } from 'typeorm';
import { FavoriteEntity } from '../entities/favorite.entity';

/**
 * 收藏查询参数
 */
export interface FavoriteQueryOptions {
  userId: string;
  assetId?: string;
  keyword?: string;
  skip: number;
  take: number;
}

/**
 * 收藏仓储
 *
 * 负责收藏的数据访问操作
 */
@Injectable()
export class FavoriteRepository extends Repository<FavoriteEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(FavoriteEntity, dataSource.createEntityManager());
  }

  /**
   * 根据 ID 查找收藏
   */
  async findById(id: string): Promise<FavoriteEntity> {
    const favorite = await this.findOne({
      where: { id },
      relations: ['asset', 'user'],
    });
    if (!favorite) {
      throw new NotFoundException('收藏不存在');
    }
    return favorite;
  }

  /**
   * 根据用户 ID 和资产 ID 查找收藏
   */
  async findByUserIdAndAssetId(userId: string, assetId: string): Promise<FavoriteEntity | null> {
    return this.findOne({
      where: { userId, assetId },
      relations: ['asset'],
    });
  }

  /**
   * 检查用户是否已收藏该资产
   */
  async isFavorite(userId: string, assetId: string): Promise<boolean> {
    const count = await this.count({
      where: { userId, assetId },
    });
    return count > 0;
  }

  /**
   * 分页查询用户的收藏列表
   */
  async findUserFavoritesWithPagination(options: FavoriteQueryOptions): Promise<[FavoriteEntity[], number]> {
    const queryBuilder = this.createQueryBuilder('favorite');

    queryBuilder.leftJoinAndSelect('favorite.asset', 'asset');
    queryBuilder.leftJoinAndSelect('asset.rentalPlans', 'rentalPlans');
    queryBuilder.leftJoinAndSelect('asset.category', 'category');
    queryBuilder.leftJoinAndSelect('asset.owner', 'owner');
    queryBuilder.leftJoinAndSelect('asset.contact', 'contact');

    // 必须属于当前用户
    queryBuilder.andWhere('favorite.userId = :userId', {
      userId: options.userId,
    });

    // 资产 ID 过滤
    if (options.assetId) {
      queryBuilder.andWhere('favorite.assetId = :assetId', {
        assetId: options.assetId,
      });
    }

    // 关键字搜索（搜索资产名称、描述）
    if (options.keyword) {
      queryBuilder.andWhere('(asset.name LIKE :keyword OR asset.description LIKE :keyword)', {
        keyword: `%${options.keyword}%`,
      });
    }

    // 只查询有效的资产
    queryBuilder.andWhere('asset.isActive = :isActive', { isActive: true });

    // 按创建时间倒序
    queryBuilder.orderBy('favorite.createdAt', 'DESC');

    queryBuilder.skip(options.skip);
    queryBuilder.take(options.take);

    return queryBuilder.getManyAndCount();
  }

  /**
   * 获取用户的收藏数量
   */
  async countByUserId(userId: string): Promise<number> {
    return this.count({
      where: { userId },
    });
  }

  /**
   * 删除收藏（根据用户 ID 和资产 ID）
   */
  async deleteByUserIdAndAssetId(userId: string, assetId: string): Promise<void> {
    const result = await this.softDelete({
      userId,
      assetId,
    });
    if (result.affected === 0) {
      throw new NotFoundException('收藏不存在');
    }
  }
}
