import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { AssetInventoryEntity } from './asset-inventory.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { IsOptional } from 'class-validator';

/**
 * 资产实例租赁记录实体
 *
 * 记录资产实例的每次租赁历史，用于追踪实例的使用情况
 * 关联租赁订单，记录租赁的开始和结束时间、承租方等信息
 */
@Entity('asset_inventory_rental_record')
@Index('IDX_asset_inventory_rental_dates', ['startDate', 'endDate'])
export class AssetInventoryRentalRecordEntity extends BaseEntity {
  /**
   * 资产实例 ID（外键）
   */
  @Expose()
  @Column({ type: 'uuid', comment: '资产实例 ID（外键）' })
  @ApiProperty({ description: '资产实例 ID（外键）' })
  @Index()
  inventoryId: string;

  /**
   * 租赁订单 ID（外键，关联到 rental_order 表）
   */
  @Expose()
  @Column({ type: 'uuid', comment: '租赁订单 ID（外键）' })
  @ApiProperty({ description: '租赁订单 ID（外键）' })
  @Index()
  orderId: string;

  /**
   * 订单号（冗余字段，便于查询）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    nullable: true,
    comment: '订单号（冗余字段）',
  })
  @IsOptional()
  orderNo?: string;

  /**
   * 承租方 ID（外键）
   */
  @Expose()
  @Column({ type: 'uuid', comment: '承租方 ID（外键）' })
  @ApiProperty({ description: '承租方 ID（外键）' })
  @Index()
  lesseeId: string;

  /**
   * 出租方 ID（外键，冗余字段，便于查询）
   */
  @Expose()
  @Column({ type: 'uuid', comment: '出租方 ID（外键）' })
  @ApiProperty({ description: '出租方 ID（外键）' })
  lessorId: string;

  /**
   * 资产 ID（外键，冗余字段，便于查询）
   */
  @Expose()
  @Column({ type: 'uuid', comment: '资产 ID（外键）' })
  @ApiProperty({ description: '资产 ID（外键）' })
  assetId: string;

  /**
   * 租赁开始日期
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    comment: '租赁开始日期',
  })
  @ApiProperty({ description: '租赁开始日期' })
  startDate: Date;

  /**
   * 租赁结束日期（预期）
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '租赁结束日期（预期）',
    optional: true,
  })
  @IsOptional()
  @ApiPropertyOptional({ description: '租赁结束日期（预期）' })
  endDate?: Date;

  /**
   * 实际归还日期
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '实际归还日期',
    optional: true,
  })
  @IsOptional()
  @ApiPropertyOptional({ description: '实际归还日期' })
  actualReturnDate?: Date;

  /**
   * 租赁数量
   */
  @Expose()
  @ColumnWithApi({
    type: 'int',
    default: 1,
    comment: '租赁数量',
  })
  @ApiProperty({ description: '租赁数量', default: 1 })
  quantity: number;

  /**
   * 租赁状态：renting（租赁中）/ returned（已归还）/ canceled（已取消）
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    default: 'renting',
    comment: '租赁状态：renting（租赁中）/ returned（已归还）/ canceled（已取消）',
  })
  @ApiProperty({ description: '租赁状态', default: 'renting' })
  status: string;

  /**
   * 租赁订单快照
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '租赁订单快照',
  })
  @ApiProperty({ description: '租赁订单快照' })
  orderSnapshot?: Record<string, any>;

  /**
   * 租赁资产快照
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '租赁资产快照',
  })
  @ApiProperty({ description: '租赁资产快照' })
  assetSnapshot?: Record<string, any>;

  /**
   * 租赁方案快照
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '租赁方案快照',
  })
  @ApiProperty({ description: '租赁方案快照' })
  rentalPlanSnapshot?: Record<string, any>;

  /** =========================================== RELATIONS =========================================== */
  /**
   * 资产实例关系（多对一）
   */
  @ManyToOne(() => AssetInventoryEntity, inventory => inventory.rentalRecords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventory_id' })
  inventory: AssetInventoryEntity;
}
