import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntityWithNumericId } from '@/infrastructure/database/entities/base.entity';
import { AssetEntity } from './asset.entity';
import { RentalType, RentalTypeValues } from '../enums/rental-type.enum';
import { DeliveryMethod } from '../enums/delivery-method.enum';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, Max, MaxLength, Min } from 'class-validator';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { RenewalPolicyDto } from '../dto/output-asset-plan.dto';
import { KeyValuePair } from '@/common/dtos/base-response.dto';

export class BaseAssetRentalPlanEntity extends BaseEntityWithNumericId {
  /**
   * 资产 ID（关联到资产）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    comment: '资产 ID',
    length: 50,
    nullable: true,
  })
  @Index()
  assetId: string;

  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    comment: '出租方 ID（资产所有者）',
    length: 50,
    nullable: true,
  })
  @Index()
  ownerId: string;

  /**
   * 方案名称（如：标准日租方案、优惠月租方案）
   */
  @Expose()
  @ColumnWithApi({ length: 50, comment: '方案名称', nullable: true })
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  /**
   * 方案描述
   */
  @Expose()
  @ColumnWithApi({
    type: 'text',
    nullable: true,
    comment: '方案描述',
  })
  description?: string;

  /**
   * 租赁方式
   */
  @Expose()
  @ColumnWithApi({
    type: 'enum',
    enum: RentalType,
    comment:
      '租赁方式：hourly（小时租）/ daily（日租）/ weekly（周租）/ monthly（月租）/ quarterly（季租）/ yearly（年租）/ buy（购买）',
  })
  @IsNotEmpty()
  @IsIn(RentalTypeValues)
  rentalType: RentalType;

  /**
   * 租赁价格（单位：分，每个租赁单位的租金）
   * 例如：日租方案中，price = 10000 表示每天 100 元
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '租赁价格（每个租赁单位的租金）',
    apiOptions: { type: 'number' },
  })
  @IsNotEmpty()
  @Max(99999999)
  @Min(0.01)
  price: string;

  /**
   * 押金（单位：分）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '押金',
    apiOptions: { type: 'number' },
  })
  @IsOptional()
  @Max(99999999)
  @Min(0)
  deposit: string;

  // 租赁期数
  @Expose()
  @ColumnWithApi({
    type: 'int',
    default: 1,
    comment: '租赁期数',
  })
  @IsNotEmpty()
  @IsNumber()
  @Max(100)
  @Min(1)
  rentalPeriod: number;

  /**
   * 最短租期（单位：根据 rentalType 确定，如日租方案的单位是天）
   * 例如：日租方案中，minPeriod = 3 表示最少租 3 天
   */
  @Expose()
  @ColumnWithApi({
    type: 'int',
    default: 1,
    comment: '最短租期（单位：根据租赁方式确定）',
    apiOptions: { type: 'number' },
  })
  @IsOptional()
  minPeriod: string;

  /**
   * 最长租期（单位：根据 rentalType 确定）
   * 例如：日租方案中，maxPeriod = 365 表示最多租 365 天
   * 0 表示不限制
   */
  @Expose()
  @ColumnWithApi({
    type: 'int',
    default: 0,
    comment: '最长租期（单位：根据租赁方式确定，0 表示不限制）',
    apiOptions: { type: 'number' },
  })
  @IsOptional()
  maxPeriod: string;

  /**
   * 逾期计时费用（单位：元/天）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '逾期计时费用（单位：元/天）',
    apiOptions: { type: 'number' },
  })
  @IsOptional()
  overdueFee: string;

  @Expose()
  @ColumnWithApi({
    type: 'enum',
    enum: ['day', 'hour'],
    default: 'day',
    comment: '逾期计时费用单位',
  })
  @IsOptional()
  @IsIn(['day', 'hour'])
  overdueFeeUnit: 'day' | 'hour';

  /**
   * 违约金（单位：分，违约时一次性扣除的费用）
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '违约金（单位：分）',
    apiOptions: { type: 'number' },
  })
  @IsOptional()
  penaltyFee: string;

  /**
   * 送货方式：same-city-delivery（同城配送）/ self-pickup（上门自提）/ express-delivery（快递配送）/ mail-delivery（邮寄配送）/ cash-on-delivery（到付）/ other（其他）
   */
  @Expose()
  @ColumnWithApi({
    type: 'enum',
    enum: DeliveryMethod,
    nullable: true,
    comment: '送货方式',
  })
  deliveryMethod?: DeliveryMethod;

  /**
   * 配送费
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '配送费',
    apiOptions: { type: 'number' },
  })
  deliveryFee: string;

  /**
   * 是否租满后资产归属客户
   * true：租满指定期数后，资产所有权转移给客户（类似分期购买）
   * false：租赁期满后资产归还
   */
  @Expose()
  @ColumnWithApi({
    type: 'boolean',
    default: false,
    comment: '是否租满后资产归属客户',
  })
  @IsOptional()
  transferOwnershipAfterRental: boolean;

  /**
   * 租满后资产归属的期数（当 transferOwnershipAfterRental = true 时有效）
   * 例如：12 表示租满 12 期后资产归属客户
   */
  @Expose()
  @ColumnWithApi({
    type: 'int',
    nullable: true,
    comment: '租满后资产归属的期数（当 transferOwnershipAfterRental = true 时有效）',
  })
  ownershipTransferPeriod?: number;

  /**
   * 是否支持分期租赁
   */
  @Expose()
  @ColumnWithApi({
    type: 'boolean',
    default: false,
    comment: '是否支持分期租赁',
  })
  @IsOptional()
  isInstallment: boolean;

  /**
   * 一次性支付全部分期租金
   */
  @Expose()
  @ColumnWithApi({
    type: 'boolean',
    default: false,
    comment: '一次性支付全部分期租金',
  })
  @IsOptional()
  payAllInstallmentInOneTime: boolean;

  /**
   * 可租时间窗口（JSON 对象，定义可租赁的时间段）
   * 例如：{ "weekdays": [1,2,3,4,5], "timeSlots": ["09:00-18:00"] }
   * 或：{ "startDate": "2024-01-01", "endDate": "2024-12-31" }
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '可租时间窗口（JSON 对象）',
  })
  availabilityWindow?: Record<string, unknown>;

  /**
   * 使用限制（JSON 对象，定义资产使用限制）
   * 例如：{ "maxUsageHours": 8, "requireLicense": true, "restrictedAreas": ["危险区域"] }
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '使用限制（JSON 对象）',
  })
  usageRestrictions?: Record<string, unknown>;

  /**
   * 提前归还规则（JSON 对象）
   * 例如：{ "allowEarlyReturn": true, "refundPolicy": "按剩余天数退款", "penalty": 0 }
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '提前归还规则（JSON 对象）',
  })
  earlyReturnPolicy?: Record<string, unknown>;

  /**
   * 续租规则（JSON 对象）
   * 例如：{ "allowRenewal": true, "maxRenewalTimes": 3, "renewalDiscount": 0.1 }
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '续租规则（JSON 对象）',
  })
  renewalPolicy?: RenewalPolicyDto;

  /**
   * 资产属性（JSON 对象）
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '资产属性（JSON 对象）',
    optional: true,
  })
  @IsOptional()
  attributes?: Record<string, any>;

  /**
   * 平台服务费率（百分比，0-100）
   * 例如：5 表示平台抽取 5% 的服务费
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: '平台服务费率（百分比，0-100）',
    apiOptions: { type: 'number' },
  })
  platformServiceRate: string;

  /**
   * 排序权重（数字越大越靠前）
   */
  @Expose()
  @ColumnWithApi({
    type: 'int',
    default: 0,
    comment: '排序权重（数字越大越靠前）',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(999999)
  sortOrder: number;

  /** =========================================== GETTERS =========================================== */

  /**
   * 是否是小时租
   */
  get isHourly(): boolean {
    return this.rentalType === RentalType.HOURLY;
  }

  /**
   * 逾期费用单位标签
   */
  get overdueFeeUnitLabel(): string {
    return { day: '天', hour: '小时' }[this.overdueFeeUnit];
  }
}

/**
 * 资产租赁方案实体
 *
 * 定义资产的租赁约束条件和定价规则
 * 一个资产可以有多个租赁方案（如：日租方案、月租方案）
 * 用于订单生成与校验，不直接参与支付
 */
@Entity('asset_rental_plan')
@Index('IDX_asset_rental_plan_asset_rental_type', ['assetId', 'rentalType'])
export class AssetRentalPlanEntity extends BaseAssetRentalPlanEntity {
  /** =========================================== RELATIONS =========================================== */
  /**
   * 资产关系（多对一）
   * 一个资产可以有多个租赁方案
   */
  @ManyToOne(() => AssetEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_id' })
  asset: AssetEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;
}
