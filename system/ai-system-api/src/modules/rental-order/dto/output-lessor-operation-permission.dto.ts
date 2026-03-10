import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 出租方订单操作权限 DTO
 *
 * 用于前端根据权限做条件判断与 UI 展示（如按钮显隐、引导文案）
 */
export class OutputLessorOperationPermissionDto {
  @ApiProperty({ description: '是否可发起押金扣款申请' })
  canDeductDeposit: boolean;

  @ApiPropertyOptional({ description: '不可发起押金扣款时的原因，便于前端展示' })
  canDeductDepositReason?: string;

  @ApiProperty({ description: '是否存在可取消的押金扣款申请（待用户确认/待平台审核）' })
  hasCancellableDeductions: boolean;

  @ApiPropertyOptional({ description: '不可取消扣款时的说明' })
  canCancelDeductionReason?: string;

  @ApiProperty({ description: '是否可同意/拒绝承租方的取消订单申请' })
  canApproveCancel: boolean;

  @ApiProperty({ description: '是否可商家取消订单（仅待收货状态）' })
  canCancelByLessor: boolean;

  @ApiProperty({ description: '是否可结束订单' })
  canEndOrder: boolean;

  @ApiProperty({ description: '是否可强制关闭在租订单（已收货、使用中）' })
  canForceClose: boolean;

  @ApiPropertyOptional({ description: '不可强制关闭时的原因' })
  canForceCloseReason?: string;

  @ApiProperty({ description: '是否可押金退款' })
  canRefundDeposit: boolean;

  @ApiPropertyOptional({ description: '不可押金退款时的原因' })
  canRefundDepositReason?: string;

  @ApiProperty({
    description: '是否可发起单笔账单退款（订单未完成且为出租方；具体某笔是否可退以退款接口校验为准）',
  })
  canRefundPaymentRecord: boolean;

  @ApiPropertyOptional({ description: '不可发起单笔账单退款时的原因，便于前端展示' })
  canRefundPaymentRecordReason?: string;

  @ApiProperty({
    description: '是否可设置超期使用优惠金额（超期使用费用待支付时）',
  })
  canSetOverdueUseDiscount: boolean;

  @ApiPropertyOptional({ description: '不可设置超期使用优惠时的原因' })
  canSetOverdueUseDiscountReason?: string;
}
