import { Entity, Index } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { IsOptional } from 'class-validator';

/**
 * 资产实例换绑记录实体
 *
 * 记录订单从原资产实例换绑到新资产实例的历史，用于审计与追溯。
 * 仅当订单已绑定过实例、再绑定到另一实例时产生换绑记录。
 */
@Entity('asset_inventory_rebind_record')
@Index('IDX_asset_inventory_rebind_lessor_created', ['lessorId', 'createdAt'])
export class AssetInventoryRebindRecordEntity extends BaseEntity {
  /**
   * 租赁订单 ID（外键）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    comment: '租赁订单 ID（外键）',
  })
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
  @ApiPropertyOptional({ description: '订单号（冗余字段）' })
  orderNo?: string;

  /**
   * 换绑前资产实例 ID（原绑定实例）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    comment: '换绑前资产实例 ID（原绑定实例）',
  })
  @ApiProperty({ description: '换绑前资产实例 ID' })
  fromInventoryId: string;

  /**
   * 换绑后资产实例 ID（新绑定实例）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    comment: '换绑后资产实例 ID（新绑定实例）',
  })
  @ApiProperty({ description: '换绑后资产实例 ID' })
  toInventoryId: string;

  /**
   * 出租方 ID（操作人/归属）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    comment: '出租方 ID（操作人）',
  })
  @ApiProperty({ description: '出租方 ID（操作人）' })
  @Index()
  lessorId: string;

  /**
   * 承租方 ID（冗余字段，便于查询）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    comment: '承租方 ID（冗余字段）',
  })
  @ApiProperty({ description: '承租方 ID（冗余字段）' })
  lesseeId: string;

  /**
   * 资产 ID（冗余，便于按资产查换绑记录）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    comment: '资产 ID（冗余）',
  })
  @ApiProperty({ description: '资产 ID（冗余）' })
  assetId: string;

  /**
   * 换绑原因/备注（可选）
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '换绑原因/备注',
  })
  @IsOptional()
  @ApiPropertyOptional({ description: '换绑原因/备注' })
  reason?: string;
}
