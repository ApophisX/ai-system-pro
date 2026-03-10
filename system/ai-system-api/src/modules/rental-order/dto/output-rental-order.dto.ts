import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { RentalOrderEntity } from '../entities';
import { Expose, Transform, Type } from 'class-transformer';
import { OutputUserDto } from '@/modules/base/user/dto';
import {
  OutputAssetInventoryDto,
  OutputAssetInventoryDtoWithRentalOrder,
  OutputAssetInventorySnapshotDto,
  OutputAssetListItemDto,
  OutputAssetRentalPlanDto,
} from '@/modules/asset/dto';
import { OutputPaymentDto } from '@/modules/base/payment/dto';
import { OutputWxMiniProgramPaymentDto } from '@/modules/base/payment/dto/wx';
import { OutputDepositDto } from './output-deposit.dto';
import { OutputRentalOrderEvidenceDtoWithRentalOrder } from './output-rental-order-evidence.dto';

/**
 * 订单响应 DTO
 *
 * 复用 Entity，排除关系属性以避免 Swagger 循环依赖
 */
export class OutputRentalOrderDto extends OmitType(RentalOrderEntity, [
  'lessor',
  'lessee',
  'assetSnapshot',
  'rentalPlanSnapshot',
  'statusLabel',
  'durationUnitLabel',
  'orderAmount',
  'currentPeriodIndex',
  'paidAmount',
  'totalDiscountAmount',
  'totalPaymentOverdueAmount',
  'totalPayableAmount',
  'unpaidAmount',
  'overdueUseDiscountAmount',
  'completedPeriodCount',
  'payments',
  'deposits',
  'evidences',
  'inventory',
  'inventorySnapshot',
] as const) {
  @ApiProperty({ description: '出租方' })
  @Type(() => OutputUserDto)
  @Expose()
  lessor: OutputUserDto;

  @ApiProperty({ description: '承租方' })
  @Type(() => OutputUserDto)
  @Expose()
  lessee: OutputUserDto;

  @ApiProperty({ description: '资产快照', type: OutputAssetListItemDto })
  @Type(() => OutputAssetListItemDto)
  @Expose()
  assetSnapshot: OutputAssetListItemDto;

  @ApiProperty({ description: '租赁方案快照', type: OutputAssetRentalPlanDto })
  @Type(() => OutputAssetRentalPlanDto)
  @Expose()
  rentalPlanSnapshot: OutputAssetRentalPlanDto;

  @ApiProperty({ description: '资产实例快照', type: () => OutputAssetInventorySnapshotDto })
  @Type(() => OutputAssetInventorySnapshotDto)
  @Expose()
  inventorySnapshot: OutputAssetInventorySnapshotDto;

  @ApiProperty({ description: '支付记录', type: [OutputPaymentDto] })
  @Type(() => OutputPaymentDto)
  @Expose()
  @Transform(({ value }) =>
    (value || []).sort((a: OutputPaymentDto, b: OutputPaymentDto) => a.periodIndex - b.periodIndex),
  )
  payments: OutputPaymentDto[] = [];

  @ApiProperty({ description: '订单状态' })
  @Expose()
  statusLabel: string;

  @ApiProperty({ description: '使用状态' })
  @Expose()
  useageStatusLabel: string;

  @ApiProperty({ description: '超时使用时间标签' })
  @Expose()
  overdueUseTimeLabel: string;

  @ApiProperty({ description: '逾期状态（超时使用/逾期）' })
  @Expose()
  overdueStatusLabel: string;

  @ApiProperty({ description: '租赁时长' })
  @Expose()
  durationUnitLabel: string;

  @ApiProperty({ description: '订单金额（含平台服务费和运费，已扣除优惠金额，不含押金）' })
  @Expose()
  orderAmount: number;

  @ApiProperty({ description: '续租总实付金额' })
  @Expose()
  totalRenewalPaidAmount: number;

  @ApiProperty({ description: '当前期数' })
  @Expose()
  currentPeriodIndex: number;

  @ApiProperty({ description: '是否需要支付押金' })
  @Expose()
  needDeposit: boolean;

  @ApiProperty({ description: '已支付金额,包含平台服务费、运费，不含押金' })
  @Expose()
  paidAmount: number;

  @ApiProperty({ description: '所有账单的优惠金额总和（实际生效的优惠金额，在账单层面扣除）' })
  @Expose()
  totalDiscountAmount: number;

  @ApiProperty({ description: '超时使用时间，单位：分钟' })
  @Expose()
  overdueUseMinutes: number;

  @ApiProperty({ description: '所有账单的逾期费用总和（包含逾期违约金和逾期罚金）' })
  @Expose()
  totalPaymentOverdueAmount: number;

  @ApiProperty({ description: '超时使用费用' })
  @Expose()
  overdueUseAmount: number;

  @ApiProperty({ description: '应付超时使用费用' })
  @Expose()
  payableOverdueUseAmount: number;

  @ApiProperty({ description: '超期使用优惠金额' })
  @Expose()
  overdueUseDiscountAmount: number;

  @ApiProperty({ description: '总应付金额（汇总所有账单的总应付金额，账单层面已扣除优惠并加上逾期费用），不含押金' })
  @Expose()
  totalPayableAmount: number;

  @ApiProperty({ description: '未支付金额,包含平台服务费、运费、逾期费用，已减去优惠金额，不含押金' })
  @Expose()
  unpaidAmount: number;

  @ApiProperty({ description: '已支付完成的期数' })
  @Expose()
  completedPeriodCount: number;

  @ApiProperty({ description: '是否待支付' })
  @Expose()
  isPending: boolean;

  @ApiProperty({ description: '是否已归还待确认' })
  @Expose()
  isReturnedPending: boolean;

  @ApiProperty({ description: '是否待收货' })
  @Expose()
  isPendingReceipt: boolean;

  @ApiProperty({ description: '是否是先用后付模式' })
  @Expose()
  isPostPayment: boolean;

  @ApiProperty({ description: '押金是否已冻结或已支付' })
  @Expose()
  isDepositFrozenOrPaid: boolean;

  @ApiProperty({ description: '是否是无效的订单' })
  @Expose()
  isInvalid: boolean;

  @ApiProperty({ description: '已支付租金金额，不含平台服务费、运费' })
  @Expose()
  paidRentalAmount: number;

  @ApiProperty({ description: '未支付租金金额，不含平台服务费、运费' })
  @Expose()
  unpaidRentalAmount: number;

  @ApiProperty({ description: '第一笔需要支付的租金金额，包含平台服务费、运费、押金' })
  @Expose()
  firstPaymentAmount: number;

  @ApiProperty({ description: '退款状态' })
  @Expose()
  refundStatusLabel: string;

  @ApiProperty({ description: '押金状态' })
  @Expose()
  depositStatusLabel: string;

  @ApiProperty({ description: '押金列表', type: [OutputDepositDto] })
  @Type(() => OutputDepositDto)
  @Expose()
  deposits: OutputDepositDto[] = [];

  @ApiProperty({ description: '是否已支付租金，包含部分支付' })
  @Expose()
  isPaidOrPartialPaid: boolean;

  @ApiProperty({ description: '证据列表', type: [OutputRentalOrderEvidenceDtoWithRentalOrder] })
  @Type(() => OutputRentalOrderEvidenceDtoWithRentalOrder)
  @Expose()
  evidences: OutputRentalOrderEvidenceDtoWithRentalOrder[] = [];

  @ApiProperty({ description: '取消订单，申请退款剩余时间' })
  @Expose()
  cancelRefundConfirmDeadline: number;

  @ApiProperty({ description: '确认归还剩余时间' })
  @Expose()
  confirmReturnDeadline: number;

  @ApiProperty({ description: '剩余押金金额' })
  @Expose()
  remainingDepositAmount: number;

  @ApiProperty({ description: '续租总支付金额' })
  @Expose()
  totalRenewalPaymentAmount: number;

  @ApiProperty({ description: '租金总支付金额，包含分期支付和一次性支付，不包含续租支付' })
  @Expose()
  totalPaymentAmount: number;

  @ApiProperty({ description: '是否已全部支付租金' })
  @Expose()
  isAllPaidRental: boolean;

  @ApiProperty({ description: '是否部分支付租金' })
  @Expose()
  isPartialPaidRental: boolean;

  @ApiProperty({ description: '存在已支付的分期租金，但还有未支付的分期（部分分期已支付，未全部完成）' })
  @Expose()
  isPaidPartiallyInstallment: boolean;

  @ApiProperty({ description: '是否在使用中' })
  @Expose()
  isInUse: boolean;

  @ApiProperty({ description: '是否已收货' })
  @Expose()
  isReceived: boolean;

  @ApiProperty({ description: '是否已绑定资产实例' })
  @Expose()
  hasBindInventory: boolean;

  @ApiProperty({ description: '是否已归还' })
  @Expose()
  isReturned: boolean;

  @ApiProperty({ description: '是否等待取消确认' })
  @Expose()
  isCancelPending: boolean;

  @ApiProperty({ description: '是否可以发起押金扣款申请' })
  @Expose()
  canDeductDeposit: boolean;

  @ApiProperty({ description: '是否已结束' })
  @Expose()
  isOrderEnded: boolean;

  @ApiProperty({ description: '是否可以商家取消订单' })
  @Expose()
  canCancelByLessor: boolean;

  @ApiProperty({ description: '是否已支付' })
  @Expose()
  isPaid: boolean;

  @ApiProperty({ description: '是否存在待支付的分期租金' })
  @Expose()
  hasPendingInstallment: boolean;

  @ApiProperty({ description: '是否存在逾期未支付的分期租金' })
  @Expose()
  hasOverduePendingInstallment: boolean;

  @ApiPropertyOptional({ description: '关联的资产实例', type: () => OutputAssetInventoryDtoWithRentalOrder })
  @Type(() => OutputAssetInventoryDtoWithRentalOrder)
  @Expose()
  inventory?: OutputAssetInventoryDtoWithRentalOrder;

  /** 承租方是否可提交评价（用于承租方订单列表展示「去评价」按钮） */
  @ApiProperty({ description: '是否可提交评价（承租方）', default: false })
  @Expose()
  canReview: boolean = false;

  /** 出租方是否可回复评价（用于出租方订单列表展示「回复评价」按钮） */
  @ApiProperty({ description: '是否可回复评价（出租方）', default: false })
  @Expose()
  canReplyToReview: boolean = false;
}

export class OutputPayRentalOrderResultDto {
  @ApiProperty({ description: '微信支付返回', type: OutputWxMiniProgramPaymentDto })
  @Expose()
  @Type(() => OutputWxMiniProgramPaymentDto)
  wxJsapiPay?: OutputWxMiniProgramPaymentDto | null = null;

  @ApiProperty({ description: '支付宝支付返回' })
  @Expose()
  alipayJsapiPay?: Record<string, unknown> | null = null;

  @ApiProperty({ description: '是否已支付' })
  @Expose()
  isPaid: boolean = false;
}

/**
 * 支付返回
 */
export class OutputPayDepositResultDto extends OutputPayRentalOrderResultDto {
  //
}

export class OutputRentalOrderListDto {}
