import { Entity, Index, ManyToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Expose, Transform, Type } from 'class-transformer';
import { BaseAreaEntity } from '@/infrastructure/database/entities/base.entity';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import { AssetStatus, AssetAuditStatus } from '../enums';
import { AssetInventoryEntity } from './asset-inventory.entity';
import { AssetCategoryEntity } from './asset-category.entity';
import { AssetRentalPlanEntity } from './asset-rental-plan.entity';
import { AssetTagEntity } from './asset-tag.entity';
import { IsArray, IsNotEmpty, IsOptional, Max, MaxLength, Min } from 'class-validator';
import { ContactEntity } from '@/modules/contact/entities';
import { KeyValuePair } from '@/common/dtos/base-response.dto';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';

export abstract class BaseAssetEntity extends BaseAreaEntity {
  /**
   * 资产名称
   */
  @Expose()
  @ColumnWithApi({ length: 200, comment: '资产名称', nullable: true })
  @IsOptional()
  @MaxLength(200)
  name?: string;

  /**
   * 可租数量
   */
  @Expose()
  @ColumnWithApi({ type: 'int', default: 1, comment: '可租数量', unsigned: true })
  @IsOptional()
  @Min(1)
  @Max(200)
  availableQuantity: number;

  /**
   * 物流方式
   */
  @Expose()
  @ColumnWithApi({
    type: 'simple-array',
    nullable: true,
    comment: '物流方式（JSON 数组）',
  })
  @IsArray()
  @IsNotEmpty()
  deliveryMethods: string[] = [];

  /**
   * 物流费用
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 0,
    comment: '物流费用',
    apiOptions: { type: 'number' },
  })
  @IsOptional()
  deliveryFee: string;

  /**
   * 资产描述
   */
  @Expose()
  @IsOptional()
  @MaxLength(3000)
  @ColumnWithApi({
    type: 'text',
    nullable: true,
    comment: '资产描述',
    optional: true,
  })
  description?: string;

  /**
   * 其他说明
   */
  @Expose()
  @IsOptional()
  @MaxLength(3000)
  @ColumnWithApi({
    type: 'text',
    nullable: true,
    comment: '其他说明',
    optional: true,
  })
  notes?: string;

  /**
   * 资产图片（JSON 数组，存储图片 URL）
   */
  @Expose()
  @IsNotEmpty()
  @IsArray()
  @ColumnWithApi({
    type: 'simple-array',
    nullable: true,
    comment: '资产图片（JSON 数组）',
  })
  images: string[] = [];

  /**
   * 资产详情图片
   */
  @Expose()
  @IsOptional()
  @ColumnWithApi({
    type: 'simple-array',
    nullable: true,
    comment: '资产详情图片（JSON 数组）',
    optional: true,
  })
  detailImages?: string[] = [];

  /**
   * 资产封面图（主图 URL）
   */
  @Expose()
  @IsOptional()
  @ColumnWithApi({
    length: 500,
    nullable: true,
    comment: '资产封面图（主图 URL）',
    optional: true,
  })
  coverImage?: string;

  /**
   * 资产状态
   */
  @Expose()
  @IsOptional()
  @ColumnWithApi({
    type: 'enum',
    enum: AssetStatus,
    default: AssetStatus.DRAFT,
    comment: '资产状态：draft（草稿）/ available（可出租）/ offline（下架）',
  })
  status: AssetStatus;

  /**
   * 联系人
   */
  @Expose()
  @IsNotEmpty()
  @ColumnWithApi({ length: 100, nullable: true, comment: '联系人' })
  @MaxLength(100)
  contactName: string;

  /**
   * 联系人手机号
   */
  @Expose()
  @IsNotEmpty()
  @ColumnWithApi({ length: 20, nullable: true, comment: '联系人手机号' })
  contactPhone: string;

  /**
   * 联系人微信号
   */
  @Expose()
  @IsOptional()
  @ColumnWithApi({
    length: 100,
    nullable: true,
    comment: '联系人微信号',
    optional: true,
  })
  contactWeChat?: string;

  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '押金（单位：元）',
    apiOptions: { type: 'number' },
  })
  @IsOptional()
  @Max(99999999)
  @Min(0)
  @Transform(({ value }) => Number(value || 0))
  deposit: string;

  /**
   * 是否需要实名认证
   */
  @Expose()
  @IsOptional()
  @ColumnWithApi({
    type: 'boolean',
    default: false,
    comment: '是否需要实名认证',
  })
  @Transform(({ value }) => value ?? false)
  requireRealName: boolean;

  /**
   * 资产规格（JSON 对象，如：{"品牌": "XX", "型号": "YY", "功率": "1000W"}）
   */
  @Expose()
  @IsOptional()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '资产规格（JSON 对象）',
    optional: true,
    apiOptions: {
      type: [KeyValuePair],
    },
  })
  @Type(() => KeyValuePair)
  specifications?: KeyValuePair[] = [];

  /**
   * 资产属性（JSON 对象，存储扩展属性）
   */
  @Expose()
  @IsOptional()
  @ColumnWithApi({ type: 'json', nullable: true, comment: '资产属性（JSON 对象）', optional: true })
  attributes?: Record<string, any>;

  /**
   * 自定义标签
   */
  @Expose()
  @ColumnWithApi({ type: 'simple-array', nullable: true, comment: '自定义标签（JSON 数组）', optional: true })
  customTags: string[] = [];

  /**
   * 排序权重（数字越大越靠前）
   */
  @Expose()
  @IsOptional()
  @ColumnWithApi({ type: 'int', default: 0, comment: '排序权重（数字越大越靠前）' })
  sortOrder: number;

  /**
   * 评分（0-5，保留2位小数）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
    comment: '评分（0-5，保留2位小数）',
    apiOptions: { type: 'number' },
  })
  rating: string = '0';

  /**
   * 是否支持信用免押
   */
  @Expose()
  @ColumnWithApi({ type: 'boolean', default: false, comment: '是否支持信用免押' })
  @IsOptional()
  creditFreeDeposit: boolean;

  /**
   * 是否是后付费
   */
  @Expose()
  @ColumnWithApi({ type: 'boolean', default: false, comment: '是否是后付费' })
  @IsOptional()
  isPostPayment: boolean;

  /**
   * 资产是否需要归还
   */
  @Expose()
  @ColumnWithApi({ type: 'boolean', default: false, comment: '资产是否需要归还' })
  @IsOptional()
  needReturn: boolean;

  @ColumnWithApi({
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
    comment: '距离',
  })
  @Expose()
  distance: number;

  /**
   * 资产是否可购买
   */
  @Expose()
  @ColumnWithApi({ type: 'boolean', default: false, comment: '资产是否可购买', nullable: true, optional: true })
  @IsOptional()
  isBuyable: boolean;

  /**
   * 是否是商城商品
   */
  @Expose()
  @ColumnWithApi({ type: 'boolean', default: false, comment: '是否是商城商品', nullable: true, optional: true })
  @IsOptional()
  isMallProduct: boolean;

  /**
   * 是否自动发货
   */
  @Expose()
  @ColumnWithApi({
    type: 'boolean',
    default: false,
    comment: '是否自动发货',
    nullable: true,
    optional: true,
  })
  @IsOptional()
  autoDelivery: boolean;

  /**
   * 是否需要电子签名
   */

  @Expose()
  @ColumnWithApi({ type: 'boolean', default: false, comment: '是否需要电子签名', nullable: true, optional: true })
  @IsOptional()
  requireElectronicSignature: boolean;

  // ------------------------------------------ RELATION FIELDS ------------------------------------------

  /**
   * 出租方 ID（资产所有者）
   */
  @Expose()
  @ColumnWithApi({ type: 'uuid', length: 50, comment: '联系人 ID', nullable: true })
  contactId: string;

  /**
   * 出租方 ID（资产所有者）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    comment: '出租方 ID（资产所有者）',
    nullable: true,
  })
  @Index()
  ownerId: string;

  /**
   * 资产分类代码（冗余字段，便于查询）
   */
  @Expose()
  @ColumnWithApi({ length: 50, nullable: true, comment: '资产分类代码' })
  categoryCode: string;

  /**
   * 资产分类代码（冗余字段，便于查询）
   */
  @Expose()
  @ColumnWithApi({ length: 50, nullable: true, comment: '资产分类名称' })
  categoryName: string;

  /**
   * 资产分类代码（冗余字段，便于查询）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    length: 50,
    nullable: true,
    comment: '资产分类Id',
  })
  @IsOptional()
  categoryId: string;

  /**
   * 审核状态：pending（待审核）/ approved（审核通过）/ rejected（审核拒绝）
   */
  @Expose()
  @ColumnWithApi({
    type: 'enum',
    enum: AssetAuditStatus,
    default: AssetAuditStatus.PENDING,
    comment: '审核状态：pending（待审核）/ approved（审核通过）/ rejected（审核拒绝）',
  })
  auditStatus: AssetAuditStatus;

  /**
   * 审核人 ID（后台管理人员）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    nullable: true,
    comment: '审核人 ID（后台管理人员）',
  })
  auditById?: string;

  /**
   * 审核时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '审核时间',
    optional: true,
  })
  auditAt?: Date;

  /**
   * 上架时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '上架时间',
  })
  publishAt?: Date;
  /**
   * 审核意见/备注
   */
  @Expose()
  @MaxLength(1000)
  @ColumnWithApi({
    type: 'text',
    nullable: true,
    comment: '审核意见/备注',
    optional: true,
  })
  auditRemark?: string;
}

/**
 * 资产实体
 *
 * 可被出租的抽象资产定义，描述"是什么"
 * 不代表具体实例，一个资产可以对应多个资产实例（AssetInventory）
 */
@Entity('asset')
@Index('IDX_asset_owner_status', ['ownerId', 'status'])
@Index('IDX_asset_owner_audit', ['ownerId', 'auditStatus'])
@Index('IDX_asset_category_status', ['categoryCode', 'status'])
@Index('IDX_asset_status_audit', ['status', 'auditStatus'])
export class AssetEntity extends BaseAssetEntity {
  /**
   * 浏览次数
   */
  @Expose()
  @ColumnWithApi({ type: 'int', default: 0, comment: '浏览次数' })
  viewCount: number = 0;

  /**
   * 收藏次数
   */
  @Expose()
  @ColumnWithApi({ type: 'int', default: 0, comment: '收藏次数' })
  favoriteCount: number = 0;

  /**
   * 租赁次数
   */
  @Expose()
  @ColumnWithApi({ type: 'int', default: 0, comment: '租赁次数' })
  rentalCount: number = 0;

  /**
   * 已通过审核的评价数量
   */
  @Expose()
  @ColumnWithApi({ type: 'int', default: 0, comment: '已通过审核的评价数量' })
  reviewCount: number = 0;

  /**
   * 1 星评价数量
   */
  @Expose()
  @ColumnWithApi({ type: 'int', default: 0, comment: '1 星评价数量' })
  score1Count: number = 0;

  /**
   * 2 星评价数量
   */
  @Expose()
  @ColumnWithApi({ type: 'int', default: 0, comment: '2 星评价数量' })
  score2Count: number = 0;

  /**
   * 3 星评价数量
   */
  @Expose()
  @ColumnWithApi({ type: 'int', default: 0, comment: '3 星评价数量' })
  score3Count: number = 0;

  /**
   * 4 星评价数量
   */
  @Expose()
  @ColumnWithApi({ type: 'int', default: 0, comment: '4 星评价数量' })
  score4Count: number = 0;

  /**
   * 5 星评价数量
   */
  @Expose()
  @ColumnWithApi({ type: 'int', default: 0, comment: '5 星评价数量' })
  score5Count: number = 0;

  /** =========================================== RELATIONS =========================================== */
  /**
   * 出租方关系（多对一）
   */
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;

  /**
   * 资产分类关系（多对一）
   */
  @ManyToOne(() => AssetCategoryEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: AssetCategoryEntity;

  /**
   * 资产实例关系（一对多）
   */
  @OneToMany(() => AssetInventoryEntity, inventory => inventory.asset, {
    cascade: false,
    eager: false,
  })
  inventories?: AssetInventoryEntity[];

  /**
   * 租赁方案关系（一对多）
   * 一个资产可以有多个租赁方案（如：日租方案、月租方案）
   */
  @OneToMany(() => AssetRentalPlanEntity, plan => plan.asset, {
    cascade: false,
    eager: false,
  })
  rentalPlans?: AssetRentalPlanEntity[];

  /**
   * 标签关系（多对多）
   * 一个资产可以有多个标签，一个标签可以关联多个资产
   */
  @ManyToMany(() => AssetTagEntity, tag => tag.assets, {
    cascade: false,
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'asset_tag_relations',
    joinColumn: { name: 'asset_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags?: AssetTagEntity[];

  @ManyToOne(() => ContactEntity, { onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'contact_id' })
  contact: ContactEntity;

  /** =========================================== RELATIONS =========================================== */

  get isOnline(): boolean {
    return this.status === AssetStatus.AVAILABLE && this.auditStatus === AssetAuditStatus.APPROVED;
  }
}
