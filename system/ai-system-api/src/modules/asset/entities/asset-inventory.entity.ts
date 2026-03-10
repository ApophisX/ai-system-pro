import { Entity, Index, ManyToOne, JoinColumn, Unique, OneToMany, OneToOne } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { AssetEntity } from './asset.entity';
import { AssetInventoryStatus } from '../enums';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { AssetInventoryRentalRecordEntity } from './asset-inventory-rental-record.entity';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import dayjs from 'dayjs';
import { AssetInventoryStatusLabelMap } from '../enums/asset-inventory-status.enum';

/**
 * 资产实例/库存实体
 *
 * 资产的可租赁实例，一个实例对应一件实物。
 * 一个资产（Asset）可以对应多个资产实例（AssetInventory）
 */
@Entity('asset_inventory')
@Index('IDX_asset_inventory_asset_status', ['assetId', 'status'])
@Index('IDX_asset_inventory_lessor_status', ['lessorId', 'status'])
@Unique(['assetId', 'instanceCode'])
export class AssetInventoryEntity extends BaseEntity {
  /**
   * 资产 ID（外键）
   */
  @Expose()
  @ColumnWithApi({ type: 'uuid', comment: '资产 ID（外键）', length: 50, nullable: true })
  @IsNotEmpty()
  @IsUUID()
  @Index()
  assetId: string;

  /**
   * 实例编号（同一资产下的唯一标识，如：A001、A002）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    nullable: true,
    comment: '实例编号（同一资产下的唯一标识）',
    update: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  instanceCode: string;

  /**
   * 实例图片
   */
  @Expose()
  @ColumnWithApi({
    type: 'simple-array',
    nullable: true,
    comment: '实例图片',
    optional: true,
  })
  @IsOptional()
  @IsArray()
  images?: string[];

  /**
   * 实例名称（可选，如：设备A、设备B）
   */
  @Expose()
  @ColumnWithApi({
    length: 200,
    nullable: true,
    comment: '实例名称（可选）',
    optional: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  instanceName?: string;

  /**
   * 实例状态
   */
  @Expose()
  @ColumnWithApi({
    type: 'enum',
    enum: AssetInventoryStatus,
    default: AssetInventoryStatus.AVAILABLE,
    comment:
      '实例状态：available（可用）/ rented（已占用）/ maintenance（维护中）/ sold（已出售）/ scraped（已报废）/ damaged（已损坏）/ lost（已丢失）',
  })
  @IsOptional()
  @IsEnum(AssetInventoryStatus)
  status: AssetInventoryStatus;

  /**
   * 出租人 ID（冗余自资产 ownerId，便于按出租人查询实例列表）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    nullable: true,
    comment: '出租人 ID（冗余自资产，便于按出租人查询）',
    optional: true,
  })
  @IsOptional()
  @IsUUID()
  @Index()
  lessorId?: string;

  /**
   * 当前承租人 ID（出租时写入，归还后清空；用于快速展示“谁在租”）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    nullable: true,
    comment: '当前承租人 ID（出租时写入，归还后清空）',
    optional: true,
  })
  @IsOptional()
  @IsUUID()
  lesseeId?: string;

  /**
   * 当前租赁订单 ID（出租时写入，归还后清空）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    nullable: true,
    comment: '当前租赁订单 ID（出租时写入，归还后清空）',
    optional: true,
  })
  @IsOptional()
  @IsUUID()
  @Index()
  orderId?: string;

  /**
   * 当前租赁订单号（冗余，便于展示与排查）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    nullable: true,
    comment: '当前租赁订单号（冗余）',
    optional: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  orderNo?: string;

  /**
   * 绑定时间（绑定到当前订单的时间）
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '绑定时间（绑定到当前订单的时间）',
    optional: true,
  })
  @IsOptional()
  boundAt?: Date;

  /**
   * 解绑时间（从当前订单解绑的时间）
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '解绑时间（从当前订单解绑的时间）',
    optional: true,
  })
  @IsOptional()
  unboundAt?: Date;

  /**
   * 实例位置（可选，如：仓库A-01号位）
   */

  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
    comment: '经度',
    optional: true,
  })
  @IsOptional()
  longitude: number;

  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
    comment: '纬度',
    optional: true,
  })
  @IsOptional()
  latitude: number;

  /**
   * 实例属性（JSON 对象，存储实例特有的属性，如：序列号、生产日期等）
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '实例属性（JSON 对象）',
    optional: true,
  })
  @IsOptional()
  attributes?: Record<string, any>;

  /** =========================================== 统计字段 =========================================== */

  /**
   * 换绑次数
   */
  @Expose()
  @ColumnWithApi({
    type: 'int',
    default: 0,
    comment: '换绑次数（订单换绑资产实例的总次数）',
    description: '换绑次数',
  })
  rebindCount: number;

  /**
   * 租赁次数
   */
  @Expose()
  @ColumnWithApi({
    type: 'int',
    default: 0,
    comment: '租赁次数（绑定订单的总次数）',
    description: '租赁次数',
  })
  rentalCount: number;

  /**
   * 租赁总时长（秒）
   * 不包含当前租赁时长，仅统计已完成的租赁时长（从绑定到解绑）
   */
  @Expose()
  @ColumnWithApi({
    type: 'bigint',
    default: 0,
    comment: '租赁总时长（秒），不包含当前租赁时长',
    description: '租赁总时长（秒）',
  })
  totalRentalDuration: number;

  /** =========================================== RELATIONS =========================================== */

  /**
   * 出租人关系（多对一）
   */
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessor_id' })
  lessor: UserEntity;

  /**
   * 承租人关系（多对一）
   */
  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lessee_id' })
  lessee: UserEntity;

  /**
   * 资产关系（多对一）
   */
  @ManyToOne(() => AssetEntity, asset => asset.inventories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'asset_id' })
  asset: AssetEntity;

  /**
   * 租赁记录关系（一对多）
   */
  @OneToMany(() => AssetInventoryRentalRecordEntity, record => record.inventory, {
    cascade: false,
    eager: false,
  })
  rentalRecords?: AssetInventoryRentalRecordEntity[];

  get idleDuration(): number {
    if (this.status === AssetInventoryStatus.RENTED) {
      return 0;
    }
    return dayjs().diff(this.unboundAt || this.createdAt, 'second');
  }

  get statusLabel(): string {
    return AssetInventoryStatusLabelMap[this.status];
  }
}
