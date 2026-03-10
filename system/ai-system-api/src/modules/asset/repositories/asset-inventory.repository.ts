import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindManyOptions, DataSource, FindOneOptions } from 'typeorm';
import { AssetInventoryEntity } from '../entities/asset-inventory.entity';
import { AssetInventoryStatus } from '../enums';

/**
 * 资产库存仓储
 */
@Injectable()
export class AssetInventoryRepository extends Repository<AssetInventoryEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(AssetInventoryEntity, dataSource.createEntityManager());
  }

  /**
   * 根据 ID 查找
   */
  async findById(id: string, options?: FindOneOptions<AssetInventoryEntity>): Promise<AssetInventoryEntity | null> {
    const inventory = await this.findOne({
      ...options,
      where: { ...options?.where, id },
      relations: { asset: true, lessor: true, lessee: true },
    });
    return inventory;
  }

  /**
   * 根据 ID 查找（不存在则抛出异常）
   */
  async findByIdOrFail(id: string, options?: FindOneOptions<AssetInventoryEntity>): Promise<AssetInventoryEntity> {
    const inventory = await this.findById(id, options);
    if (!inventory) {
      throw new NotFoundException('资产实例不存在');
    }
    return inventory;
  }

  /**
   * 根据资产 ID 和实例编号查找
   */
  async findByAssetIdAndInstanceCode(assetId: string, instanceCode: string): Promise<AssetInventoryEntity | null> {
    return this.findOne({
      where: { assetId, instanceCode },
    });
  }

  /**
   * 统计某用户（出租方）名下的资产实例总数（未删除）
   * 优先按 lessorId 统计；lessorId 为空时按资产 owner 统计（兼容旧数据）
   */
  async countByOwnerId(ownerId: string): Promise<number> {
    const result = await this.createQueryBuilder('inventory')
      .leftJoin('asset', 'asset', 'asset.id = inventory.asset_id')
      .where('(inventory.lessor_id = :ownerId OR (inventory.lessor_id IS NULL AND asset.owner_id = :ownerId))', {
        ownerId,
      })
      .andWhere('inventory.isActive = :isActive', { isActive: true })
      .select('COUNT(inventory.id)', 'total')
      .getRawOne();
    return Number(result?.total) || 0;
  }

  /**
   * 统计用户总资产实例数量（不包括已删除的）
   */
  async countTotalByOwnerId(ownerId: string): Promise<number> {
    return this.createQueryBuilder('inventory')
      .where('inventory.lessorId = :ownerId', { ownerId })
      .andWhere('inventory.deletedAt IS NULL')
      .getCount();
  }

  /**
   * 根据资产 ID 查找所有库存
   */
  async findByAssetId(assetId: string): Promise<AssetInventoryEntity[]> {
    return this.find({
      where: { assetId, isActive: true, lessor: { profile: true } },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * 根据资产 ID 查找可用库存
   */
  async findAvailableByAssetId(assetId: string): Promise<AssetInventoryEntity[]> {
    return this.find({
      where: {
        assetId,
        status: AssetInventoryStatus.AVAILABLE,
        isActive: true,
      },
    });
  }

  /**
   * 获取资产的实例总数（一实例即一件）
   */
  async getTotalQuantity(assetId: string): Promise<number> {
    const result = await this.createQueryBuilder('inventory')
      .select('COUNT(inventory.id)', 'total')
      .where('inventory.assetId = :assetId', { assetId })
      .andWhere('inventory.isActive = :isActive', { isActive: true })
      .getRawOne();
    return Number(result?.total) || 0;
  }

  /**
   * 获取资产的可用实例数量（状态为可用的实例数）
   */
  async getAvailableQuantity(assetId: string): Promise<number> {
    const result = await this.createQueryBuilder('inventory')
      .select('COUNT(inventory.id)', 'total')
      .where('inventory.assetId = :assetId', { assetId })
      .andWhere('inventory.isActive = :isActive', { isActive: true })
      .andWhere('inventory.status = :status', { status: AssetInventoryStatus.AVAILABLE })
      .getRawOne();
    return Number(result?.total) || 0;
  }

  /**
   * 分页查询资产实例列表
   */
  async findWithPagination(
    where: FindOptionsWhere<AssetInventoryEntity>,
    options?: {
      skip?: number;
      take?: number;
      relations?: string[];
      order?: { [key: string]: 'ASC' | 'DESC' };
      keyword?: string;
    },
  ): Promise<[AssetInventoryEntity[], number]> {
    const queryBuilder = this.createQueryBuilder('inventory');

    // 添加基础查询条件
    if (where.assetId) {
      queryBuilder.andWhere('inventory.assetId = :assetId', { assetId: where.assetId });
    }
    if (where.status) {
      queryBuilder.andWhere('inventory.status = :status', { status: where.status });
    }
    if (where.instanceCode) {
      queryBuilder.andWhere('inventory.instanceCode = :instanceCode', {
        instanceCode: where.instanceCode,
      });
    }
    if (where.lessorId) {
      queryBuilder.andWhere('inventory.lessorId = :lessorId', { lessorId: where.lessorId });
    }

    // 关键字搜索
    if (options?.keyword) {
      queryBuilder.andWhere('(inventory.instanceCode LIKE :keyword OR inventory.instanceName LIKE :keyword)', {
        keyword: `%${options.keyword}%`,
      });
    }

    // 关联查询
    if (options?.relations?.includes('asset')) {
      queryBuilder.leftJoinAndSelect('inventory.asset', 'asset');
    }

    // 排序
    if (options?.order) {
      Object.entries(options.order).forEach(([key, order]) => {
        queryBuilder.addOrderBy(`inventory.${key}`, order);
      });
    } else {
      queryBuilder.orderBy('inventory.createdAt', 'DESC');
    }

    // 分页
    if (options?.skip !== undefined) {
      queryBuilder.skip(options.skip);
    }
    if (options?.take !== undefined) {
      queryBuilder.take(options.take);
    }

    return queryBuilder.getManyAndCount();
  }
}
