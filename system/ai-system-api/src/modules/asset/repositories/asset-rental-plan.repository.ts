import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindOneOptions } from 'typeorm';
import { AssetRentalPlanEntity } from '../entities/asset-rental-plan.entity';

/**
 * 资产租赁方案仓储
 */
@Injectable()
export class AssetRentalPlanRepository {
  constructor(
    @InjectRepository(AssetRentalPlanEntity)
    private readonly repo: Repository<AssetRentalPlanEntity>,
  ) {}

  /**
   * 保存租赁方案
   */
  async save(plan: AssetRentalPlanEntity): Promise<AssetRentalPlanEntity> {
    return this.repo.save(plan);
  }

  /**
   * 批量保存租赁方案
   */
  async saveMany(plans: AssetRentalPlanEntity[]): Promise<AssetRentalPlanEntity[]> {
    return this.repo.save(plans);
  }

  /**
   * 根据 ID 查找
   */
  async findById(id: number, options?: FindOneOptions<AssetRentalPlanEntity>): Promise<AssetRentalPlanEntity> {
    const plan = await this.repo.findOne({
      ...options,
      where: { ...options?.where, id },
    });
    if (!plan) {
      throw new NotFoundException('租赁方案不存在');
    }
    return plan;
  }

  /**
   * 根据资产 ID 查找所有方案
   */
  async findByAssetId(assetId: string): Promise<AssetRentalPlanEntity[]> {
    return this.repo.find({
      where: { assetId, isActive: true },
      order: { sortOrder: 'DESC', createdAt: 'ASC' },
    });
  }

  /**
   *
   */
  async findByAssetIds(assetIds: string[]): Promise<AssetRentalPlanEntity[]> {
    return this.repo.find({
      where: { assetId: In(assetIds), isActive: true },
      order: { sortOrder: 'DESC', createdAt: 'ASC' },
    });
  }

  /**
   * 根据资产 ID 删除所有方案
   */
  async deleteByAssetId(assetId: string): Promise<void> {
    await this.repo.softDelete({ assetId });
  }

  /**
   * 删除方案
   */
  async softDelete(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }

  /**
   * 批量删除（排除指定 ID）
   */
  async deleteByAssetIdExcludeIds(assetId: string, excludeIds: number[]): Promise<void> {
    if (excludeIds.length === 0) {
      await this.deleteByAssetId(assetId);
      return;
    }

    await this.repo
      .createQueryBuilder()
      .softDelete()
      .where('assetId = :assetId', { assetId })
      .andWhere('id NOT IN (:...excludeIds)', { excludeIds })
      .execute();
  }
}
