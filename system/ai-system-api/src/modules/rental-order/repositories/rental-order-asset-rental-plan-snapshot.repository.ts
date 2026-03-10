import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RentalOrderAssetRentalPlanSnapshotEntity } from '../entities/rental-order-asset-rental-plan.entity';

/**
 * 租赁订单资产租赁方案快照仓储
 */
@Injectable()
export class RentalOrderAssetRentalPlanSnapshotRepository extends Repository<RentalOrderAssetRentalPlanSnapshotEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(RentalOrderAssetRentalPlanSnapshotEntity, dataSource.createEntityManager());
  }

  /**
   * 根据 ID 查找租赁方案快照
   */
  async findById(id: number): Promise<RentalOrderAssetRentalPlanSnapshotEntity | null> {
    return this.findOne({
      where: { id },
      relations: ['order', 'owner'],
    });
  }

  /**
   * 根据订单 ID 查找租赁方案快照
   */
  async findByOrderId(orderId: string): Promise<RentalOrderAssetRentalPlanSnapshotEntity | null> {
    return this.findOne({
      where: { orderId },
      relations: ['order', 'owner'],
    });
  }

  /**
   * 根据订单号查找租赁方案快照
   */
  async findByOrderNo(orderNo: string): Promise<RentalOrderAssetRentalPlanSnapshotEntity | null> {
    return this.findOne({
      where: { orderNo },
      relations: ['order', 'owner'],
    });
  }

  /**
   * 批量保存租赁方案快照
   */
  async saveMany(
    snapshots: RentalOrderAssetRentalPlanSnapshotEntity[],
  ): Promise<RentalOrderAssetRentalPlanSnapshotEntity[]> {
    return super.save(snapshots);
  }
}
