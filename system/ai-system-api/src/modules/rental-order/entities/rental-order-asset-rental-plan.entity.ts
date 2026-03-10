import { Entity, Column, Index, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BaseAssetRentalPlanEntity } from '@/modules/asset/entities/asset-rental-plan.entity';
import { RentalOrderEntity } from '.';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';

/**
 * 租赁订单实体
 *
 * 一次完整的租赁交易记录，租赁行为的载体
 * 资金、履约、争议的核心锚点
 * 特征：不可变快照、可审计、可回放
 */
@Entity('rental_order_asset_rental_plan')
export class RentalOrderAssetRentalPlanSnapshotEntity extends BaseAssetRentalPlanEntity {
  /**
   * 订单ID
   */
  @Expose()
  @ColumnWithApi({ type: 'uuid', comment: '订单 ID', length: 50 })
  @Index()
  orderId: string;

  @Expose()
  @Column({ length: 50, comment: '订单号' })
  orderNo: string;

  /** =========================================== RELATIONS START =========================================== */

  @ApiHideProperty()
  @OneToOne(() => RentalOrderEntity, order => order.rentalPlanSnapshot, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: RentalOrderEntity;

  @ApiHideProperty()
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;

  /** =========================================== RELATIONS END =========================================== */
}
