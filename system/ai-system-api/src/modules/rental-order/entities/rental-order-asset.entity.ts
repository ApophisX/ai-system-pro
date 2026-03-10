import { Entity, Column, Index, JoinColumn, OneToOne, ManyToOne } from 'typeorm';
import { RentalOrderEntity } from './rental-order.entity';
import { AssetEntity, BaseAssetEntity } from '@/modules/asset/entities/asset.entity';
import { Expose } from 'class-transformer';
import { UserEntity } from '@/modules/base/user/entities/user.entity';

/**
 * 租赁订单资产快照实体
 *
 * 记录订单创建时资产的信息快照，确保订单数据的不可变性和可审计性
 * 支持多资产、多实例租赁（B2B场景）
 * 特征：不可变快照、可审计、可回放
 */
@Entity('rental_order_asset')
export class RentalOrderAssetSnapshotEntity extends BaseAssetEntity {
  @Column({
    type: 'uuid',
    comment: '订单 ID',
    length: 50,
  })
  @Expose()
  @Index()
  orderId: string;

  @Expose()
  @Column({ length: 50, comment: '订单号', nullable: true })
  orderNo: string;

  @Column({ type: 'uuid', comment: '资产 ID', length: 50, nullable: true })
  @Expose()
  @Index()
  assetId: string;

  /** =========================================== RELATIONS =========================================== */
  @OneToOne(() => RentalOrderEntity, order => order.assetSnapshot, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: RentalOrderEntity;

  @ManyToOne(() => AssetEntity, { onDelete: 'SET NULL' })
  asset: AssetEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;
}
