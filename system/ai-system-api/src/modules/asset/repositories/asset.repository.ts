import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DataSource, In, SelectQueryBuilder, FindOneOptions, Brackets } from 'typeorm';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { AssetEntity } from '../entities';
import { AssetAuditStatus, AssetStatus, RentalType } from '../enums';
import timezone from 'dayjs/plugin/timezone';
import { AppQueryAssetDto } from '../dto';

dayjs.extend(utc);
dayjs.extend(timezone);
/**
 * 资产查询参数
 */
export interface AssetQueryOptions {
  latitude?: number;
  longitude?: number;
  keyword?: string;
  categoryId?: string;
  categoryCode?: string;
  ownerId?: string;
  status?: AssetStatus;
  statuses?: AssetStatus[];
  auditStatus?: AssetAuditStatus;
  rentalType?: RentalType;
  minPrice?: number;
  maxPrice?: number;
  cityCode?: string;
  districtCode?: string;
  provinceCode?: string;
  isActive?: boolean;
  sortBy?: AppQueryAssetDto['sortBy'];
  sortOrder?: 'ASC' | 'DESC';
  skip: number;
  take: number;
}

/**
 * 资产仓储
 *
 * 负责资产的数据访问操作
 */
@Injectable()
export class AssetRepository extends Repository<AssetEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(AssetEntity, dataSource.createEntityManager());
  }

  /**
   * 根据 ID 查找资产
   */
  async findById(id: string): Promise<AssetEntity> {
    const asset = await this.findOne({
      where: { id },
    });
    if (!asset) {
      throw new NotFoundException('资产不存在');
    }
    return asset;
  }

  /**
   * 根据 ID 查找资产（出租方）
   */
  async findMyById(id: string, ownerId: string): Promise<AssetEntity> {
    const asset = await this.findOne({
      where: { id, ownerId },
    });
    if (!asset) {
      throw new NotFoundException('资产不存在');
    }
    return asset;
  }

  /**
   * 根据 ID 查找资产（包含关联数据）
   */
  async findByIdWithRelations(id: string, options?: FindOneOptions<AssetEntity>): Promise<AssetEntity> {
    const asset = await this.findOne({
      ...options,
      where: { ...options?.where, id },
      relations: {
        category: true,
        tags: true,
        rentalPlans: true,
        owner: true,
        inventories: true,
        contact: true,
        ...options?.relations,
      },
    });
    if (!asset) {
      throw new NotFoundException('资产不存在');
    }
    return asset;
  }

  /**
   * 根据多个 ID 查找资产
   */
  async findByIds(ids: string[]): Promise<AssetEntity[]> {
    return this.find({
      where: { id: In(ids) },
    });
  }

  /**
   * 根据 ID 列表查找资产（含关联，保持 ids 顺序）
   */
  async findByIdsWithRelationsOrdered(ids: string[]): Promise<AssetEntity[]> {
    if (ids.length === 0) return [];
    const assets = await this.createQueryBuilder('asset')
      .leftJoinAndSelect('asset.rentalPlans', 'rentalPlans')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('asset.owner', 'owner')
      .leftJoinAndSelect('asset.contact', 'contact')
      .where('asset.id IN (:...ids)', { ids })
      .getMany();
    const idToAsset = new Map(assets.map(a => [a.id, a]));
    return ids.map(id => idToAsset.get(id)).filter((a): a is AssetEntity => !!a);
  }

  /**
   * 根据所有者 ID 查找资产
   */
  async findByOwnerId(ownerId: string, isActiveOnly: boolean = true): Promise<AssetEntity[]> {
    const where: Record<string, unknown> = { ownerId };
    if (isActiveOnly) {
      where.isActive = true;
    }
    return this.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 分页查询资产（App 端，公开列表）
   */
  async findPublicWithPagination(options: AssetQueryOptions, userId?: string): Promise<[AssetEntity[], number]> {
    const queryBuilder = this.createQueryBuilder('asset');

    queryBuilder.leftJoinAndSelect('asset.rentalPlans', 'rentalPlans');
    queryBuilder.leftJoinAndSelect('asset.category', 'category');
    queryBuilder.leftJoinAndSelect('asset.owner', 'owner');
    queryBuilder.leftJoinAndSelect('asset.contact', 'contact');

    // 只查询可租赁状态的资产
    queryBuilder.andWhere('asset.status = :status', {
      status: AssetStatus.AVAILABLE,
    });
    queryBuilder.andWhere('asset.isActive = :isActive', { isActive: true });
    queryBuilder.andWhere('asset.auditStatus = :auditStatus', {
      auditStatus: AssetAuditStatus.APPROVED,
    });

    // 排除社区资产：公开列表不包含已绑定到社区的资产
    queryBuilder.andWhere(
      `NOT EXISTS (SELECT 1 FROM asset_community ac WHERE ac.asset_id = asset.id AND ac.deleted_at IS NULL)`,
    );

    // 计算距离（addSelect 的计算列不会映射到 Entity，需用 getRawAndEntities 获取）
    const hasDistanceQuery = options.latitude != null && options.longitude != null;
    if (hasDistanceQuery) {
      this.addComputedDistanceSelect(queryBuilder, options.latitude!, options.longitude!);
    }

    this.applyFilters(queryBuilder, options);
    this.applySorting(queryBuilder, options);

    queryBuilder.skip(options.skip);
    queryBuilder.take(options.take);

    // 查询资产列表和总数（有距离时用 getRawAndEntities 才能拿到计算列）
    let assets: AssetEntity[];
    let total: number;

    if (hasDistanceQuery) {
      const countQuery = queryBuilder.clone();
      const [{ entities, raw }, count] = await Promise.all([
        queryBuilder.getRawAndEntities<AssetEntity>(),
        countQuery.getCount(),
      ]);
      assets = entities;
      total = count;
      this.mergeComputedDistanceToAssets(assets, raw as any);
    } else {
      [assets, total] = await queryBuilder.getManyAndCount();
    }

    // 如果有 userId，批量查询收藏状态并映射到资产实体
    if (userId && assets.length > 0) {
      // 获取所有资产的 ID
      const assetIds = assets.map(asset => asset.id);

      // 批量查询该用户收藏的资产 ID
      const favoriteAssetIds = await this.dataSource
        .createQueryBuilder()
        .select('favorite.asset_id', 'assetId')
        .from('favorite', 'favorite')
        .where('favorite.user_id = :userId', { userId })
        .andWhere('favorite.asset_id IN (:...assetIds)', { assetIds })
        .andWhere('favorite.deleted_at IS NULL')
        .getRawMany()
        .then(results => new Set(results.map(r => r.assetId)));

      // 将收藏状态映射到资产实体
      assets.forEach(asset => {
        (asset as AssetEntity & { isFavorite: boolean }).isFavorite = favoriteAssetIds.has(asset.id);
      });
    } else {
      // 没有 userId 时，isFavorite 默认为 false
      assets.forEach(asset => {
        (asset as AssetEntity & { isFavorite: boolean }).isFavorite = false;
      });
    }

    return [assets, total];
  }

  /**
   * 分页查询资产（后台管理）
   *
   * 不限制状态和审核状态，支持按商家、状态、审核状态、分类、关键字筛选
   */
  async findAdminWithPagination(options: AssetQueryOptions): Promise<[AssetEntity[], number]> {
    const queryBuilder = this.createQueryBuilder('asset');

    queryBuilder.leftJoinAndSelect('asset.rentalPlans', 'rentalPlans');
    queryBuilder.leftJoinAndSelect('asset.category', 'category');
    queryBuilder.leftJoinAndSelect('asset.owner', 'owner');
    queryBuilder.leftJoinAndSelect('asset.contact', 'contact');

    // 出租方/商家筛选
    if (options.ownerId) {
      queryBuilder.andWhere('asset.ownerId = :ownerId', { ownerId: options.ownerId });
    }

    // 资产状态筛选
    if (options.status) {
      queryBuilder.andWhere('asset.status = :status', { status: options.status });
    }

    // 审核状态筛选
    if (options.auditStatus) {
      queryBuilder.andWhere('asset.auditStatus = :auditStatus', { auditStatus: options.auditStatus });
    }

    // 分类筛选
    if (options.categoryId) {
      queryBuilder.andWhere('asset.categoryId = :categoryId', { categoryId: options.categoryId });
    }

    // 关键字搜索
    if (options.keyword) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('asset.name LIKE :keyword', { keyword: `%${options.keyword}%` }).orWhere(
            'owner.phone LIKE :keyword',
            { keyword: `%${options.keyword}%` },
          );
        }),
      );

      // queryBuilder.andWhere('(asset.name LIKE :keyword OR asset.description LIKE :keyword)', {
      //   keyword: `%${options.keyword}%`,
      // });
    }

    queryBuilder.orderBy('asset.createdAt', 'DESC');
    queryBuilder.skip(options.skip);
    queryBuilder.take(options.take);

    return queryBuilder.getManyAndCount();
  }

  /**
   * 分页查询我的资产（出租方）
   */
  async findMyAssetsWithPagination(ownerId: string, options: AssetQueryOptions): Promise<[AssetEntity[], number]> {
    const queryBuilder = this.createQueryBuilder('asset');

    queryBuilder.leftJoinAndSelect('asset.rentalPlans', 'rentalPlans');

    queryBuilder.andWhere('asset.ownerId = :ownerId', { ownerId });

    // 状态过滤
    if (options.status) {
      queryBuilder.andWhere('asset.status = :status', {
        status: options.status,
      });
    }

    // 审核状态过滤
    if (options.auditStatus) {
      queryBuilder.andWhere('asset.auditStatus = :auditStatus', {
        auditStatus: options.auditStatus,
      });
    }

    // 关键字搜索
    if (options.keyword) {
      queryBuilder.andWhere('(asset.name LIKE :keyword OR asset.description LIKE :keyword)', {
        keyword: `%${options.keyword}%`,
      });
    }

    // 分类过滤 TODO

    queryBuilder.orderBy('asset.createdAt', 'DESC');

    queryBuilder.skip(options.skip);
    queryBuilder.take(options.take);

    return queryBuilder.getManyAndCount();
  }

  /**
   * 增加浏览次数
   */
  async incrementViewCount(id: string): Promise<void> {
    await this.increment({ id }, 'viewCount', 1);
  }

  /**
   * 增加收藏次数
   */
  async incrementFavoriteCount(id: string, delta: number = 1): Promise<void> {
    await this.increment({ id }, 'favoriteCount', delta);
  }

  /**
   * 增加租赁次数
   */
  async incrementRentalCount(id: string): Promise<void> {
    await this.increment({ id }, 'rentalCount', 1);
  }

  /**
   * 检查资产是否属于指定用户
   */
  async isOwnedBy(assetId: string, ownerId: string): Promise<boolean> {
    const count = await this.count({
      where: { id: assetId, ownerId },
    });
    return count > 0;
  }

  /**
   * 检查资产是否存在（未删除）
   */
  async existsById(assetId: string): Promise<boolean> {
    const count = await this.count({
      where: { id: assetId },
    });
    return count > 0;
  }

  /**
   * 统计用户今天创建的资产数量
   */
  async countTodayCreatedByOwnerId(ownerId: string, timezone = 'Asia/Shanghai'): Promise<number> {
    const now = dayjs().tz(timezone);
    const startOfDay = now.startOf('day').toDate();
    const startOfTomorrow = now.add(1, 'day').startOf('day').toDate();

    return this.createQueryBuilder('asset')
      .where('asset.ownerId = :ownerId', { ownerId })
      .andWhere('asset.createdAt >= :startOfDay', { startOfDay })
      .andWhere('asset.createdAt < :startOfTomorrow', { startOfTomorrow })
      .andWhere('asset.deletedAt IS NULL')
      .getCount();
  }

  /**
   * 统计用户总资产数量（不包括已删除的）
   */
  async countTotalByOwnerId(ownerId: string): Promise<number> {
    return this.createQueryBuilder('asset')
      .where('asset.ownerId = :ownerId', { ownerId })
      .andWhere('asset.deletedAt IS NULL')
      .getCount();
  }

  /**
   * 应用过滤条件
   */
  private applyFilters(queryBuilder: SelectQueryBuilder<AssetEntity>, options: AssetQueryOptions): void {
    // 出租人 ID 过滤
    if (options.ownerId) {
      queryBuilder.andWhere('asset.ownerId = :ownerId', { ownerId: options.ownerId });
    }

    // 关键字搜索
    if (options.keyword) {
      queryBuilder.andWhere('(asset.name LIKE :keyword OR asset.description LIKE :keyword)', {
        keyword: `%${options.keyword}%`,
      });
    }

    // 分类代码过滤
    if (options.categoryCode) {
      queryBuilder.andWhere('asset.categoryCode = :categoryCode', {
        categoryCode: options.categoryCode,
      });
    }

    // 租赁方式过滤（需要 join 租赁方案表）
    if (options.rentalType) {
      queryBuilder.innerJoin('asset.rentalPlans', 'planForType').andWhere('planForType.rentalType = :rentalType', {
        rentalType: options.rentalType,
      });
    }

    // 价格区间过滤
    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      queryBuilder.innerJoin('asset.rentalPlans', 'planForPrice');
      if (options.minPrice !== undefined) {
        queryBuilder.andWhere('planForPrice.price >= :minPrice', {
          minPrice: options.minPrice,
        });
      }
      if (options.maxPrice !== undefined) {
        queryBuilder.andWhere('planForPrice.price <= :maxPrice', {
          maxPrice: options.maxPrice,
        });
      }
    }

    // 地区过滤
    if (options.provinceCode) {
      queryBuilder.andWhere('asset.provinceCode = :provinceCode', {
        provinceCode: options.provinceCode,
      });
    }

    if (options.cityCode) {
      queryBuilder.andWhere('asset.cityCode = :cityCode', {
        cityCode: options.cityCode,
      });
    }
    if (options.districtCode) {
      queryBuilder.andWhere('asset.districtCode = :districtCode', {
        districtCode: options.districtCode,
      });
    }
  }

  /**
   * 应用排序
   */
  private applySorting(queryBuilder: SelectQueryBuilder<AssetEntity>, options: AssetQueryOptions): void {
    const sortOrder = options.sortOrder || 'DESC';

    switch (options.sortBy) {
      case 'price': {
        // 按价格排序：使用子查询获取每个资产的最小价格，避免 GROUP BY 冲突
        const subQuery = this.dataSource
          .createQueryBuilder()
          .select('MIN(arp.price)', 'minPrice')
          .from('asset_rental_plan', 'arp')
          .where('arp.asset_id = asset.id')
          .getQuery();

        queryBuilder.addSelect(`(${subQuery})`, 'minPrice').orderBy('minPrice', 'ASC');
        break;
      }
      case 'viewCount':
        queryBuilder.orderBy('asset.viewCount', sortOrder);
        break;
      case 'rentalCount':
        queryBuilder.orderBy('asset.rentalCount', sortOrder);
        break;
      case 'rating':
        queryBuilder.orderBy('asset.rating', sortOrder);
        break;
      case 'nearby':
        if (options.latitude != null && options.longitude != null) {
          queryBuilder.orderBy('computed_distance', 'ASC').addOrderBy('asset.publishAt', 'DESC');
        } else {
          queryBuilder.orderBy('asset.publishAt', 'DESC');
        }
        break;
      case 'createdAt':
      case 'newest':
      default:
        queryBuilder.orderBy('asset.publishAt', sortOrder);
        break;
    }
  }

  private addComputedDistanceSelect(
    queryBuilder: SelectQueryBuilder<AssetEntity>,
    latitude: number,
    longitude: number,
  ): void {
    queryBuilder.addSelect(
      `ST_Distance_Sphere(point(asset.longitude, asset.latitude), point(:longitude, :latitude))`,
      'computed_distance',
    );
    queryBuilder.setParameters({
      latitude,
      longitude,
    });
  }

  private mergeComputedDistanceToAssets(assets: AssetEntity[], rawRows: Record<string, unknown>[]): void {
    const distanceByAssetId = new Map<string, number>();

    for (const raw of rawRows) {
      const assetId = raw.asset_id;
      if ((typeof assetId !== 'string' && typeof assetId !== 'number') || distanceByAssetId.has(String(assetId))) {
        continue;
      }

      const value = raw.computed_distance;
      const distance = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) || 0 : 0;
      distanceByAssetId.set(String(assetId), distance);
    }

    assets.forEach(asset => {
      const distance = distanceByAssetId.get(asset.id) ?? 0;
      Object.assign(asset, { distance, assetDistance: distance });
    });
  }
}
