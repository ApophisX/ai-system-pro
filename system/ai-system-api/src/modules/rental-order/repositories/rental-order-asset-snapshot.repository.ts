import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RentalOrderAssetSnapshotEntity } from '../entities/rental-order-asset.entity';

/**
 * 租赁订单资产快照仓储
 */
@Injectable()
export class RentalOrderAssetSnapshotRepository extends Repository<RentalOrderAssetSnapshotEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(RentalOrderAssetSnapshotEntity, dataSource.createEntityManager());
  }

  /**
   * 根据 ID 查找资产快照
   */
  async findById(id: string): Promise<RentalOrderAssetSnapshotEntity | null> {
    return this.findOne({
      where: { id },
      relations: ['order', 'asset'],
    });
  }

  /**
   * 根据订单 ID 查找资产快照
   */
  async findByOrderId(orderId: string): Promise<RentalOrderAssetSnapshotEntity | null> {
    return this.findOne({
      where: { orderId },
      relations: ['order', 'asset'],
    });
  }

  /**
   * 根据订单号查找资产快照
   */
  async findByOrderNo(orderNo: string): Promise<RentalOrderAssetSnapshotEntity | null> {
    return this.findOne({
      where: { orderNo },
      relations: ['order', 'asset'],
    });
  }

  /**
   * 根据资产 ID 查找所有快照
   */
  async findByAssetId(assetId: string): Promise<RentalOrderAssetSnapshotEntity[]> {
    return this.find({
      where: { assetId },
      relations: ['order', 'asset'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 批量保存资产快照
   */
  async saveMany(snapshots: RentalOrderAssetSnapshotEntity[]): Promise<RentalOrderAssetSnapshotEntity[]> {
    return super.save(snapshots);
  }
}
