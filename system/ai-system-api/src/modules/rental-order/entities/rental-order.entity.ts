import { Entity, Index, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Expose, Transform, Type } from 'class-transformer';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import {
  RentalOrderStatus,
  RentalOrderRefundStatus,
  DepositStatus,
  DepositStatusLabelMap,
  RentalOrderPayStatus,
  RentalOrderOverdueStatus,
  DepositDeductionStatus,
} from '../enums';
import { RentalOrderAssetSnapshotEntity } from './rental-order-asset.entity';
import { RentalOrderAssetRentalPlanSnapshotEntity } from './rental-order-asset-rental-plan.entity';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';
import { OutputContactDto } from '@/modules/contact/dto';
import { IsDateString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { OutputAssetInventorySnapshotDto, OutputAssetRentalPlanDto } from '@/modules/asset/dto';
import { PaymentEntity } from '@/modules/base/payment/entities';
import { RentalOrderStatusLabel } from '../enums/rental-order-status.enum';
import { RentalPlanPeriodUnitLabelMap } from '@/modules/asset/constant';
import Decimal from 'decimal.js';
import dayjs from 'dayjs';
import { DepositEntity } from './deposit.entity';
import { InstallmentStatus, PaymentType, RefundStatusLabelMap } from '@/modules/base/payment/enums';
import { RentalOrderEvidenceEntity } from './rental-order-evidence.entity';
import { AssetInventoryEntity } from '@/modules/asset/entities';
import { calculateOverdueAmount, calculateOverdueTime } from '@/modules/base/payment/utils';
import { RentalOrderUsageStatus, RentalOrderUsageStatusLabel } from '../enums/rental-order-usage-status.enum';
import { RentalOrderOverdueStatusLabel } from '../enums/rental-order-overdue-status.enum';

/**
 * 租赁订单实体
 *
 * 一次完整的租赁交易记录，租赁行为的载体
 * 资金、履约、争议的核心锚点
 * 特征：不可变快照、可审计、可回放
 */
@Entity('rental_order')
@Index('IDX_rental_order_lessor_status', ['lessorId', 'status'])
@Index('IDX_rental_order_lessee_status', ['lesseeId', 'status'])
@Index('IDX_rental_order_asset', ['assetId'])
export class RentalOrderEntity extends BaseEntity {
  /**
   * 订单号（唯一，业务标识）
   */
  @Expose()
  @ColumnWithApi({
    length: 50,
    unique: true,
    comment: '订单号（唯一，业务标识）',
    nullable: true,
  })
  orderNo: string;

  /**
   * 是否需要物流
   */
  @Expose()
  @ColumnWithApi({
    type: 'boolean',
    default: false,
    comment: '是否需要物流',
  })
  @IsOptional()
  @Transform(({ value }) => value ?? false)
  needDelivery: boolean;

  // ====================================== 联系人信息 ===========================================
  /**
   *
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    comment: '联系人 ID',
    length: 50,
    nullable: true,
    optional: true,
  })
  @IsOptional()
  contactId: string;

  /**
   * 联系人电话
   */
  @Expose()
  @ColumnWithApi({ length: 20, comment: '联系人电话', nullable: true })
  @IsNotEmpty()
  contactPhone: string;

  /**
   * 联系人姓名
   */
  @Expose()
  @IsNotEmpty()
  @ColumnWithApi({ length: 20, comment: '联系人姓名', nullable: true })
  contactName: string;

  /**
   * 联系人地址名称
   */
  @Expose()
  @ColumnWithApi({ length: 100, comment: '联系人地址名称', nullable: true })
  @IsOptional()
  contactAddressName: string;

  /**
   * 联系人快照
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    comment: '联系人快照',
    nullable: true,
    optional: true,
  })
  @Type(() => OutputContactDto)
  contactSnapshot?: OutputContactDto;

  // ====================================== 状态字段 Start ===========================================

  /**
   * 是否是商品购买订单
   */
  @Expose()
  @ColumnWithApi({
    type: 'boolean',
    default: false,
    comment: '是否是商品购买订单，用于区分租赁订单和商品购买订单',
  })
  @IsOptional()
  isProductPurchase: boolean;

  /**
   * 订单是否已交易完成
   */
  @Expose()
  @ColumnWithApi({
    type: 'boolean',
    default: false,
    comment: '订单是否已交易完成',
  })
  isTransactionCompleted: boolean;

  /**
   * 是否逾期/超时使用
   */
  @Expose()
  @ColumnWithApi({
    type: 'boolean',
    default: false,
    comment: '是否逾期/超时使用',
  })
  isOverdue: boolean;

  /**
   * 订单状态，主流程状态
   *
   * 状态映射规则：
   * - CREATED: 订单已创建，此时 payStatus = PENDING（待支付）
   * - PENDING_RECEIPT: 支付完成，等待收货，此时 payStatus = COMPLETED（支付成功）
   * - RECEIVED: 已收货、使用中，useageStatus = IN_USE，overdueStatus = NONE/OVERDUE_USE/OVERDUE/OVERDUE_FEE_PAID
   * - CANCELED: 订单已取消，如果因支付超时取消，payStatus = TIMEOUT（支付超时）
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    default: RentalOrderStatus.CREATED,
    length: 50,
    comment:
      '订单主状态：created（已创建）/ pending_receipt（待收货）/ received（已收货）/ completed（已完成）/ canceled（已取消）/ cancel_pending（等待取消确认）/ dispute（争议中）/ closed（强制关闭）',
    apiOptions: {
      enum: RentalOrderStatus,
    },
  })
  status: RentalOrderStatus;

  /**
   * 订单支付状态
   *
   * 支付相关状态统一由 payStatus 管理，不再使用 status 中的支付相关状态。
   * 状态映射规则：
   * - CREATED 状态时，payStatus = PENDING（待支付）
   * - PENDING_RECEIPT 状态时，payStatus = COMPLETED（支付成功）
   * - 支付超时取消时，status = CANCELED，payStatus = TIMEOUT（支付超时）
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: RentalOrderPayStatus.PENDING,
    comment:
      '订单支付状态：none（未支付）/ pending（待支付）/ processing（处理中）/ completed（支付成功）/ failed（支付失败）/ timeout（支付超时）/ canceled（支付取消）',
    apiOptions: {
      enum: RentalOrderPayStatus,
    },
  })
  payStatus: RentalOrderPayStatus;

  /**
   * 使用状态（使用阶段的状态）
   * 注意：逾期/超时使用由 overdueStatus 单独管理
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    default: RentalOrderUsageStatus.NONE,
    comment:
      '使用状态：none（无使用状态）/ in_use（使用中）/ returned（已归还）/ wait_return（待归还）/ returned_pending（已归还，待确认）/ rejected（拒绝归还）',
    apiOptions: {
      enum: RentalOrderUsageStatus,
    },
  })
  useageStatus: RentalOrderUsageStatus;

  /**
   * 逾期状态（超时使用/逾期）
   * 从 useageStatus 提取，职责分离：useageStatus 表示使用阶段，overdueStatus 表示是否逾期
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: RentalOrderOverdueStatus.NONE,
    comment: '逾期状态：none（未逾期）/ overdue_use（超时使用）/ overdue（逾期）/ overdue_fee_paid（超时使用费已支付）',
    apiOptions: {
      enum: RentalOrderOverdueStatus,
    },
  })
  overdueStatus: RentalOrderOverdueStatus;

  /**
   * 退款状态
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    default: RentalOrderRefundStatus.NONE,
    comment:
      '退款状态：none（无退款）/ processing（退款中）/ completed（退款成功）/ failed（退款失败）/ timeout（退款超时）/ canceled（退款取消）/ partial_refund（部分退款）',
    apiOptions: {
      enum: RentalOrderRefundStatus,
    },
  })
  refundStatus: RentalOrderRefundStatus;

  /**
   * 押金状态
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    default: DepositStatus.NONE,
    comment:
      '押金状态：none（无押金）/ pending（待支付）/ frozen（已冻结）/ partial_deducted（部分扣除）/ fully_deducted（已全部扣除）/ unfrozen（已解冻）/ canceled（已取消）',
    apiOptions: {
      enum: DepositStatus,
    },
  })
  depositStatus: DepositStatus;

  // ====================================== 日期字段 ===========================================
  /**
   * 租赁开始日期
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    comment: '租赁开始日期',
    optional: true,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  /**
   * 租赁结束日期
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    comment: '租赁结束日期',
    optional: true,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  /**
   * 租赁时长
   */
  @Expose()
  @ColumnWithApi({
    type: 'int',
    comment: '租赁时长(小时数、天数、周数、月数、季数、年数)',
    default: 0,
  })
  @IsNotEmpty()
  duration: number;

  /**
   * 续租次数（0 表示原订单未续租过）
   */
  @Expose()
  @ColumnWithApi({
    type: 'int',
    default: 0,
    comment: '续租次数',
  })
  @IsOptional()
  renewalCount: number;

  /**
   * 支付过期时间，默认30分钟
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    description: '支付过期时间',
    default: () => 'CURRENT_TIMESTAMP + INTERVAL 30 MINUTE',
  })
  paymentExpiredAt: Date;

  /**
   * 支付完成时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '支付完成时间',
  })
  paidAt?: Date;

  /**
   * 归还时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '归还时间',
  })
  returnedAt?: Date;

  /**
   * 实际归还时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '实际归还时间，出租方确认的归还时间',
  })
  actualReturnedAt?: Date;

  /**
   * 归还提交时间（承租方提交归还时间）
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '归还提交时间',
  })
  returnedSubmittedAt?: Date;

  /**
   * 归还确认时间（出租方确认归还时间）
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '归还确认时间',
  })
  returnedConfirmedAt?: Date;

  /**
   * 完成时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '完成时间',
  })
  completedAt?: Date;

  /**
   * 取消时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '取消时间',
    apiOptions: { type: 'string' },
    optional: true,
  })
  canceledAt?: Date | null;

  /**
   * 交付时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '交付时间/绑定时间',
    apiOptions: { type: 'string' },
    optional: true,
  })
  deliveredAt?: Date | null;

  /**
   * 解绑时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '资产实例解绑时间',
    apiOptions: { type: 'string' },
    optional: true,
  })
  inventoryUnboundAt?: Date | null;

  /**
   * 收货时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '收货时间',
    apiOptions: { type: 'string' },
    optional: true,
  })
  receivedAt?: Date | null;

  /**
   * 退款时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '退款时间',
    apiOptions: { type: 'string' },
    optional: true,
  })
  refundedAt?: Date | null;

  /**
   * 取消订单，申请退款时间
   */
  @Expose()
  @ColumnWithApi({
    type: 'timestamp',
    nullable: true,
    comment: '取消订单，申请退款时间',
    apiOptions: { type: 'string' },
    optional: true,
  })
  cancelRefundedAt?: Date | null;

  // ====================================== 金额字段 ===========================================

  /**
   * 租金总额
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '租金总额',
    apiOptions: { type: 'number' },
  })
  rentalAmount: string;

  /**
   * 押金总额
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '押金总额',
    apiOptions: { type: 'number' },
  })
  depositAmount: string;

  /**
   * 平台服务费
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '平台服务费',
    apiOptions: { type: 'number' },
  })
  platformFee: string;

  /**
   * 优惠金额（汇总字段，实际优惠在账单层面设置）
   * 注意：此字段为冗余字段，用于快速查询订单总优惠金额
   * 实际优惠金额以账单的 discountAmount 为准，订单金额计算不直接使用此字段
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '优惠金额（汇总字段，实际优惠在账单层面设置）',
    apiOptions: { type: 'number' },
  })
  discountAmount: string;

  /**
   * 超期使用优惠金额
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '超期使用优惠金额',
    apiOptions: { type: 'number' },
  })
  overdueUseDiscountAmount: string;

  /**
   * 超期使用优惠备注（出租方设置优惠时的说明，如：友好协商减免、首次逾期减免等）
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: '超期使用优惠备注',
    optional: true,
  })
  @IsOptional()
  overdueUseDiscountRemark?: string;

  /**
   * 订单总金额 = 租金 + 押金 + 平台服务费 - 优惠金额
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '订单总金额，包含租金、押金、平台服务费、运费，减去优惠金额',
    apiOptions: { type: 'number' },
  })
  totalAmount: string;

  /**
   * 已支付超时使用费用累计（元）
   * 承租方每次支付超时使用费后累加，用于计算当前仍待付的超期费
   */
  @Expose()
  @ColumnWithApi({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '已支付超时使用费用累计（元）',
    apiOptions: { type: 'number' },
  })
  overdueFeePaidAmount: string;

  // ====================================== 业务字段 Start ===========================================

  /**
   * 用户备注
   */
  @Expose()
  @ColumnWithApi({
    type: 'text',
    nullable: true,
    comment: '用户备注',
    optional: true,
  })
  @IsOptional()
  @MaxLength(500, { message: '用户备注不能超过1000个字符' })
  userRemark?: string;

  /**
   * 租赁规则快照（JSON 对象，订单创建时固化）
   * 包含：租金计算方式、押金规则、租期限制、使用限制等
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '租赁方案快照（JSON 对象）',
  })
  rentalPlanJson: OutputAssetRentalPlanDto;

  /**
   * 资产实例快照
   * 包含：实例编号、实例名称、实例封面图、实例状态、实例状态标签、实例属性
   */
  @Expose()
  @ColumnWithApi({
    type: 'json',
    nullable: true,
    comment: '资产实例快照（JSON 对象）',
    optional: true,
  })
  inventorySnapshot?: OutputAssetInventorySnapshotDto;

  /**
   * 取消原因
   */
  @Expose()
  @ColumnWithApi({
    type: 'text',
    nullable: true,
    comment: '取消原因',
    apiOptions: { type: 'string' },
    optional: true,
  })
  cancelReason?: string | null;

  /**
   * 出租方拒绝取消订单原因
   */
  @Expose()
  @ColumnWithApi({
    type: 'text',
    nullable: true,
    comment: '出租方拒绝取消订单原因',
    optional: true,
  })
  lessorCancelRejectReason?: string;

  /**
   * 租赁分期期数（如果是分期支付）
   */
  @Expose()
  @ColumnWithApi({
    type: 'int',
    default: 1,
    comment: '分期期数（如果是分期支付）',
  })
  rentalPeriod: number;

  // ====================================== Boolean Field Start ===========================================

  /**
   * 是否是续租订单
   */
  @Expose()
  @ColumnWithApi({
    type: 'boolean',
    default: false,
    comment: '是否是续租订单',
  })
  isRenewal: boolean;

  /**
   * 是否支持分期：true（支持）/ false（不支持）
   */
  @Expose()
  @ColumnWithApi({
    type: 'boolean',
    default: false,
    comment: '是否是分期订单',
  })
  isInstallment: boolean;

  /**
   * 是否已支付运费
   */
  @Expose()
  @ColumnWithApi({
    type: 'boolean',
    default: false,
    comment: '是否已支付运费',
  })
  isPaidDeliveryFee: boolean;

  /**
   * 是否已支付平台服务费
   */
  @Expose()
  @ColumnWithApi({
    type: 'boolean',
    default: false,
    comment: '是否已支付平台服务费',
  })
  isPaidPlatformFee: boolean;

  // ====================================== 关系字段 Start ===========================================
  /**
   * 出租方 ID（资产所有者）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    comment: '出租方 ID（资产所有者）',
    length: 50,
    nullable: true,
  })
  @Index()
  lessorId: string;

  /**
   * 承租方 ID（租赁使用者）
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    comment: '承租方 ID（租赁使用者）',
    length: 50,
    nullable: true,
  })
  @Index()
  lesseeId: string;

  /**
   * 资产 ID
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    comment: '资产 ID',
    length: 50,
    nullable: true,
  })
  @IsNotEmpty()
  @Index()
  assetId: string;

  /**
   * 关联的资产实例
   */
  @Expose()
  @ColumnWithApi({
    type: 'uuid',
    comment: '关联的资产实例 ID',
    length: 50,
    nullable: true,
  })
  @Index()
  inventoryId: string;

  /**
   * 预绑定的资产实例编号（用户下单时传入，支付完成后自动按此编号绑定实例）
   * 对应 AssetInventory.instanceCode，同一资产下唯一
   */
  @Expose()
  @ColumnWithApi({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '预绑定的资产实例编号，支付完成后自动绑定',
  })
  @IsOptional()
  inventoryCode?: string;

  /**
   * 租赁方案 ID（关联到资产租赁方案，用于追溯）
   */
  @Expose()
  @ColumnWithApi({
    nullable: true,
    comment: '租赁方案 ID（关联到资产租赁方案）',
  })
  @IsNotEmpty()
  rentalPlanId: number;

  /**
   * 分期计划 ID（如果支持分期）
   */
  @Expose()
  @ColumnWithApi({
    type: 'int',
    nullable: true,
    comment: '分期计划 ID',
    optional: true,
  })
  installmentPlanId?: number;

  /** ************************************* 关联关系 Start ************************************* */

  /**
   * 关联的资产实例
   */
  @ManyToOne(() => AssetInventoryEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'inventory_id' })
  inventory: AssetInventoryEntity;

  /**
   * 出租方关系（多对一）
   */
  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lessor_id' })
  lessor: UserEntity;

  /**
   * 承租方关系（多对一）
   */
  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lessee_id' })
  lessee: UserEntity;

  /**
   * 资产快照
   */
  @OneToOne(() => RentalOrderAssetSnapshotEntity, snapshot => snapshot.order)
  assetSnapshot: RentalOrderAssetSnapshotEntity;

  /**
   * 租赁方案快照
   */
  @OneToOne(() => RentalOrderAssetRentalPlanSnapshotEntity, rentalPlanSnapshot => rentalPlanSnapshot.order)
  rentalPlanSnapshot?: RentalOrderAssetRentalPlanSnapshotEntity;

  /**
   * 支付账单
   */
  @OneToMany(() => PaymentEntity, payment => payment.rentalOrder)
  payments: PaymentEntity[];

  /**
   * 押金关系（一对多，一个订单对应一笔押金）
   */
  @OneToMany(() => DepositEntity, deposit => deposit.rentalOrder, {
    cascade: false,
  })
  deposits?: DepositEntity[];

  /**
   * 证据关系（一对多）
   */
  @OneToMany(() => RentalOrderEvidenceEntity, evidence => evidence.rentalOrder)
  evidences?: RentalOrderEvidenceEntity[];

  /** ************************************* 虚拟字段 Start ************************************* */

  /**
   * 是否支付过期
   */
  get isExpired(): boolean {
    return this.paymentExpiredAt.getTime() < new Date().getTime();
  }

  /** ************************************* Virtual Fields End ************************************* */

  /**
   * 是否待支付（检查支付状态）
   */
  get isPending(): boolean {
    return this.payStatus === RentalOrderPayStatus.PENDING && this.status === RentalOrderStatus.CREATED;
  }

  /**
   * 支付账单列表
   */
  get paymentList(): PaymentEntity[] {
    return this.payments || [];
  }

  /**
   * 分期支付账单列表
   */
  get rentalPaymentList(): PaymentEntity[] {
    return this.paymentList.filter(
      p =>
        p.paymentType === PaymentType.INSTALLMENT ||
        p.paymentType === PaymentType.ORDER ||
        p.paymentType === PaymentType.RENTAL,
    );
  }

  /**
   * 续租支付账单列表
   */
  get renewalPaymentList(): PaymentEntity[] {
    return this.paymentList.filter(p => p.paymentType === PaymentType.RENEWAL);
  }

  /**
   * 已支付的支付账单列表
   */
  get paidPaymentList(): PaymentEntity[] {
    return this.paymentList.filter(p => p.isPaid);
  }

  /**
   * 第一笔需要支付的租金金额，包含平台服务费、运费、押金
   */
  get firstPaymentAmount(): number {
    let _firstPaymentAmount = 0;
    if (this.isInstallment) {
      _firstPaymentAmount = Number(this.rentalPaymentList.find(p => p.periodIndex === 1)?.totalPayableAmount || 0);
    } else {
      _firstPaymentAmount = Number(this.rentalPaymentList[0]?.totalPayableAmount || 0);
    }
    let total = new Decimal(_firstPaymentAmount);

    if (!this.isDepositFrozenOrPaid) {
      total = total.plus(Number(this.depositAmount));
    }
    return total.toNumber();
  }

  /**
   * 订单状态标签
   */
  get statusLabel(): string {
    return RentalOrderStatusLabel[this.status];
  }

  /**
   * 使用状态标签
   */
  get useageStatusLabel(): string {
    return RentalOrderUsageStatusLabel[this.useageStatus];
  }

  /**
   * 逾期状态标签
   */
  get overdueStatusLabel(): string {
    return RentalOrderOverdueStatusLabel[this.overdueStatus ?? RentalOrderOverdueStatus.NONE];
  }

  /**
   * 租赁时长单位标签
   */
  get durationUnitLabel(): string {
    return `${RentalPlanPeriodUnitLabelMap[this.rentalPlanJson?.rentalType] || ''}`;
  }

  /**
   * 退款状态标签
   */
  get refundStatusLabel(): string {
    return RefundStatusLabelMap[this.refundStatus];
  }

  /**
   * 押金状态标签
   */
  get depositStatusLabel(): string {
    return DepositStatusLabelMap[this.depositStatus];
  }

  /**
   * 当前期数
   */
  get currentPeriodIndex(): number {
    const now = dayjs();

    if (this.isInstallment) {
      if (now.isAfter(this.endDate)) {
        return this.rentalPeriod;
      }
      const payment = this.payments?.find(p => now.isAfter(p.startTime) && now.isBefore(p.endTime));
      if (payment) {
        return payment.periodIndex;
      }
      return 0;
    }

    return 1;
  }

  /**
   * 订单其他费用，包含平台服务费、运费
   */
  get otherFee(): number {
    let _platformFee = new Decimal(this.platformFee);
    if (this.needDelivery) {
      _platformFee = _platformFee.plus(this.assetSnapshot?.deliveryFee || 0);
    }
    return _platformFee.toNumber();
  }

  /**
   * 订单金额，包含平台服务费、运费，不含押金
   * 订单金额 = 租金总额 + 其他费用（平台服务费 + 运费） - 优惠金额
   */
  get orderAmount(): number {
    const rentalAmount = new Decimal(this.rentalAmount || 0);
    return rentalAmount
      .plus(this.otherFee)
      .plus(this.payableOverdueUseAmount)
      .minus(this.totalDiscountAmount)
      .toNumber();
  }

  /**
   * 已支付金额,包含平台服务费、运费，不含押金
   */
  get paidAmount(): number {
    const _paidAmount = this.paidPaymentList.reduce(
      (acc, payment) => new Decimal(acc).plus(payment.paidAmount).toNumber(),
      0,
    );
    return Math.max(_paidAmount, 0);
  }

  /**
   * 所有账单的优惠金额总和（实际生效的优惠金额）
   * 订单的 discountAmount 字段是冗余字段，实际优惠金额以账单为准
   * 此方法汇总所有账单的优惠金额，确保金额计算的一致性
   */
  get totalDiscountAmount(): number {
    if (!this.isPaid) {
      return Number(this.discountAmount);
    }

    const discountAmount = this.paidPaymentList.reduce((acc, payment) => {
      return acc.plus(payment.discountAmount || 0);
    }, new Decimal(0));
    return discountAmount.toNumber();
  }

  /**
   * 超时使用时间，单位：分钟
   */
  get overdueUseMinutes(): number {
    if (this.useageStatus === RentalOrderUsageStatus.NONE) {
      return 0;
    }
    if (this.overdueStatus === RentalOrderOverdueStatus.NONE) {
      return 0;
    }
    const now = dayjs();
    if (this.returnedAt || this.actualReturnedAt) {
      return Math.abs(dayjs(this.actualReturnedAt || this.returnedAt).diff(this.endDate, 'minute'));
    }
    if (this.endDate && now.isAfter(this.endDate)) {
      return Math.abs(now.diff(this.endDate, 'minute'));
    }
    return 0;
  }

  /**
   * 超时使用费用
   */
  get overdueUseAmount(): number {
    const overdueMinutes = this.overdueUseMinutes;
    if (overdueMinutes > 0) {
      const overdueFee = this.rentalPlanSnapshot?.overdueFee || 0;
      const overdueFeeUnit = this.rentalPlanSnapshot?.overdueFeeUnit || 'day';
      return calculateOverdueAmount(overdueMinutes, overdueFee, overdueFeeUnit);
    }
    return 0;
  }

  /**
   * 应付超时使用费用
   */
  get payableOverdueUseAmount(): number {
    if (this.overdueUseAmount > 0) {
      const payableOverdueUseAmount = new Decimal(this.overdueUseAmount).minus(this.overdueUseDiscountAmount);
      return payableOverdueUseAmount.greaterThan(0) ? payableOverdueUseAmount.toNumber() : 0;
    }
    return 0;
  }

  /**
   * 所有账单的逾期费用总和（包含逾期违约金和逾期罚金）
   */
  get totalPaymentOverdueAmount(): number {
    const overdueAmount = this.paymentList.reduce((acc, payment) => {
      return acc.plus(payment.overduePenalty || 0).plus(payment.overdueAmount || 0);
    }, new Decimal(0));
    return overdueAmount.toNumber();
  }

  /**
   * 总应付金额（汇总所有账单的总应付金额），不含押金
   * 注意：优惠金额和逾期费用已在账单层面计算，这里直接汇总账单的 totalPayableAmount
   * 公式：总应付金额 = Σ(每个账单的 totalPayableAmount)
   *       = Σ(账单金额 + 逾期违约金 + 逾期罚金 - 账单优惠金额)
   * 这样可以确保订单层面的金额与账单层面的金额完全一致，避免金额对不上的问题
   */
  get totalPayableAmount(): number {
    // 汇总所有账单的总应付金额（账单层面已扣除优惠并加上逾期费用）
    const totalPayable = this.paymentList.reduce((acc, payment) => {
      return acc.plus(payment.totalPayableAmount || 0);
    }, new Decimal(0));
    return totalPayable.greaterThan(0) ? totalPayable.toNumber() : 0;
  }

  /**
   * 未支付金额,包含平台服务费、运费、逾期费用，已减去优惠金额，不含押金
   * 公式：未支付金额 = 总应付金额 - 已支付金额
   *       = Σ(账单总应付金额) - Σ(账单已支付金额)
   * 注意：优惠金额和逾期费用已在账单层面计算，确保金额一致性
   */
  get unpaidAmount(): number {
    const _unpaidAmount = new Decimal(this.totalPayableAmount).minus(this.paidAmount).toNumber();
    return Math.max(_unpaidAmount, 0);
  }

  /**
   * 已支付租金金额，不含平台服务费、运费
   */
  get paidRentalAmount(): number {
    const _paidRentalAmount = this.paidPaymentList.reduce(
      (acc, payment) => new Decimal(acc).plus(payment.rentalAmount).toNumber(),
      0,
    );
    return Math.max(_paidRentalAmount, 0);
  }

  /**
   * 未支付租金金额，不含平台服务费、运费
   */
  get unpaidRentalAmount(): number {
    const _unpaidRentalAmount = new Decimal(this.rentalAmount).minus(this.paidRentalAmount).toNumber();
    return Math.max(_unpaidRentalAmount, 0);
  }

  /**
   * 已支付完成的期数
   */
  get completedPeriodCount(): number {
    const _completedPeriodCount = this.rentalPaymentList.filter(p => p.isPaid || p.isCompleted).length;
    return Math.max(_completedPeriodCount, 0);
  }

  /**
   * 是否可以取消订单
   *
   * 订单在以下状态可以取消：
   * - CREATED（已创建，待支付）
   * - PENDING_RECEIPT（待收货，支付完成但未使用）
   */
  get canCancel(): boolean {
    return [RentalOrderStatus.CREATED, RentalOrderStatus.PENDING_RECEIPT].includes(this.status);
  }

  /**
   * 是否是待收货状态
   */
  get isPendingReceipt(): boolean {
    return (
      this.status === RentalOrderStatus.PENDING_RECEIPT &&
      this.useageStatus === RentalOrderUsageStatus.NONE &&
      this.payStatus === RentalOrderPayStatus.COMPLETED &&
      !this.inventoryId
    );
  }

  /**
   * 是否等待取消确认
   */
  get isCancelPending(): boolean {
    return RentalOrderStatus.CANCEL_PENDING === this.status;
  }

  /**
   * 是否已归还待确认
   */
  get isReturnedPending(): boolean {
    return RentalOrderUsageStatus.RETURNED_PENDING === this.useageStatus;
  }

  /**
   * 是否已归还
   */
  get isCompleted(): boolean {
    return RentalOrderStatus.COMPLETED === this.status && this.isReturned;
  }

  /**
   * 是否已归还
   */
  get isReturned(): boolean {
    return RentalOrderUsageStatus.RETURNED === this.useageStatus;
  }

  /**
   * 是否待归还
   */
  get isWaitReturn(): boolean {
    return [RentalOrderUsageStatus.WAIT_RETURN, RentalOrderUsageStatus.RETURNED_PENDING].includes(this.useageStatus);
  }

  /**
   * 是否需要支付押金
   */
  get needDeposit(): boolean {
    return Number(this.depositAmount) > 0;
  }

  /**
   * 押金是否已冻结或已支付
   */
  get isDepositFrozenOrPaid(): boolean {
    return [DepositStatus.FROZEN, DepositStatus.PAID, DepositStatus.PARTIAL_DEDUCTED].includes(this.depositStatus);
  }

  /**
   * 是否可支付押金
   */
  get canPayDeposit(): boolean {
    return [DepositStatus.FAILED, DepositStatus.PENDING].includes(this.depositStatus);
  }

  /**
   * 是否是先用后付模式
   */
  get isPostPayment(): boolean {
    return this.assetSnapshot?.isPostPayment ?? false;
  }

  /**
   * 是否已支付租金
   */
  get isPaidRental(): boolean {
    return this.rentalPaymentList.some(p => p.isPaid);
  }

  /**
   * 是否已支付租金，包含部分支付
   */
  get isPaidOrPartialPaid(): boolean {
    return this.rentalPaymentList.some(p => p.isPaidOrPartialPaid);
  }

  /**
   * 押金列表
   */
  get depositList(): DepositEntity[] {
    return this.deposits || [];
  }

  /**
   * 取消订单，申请退款剩余时间, 时间为24小时
   */
  get cancelRefundConfirmDeadline(): number {
    if (!this.cancelRefundedAt) {
      return 0;
    }
    const now = dayjs();
    const deadline = dayjs(this.cancelRefundedAt).add(24, 'hour');
    return deadline.diff(now, 'second');
  }

  /**
   * 确认归还剩余时间
   */
  get confirmReturnDeadline(): number {
    if (!this.returnedSubmittedAt) {
      return 0;
    }
    const now = dayjs();
    const deadline = dayjs(this.returnedSubmittedAt).add(24, 'hour');
    return deadline.diff(now, 'second');
  }

  /**
   * 是否已全部支付租金
   */
  get isAllPaidRental(): boolean {
    return this.paidPaymentList.length === this.paymentList.length;
  }

  /**
   * 存在已支付的分期租金，但还有未支付的分期（部分分期已支付，未全部完成）
   */
  get isPaidPartiallyInstallment(): boolean {
    const total = this.rentalPaymentList.length;
    const paid = this.paidPaymentList.length;
    // 支付分期数大于0，且小于总分期数，则是部分分期已支付
    return total > 0 && paid > 0 && paid < total;
  }

  /**
   * 是否部分支付租金
   */
  get isPartialPaidRental(): boolean {
    return this.paymentList.some(p => p.isPartialPaid);
  }

  /**
   * 是否已收货
   */
  get isReceived(): boolean {
    return this.status === RentalOrderStatus.RECEIVED;
  }

  /**
   * 是否争议中
   */
  get isDispute(): boolean {
    return this.status === RentalOrderStatus.DISPUTE;
  }

  /**
   * 是否在使用中
   *
   * 判断订单是否处于使用阶段（包括正常使用、超时使用、逾期、归还待确认、争议中）
   * useageStatus=IN_USE 表示使用中（含 overdueStatus=OVERDUE_USE/OVERDUE 的逾期情况；OVERDUE_FEE_PAID 表示超时费已支付，多见于 RETURNED_PENDING）
   */
  get isInUse(): boolean {
    const inUse = [RentalOrderUsageStatus.IN_USE, RentalOrderUsageStatus.WAIT_RETURN].includes(this.useageStatus);
    return (inUse && this.isReceived) || this.isDispute;
  }

  /**
   * 是否逾期（超时使用或逾期）
   */
  get isOverdueOrder(): boolean {
    return [RentalOrderOverdueStatus.OVERDUE_USE, RentalOrderOverdueStatus.OVERDUE].includes(
      this.overdueStatus ?? RentalOrderOverdueStatus.NONE,
    );
  }

  /**
   * 是否已支付
   */
  get isPaid(): boolean {
    return this.payStatus === RentalOrderPayStatus.COMPLETED;
  }

  /**
   * 是否是无效的订单
   *
   * 无效订单包括：
   * - CANCELED（已取消）
   * - CLOSED（已关闭）
   * - 支付超时的订单（status = CANCELED 且 payStatus = TIMEOUT）
   */
  get isInvalid(): boolean {
    return (
      [RentalOrderStatus.CANCELED, RentalOrderStatus.CLOSED].includes(this.status) ||
      this.payStatus === RentalOrderPayStatus.TIMEOUT
    );
  }

  /**
   * 是否有待支付的分期租金
   */
  get hasPendingInstallment(): boolean {
    return this.isInstallment && this.rentalPaymentList.some(p => p.isPending);
  }

  /**
   * 是否有逾期未支付的分期租金
   */
  get hasOverduePendingInstallment(): boolean {
    if (!this.isInstallment && !this.isPostPayment) {
      return false;
    }
    // 直接检查支付项是否逾期，不依赖订单状态
    // PaymentEntity.isOverdue 已经会检查：
    // 1. 状态为 OVERDUE
    // 2. 状态为 PENDING/PARTIAL_PAID 但实际已逾期（超过宽限期）
    return this.paymentList.some(p => p.isOverdue);
  }

  /**
   * 验证订单金额一致性
   * 检查订单的 orderAmount 是否等于所有账单的 amount 总和
   * 如果不等，说明账单金额已被修改（改价）
   */
  get isAmountConsistent(): boolean {
    const totalBillAmount = this.paymentList.reduce((acc, payment) => {
      return acc.plus(payment.amount || 0);
    }, new Decimal(0));
    const diff = Math.abs(totalBillAmount.toNumber() - this.orderAmount);
    // 允许小数点误差（0.01元）
    return diff < 0.01;
  }

  /**
   * 获取订单金额差异（用于调试和审计）
   * 如果账单被改价，此值不为0
   */
  get amountDifference(): number {
    const totalBillAmount = this.paymentList.reduce((acc, payment) => {
      return acc.plus(payment.amount || 0);
    }, new Decimal(0));
    return totalBillAmount.toNumber() - this.orderAmount;
  }

  /**
   * 已扣除押金金额
   */
  get deductedDepositAmount(): number {
    return this.depositList
      .reduce((acc, deposit) => {
        return acc.plus(deposit.deductedAmount || 0);
      }, new Decimal(0))
      .toNumber();
  }

  /**
   * 剩余押金金额
   */
  get remainingDepositAmount(): number {
    return this.depositList
      .reduce((acc, deposit) => {
        return acc.plus(deposit.remainingAmount || 0);
      }, new Decimal(0))
      .toNumber();
  }

  /**
   * 超时使用时间标签
   * 返回格式：{时间} {单位}
   * 例如：1天
   * 例如：1小时
   */
  get overdueUseTimeLabel(): string {
    if (!this.overdueUseMinutes) {
      return '';
    }
    if (!this.rentalPlanJson) {
      return '';
    }
    const { overdueFeeUnit, overdueFeeUnitLabel } = this.rentalPlanJson;
    const timelabel = calculateOverdueTime(this.overdueUseMinutes, overdueFeeUnit);
    if (!timelabel) {
      return '';
    }
    return `${timelabel} ${overdueFeeUnitLabel}`;
  }

  /**
   * 是否可以发起押金扣款申请
   */
  get canDeductDeposit() {
    const deposit = this.depositList[0];
    if (!deposit) {
      return false;
    }
    if (deposit.deductionList.length > 10) {
      return false;
    }

    const rejectedDeductions = deposit.deductionList.filter(d => d.status === DepositDeductionStatus.PLATFORM_REJECTED);
    if (rejectedDeductions.length > 3) {
      return false;
    }

    const executedDeductions = deposit.deductionList.filter(d => d.status === DepositDeductionStatus.EXECUTED);
    if (executedDeductions.length > 3) {
      return false;
    }

    const pendingDeductions = [DepositDeductionStatus.PENDING_USER_CONFIRM, DepositDeductionStatus.PENDING_AUDIT];
    if (deposit.deductionList.some(d => pendingDeductions.includes(d.status))) {
      return false;
    }
    return this.status !== RentalOrderStatus.COMPLETED && this.isDepositFrozenOrPaid && this.remainingDepositAmount > 0;
  }

  /**
   * 是否可以商家取消订单
   */
  get canCancelByLessor() {
    return this.isPendingReceipt;
  }

  /**
   * 是否已绑定资产实例
   */
  get hasBindInventory() {
    return this.isPaid && this.useageStatus === RentalOrderUsageStatus.NONE && !!this.inventoryId;
  }

  /**
   * 订单是否已结束
   */
  get isOrderEnded() {
    return [RentalOrderStatus.COMPLETED, RentalOrderStatus.CANCELED, RentalOrderStatus.CLOSED].includes(this.status);
  }

  /**
   * 续租总实付金额
   */
  get totalRenewalPaidAmount(): number {
    return this.renewalPaymentList
      .filter(p => p.isPaid)
      .reduce((acc, payment) => {
        return acc.plus(payment.paidAmount || 0);
      }, new Decimal(0))
      .toNumber();
  }

  /**
   * 续租总支付金额
   */
  get totalRenewalPaymentAmount(): number {
    return this.renewalPaymentList
      .filter(p => p.isPaid)
      .reduce((acc, payment) => {
        return acc.plus(payment.amount || 0);
      }, new Decimal(0))
      .toNumber();
  }

  /**
   * 租金总支付金额，包含分期支付和一次性支付，不包含续租支付
   */
  get totalPaymentAmount(): number {
    return this.paymentList
      .filter(p => p.paymentType === PaymentType.RENTAL || p.paymentType === PaymentType.INSTALLMENT)
      .reduce((acc, payment) => {
        return acc.plus(payment.amount || 0);
      }, new Decimal(0))
      .toNumber();
  }
}
