/**
 * 租赁订单凭证类型枚举（完整集）
 *
 * 覆盖交付、使用、归还、损坏、维修、丢失、押金处理、取消、争议、
 * 平台裁决与系统确认等全部核心场景
 */
export enum EvidenceType {
  /** 资产交付凭证（出租方交付给承租方） */
  ASSET_DELIVERY = 'asset_delivery',

  /** 资产实例换绑凭证（出租方换绑资产实例时的留痕图片） */
  ASSET_REBIND = 'asset_rebind',

  /** 确认收货凭证（承租方确认收到资产，PAID -> IN_USE） */
  ASSET_RECEIPT_CONFIRM = 'asset_receipt_confirm',

  /** 资产使用/占用凭证（证明某时点仍在使用中） */
  ASSET_USAGE = 'asset_usage',

  /** 资产归还凭证（承租方提交归还申请） */
  ASSET_RETURN = 'asset_return',

  /** 确认归还凭证（出租方确认收到归还，RETURNED_PENDING -> RETURNED） */
  ASSET_RETURN_CONFIRM = 'asset_return_confirm',

  /** 拒绝归还凭证（出租方拒绝归还申请，RETURNED_PENDING -> DISPUTE） */
  ASSET_RETURN_REJECT = 'asset_return_reject',

  /** 资产验收凭证（交付或归还时的验收检测，记录资产状态） */
  ASSET_INSPECTION = 'asset_inspection',

  /** 资产损坏凭证 */
  ASSET_DAMAGE = 'asset_damage',

  /** 资产维修/处理凭证（维修、检测、处理结果） */
  ASSET_REPAIR = 'asset_repair',

  /** 资产丢失凭证 */
  ASSET_LOSS = 'asset_loss',

  /** 押金扣除凭证 */
  DEPOSIT_DEDUCTION = 'deposit_deduction',

  /** 押金扣除拒绝凭证 */
  DEPOSIT_DEDUCTION_REJECT = 'deposit_deduction_reject',

  /** 押金扣除同意凭证 */
  DEPOSIT_DEDUCTION_APPROVE = 'deposit_deduction_approve',

  /** 押金退还凭证（押金退款相关） */
  DEPOSIT_REFUND = 'deposit_refund',

  /** 订单取消凭证 */
  ORDER_CANCEL = 'order_cancel',

  /** 拒绝取消订单凭证（出租方拒绝取消订单，DISPUTE -> CANCEL_PENDING） */
  ORDER_CANCEL_REJECT = 'order_cancel_reject',

  /** 同意取消订单凭证（出租方同意取消订单，CANCEL_PENDING -> CANCELED） */
  ORDER_CANCEL_APPROVE = 'order_cancel_approve',

  /** 订单退款凭证（订单退款相关） */
  ORDER_REFUND = 'order_refund',

  /** 订单完成凭证（出租方结束订单时的凭证） */
  ORDER_COMPLETE = 'order_complete',

  /** 强制关闭订单凭证（出租方强制关闭在租订单时的凭证） */
  ORDER_FORCE_CLOSE = 'order_force_close',

  /** 争议凭证（沟通记录、申诉材料等） */
  DISPUTE = 'dispute',

  /** 平台裁决/系统确认凭证（自动确认、仲裁结果） */
  PLATFORM_DECISION = 'platform_decision',

  /** 其他凭证 */
  OTHER = 'other',
}

/** 凭证类型标签映射 */
export const EvidenceTypeLabel: Record<EvidenceType, string> = {
  [EvidenceType.ASSET_DELIVERY]: '资产交付凭证',
  [EvidenceType.ASSET_REBIND]: '资产实例换绑凭证',
  [EvidenceType.ASSET_RECEIPT_CONFIRM]: '确认收货凭证',
  [EvidenceType.ASSET_USAGE]: '资产使用凭证',
  [EvidenceType.ASSET_RETURN]: '资产归还凭证',
  [EvidenceType.ASSET_RETURN_CONFIRM]: '确认归还凭证',
  [EvidenceType.ASSET_RETURN_REJECT]: '拒绝归还凭证',
  [EvidenceType.ASSET_INSPECTION]: '资产验收凭证',
  [EvidenceType.ASSET_DAMAGE]: '资产损坏凭证',
  [EvidenceType.ASSET_REPAIR]: '资产维修凭证',
  [EvidenceType.ASSET_LOSS]: '资产丢失凭证',
  [EvidenceType.DEPOSIT_DEDUCTION]: '押金扣除凭证',
  [EvidenceType.DEPOSIT_DEDUCTION_REJECT]: '押金扣除拒绝凭证',
  [EvidenceType.DEPOSIT_DEDUCTION_APPROVE]: '押金扣除同意凭证',
  [EvidenceType.DEPOSIT_REFUND]: '押金退还凭证',
  [EvidenceType.ORDER_CANCEL]: '订单取消凭证',
  [EvidenceType.ORDER_CANCEL_REJECT]: '拒绝取消订单凭证',
  [EvidenceType.ORDER_CANCEL_APPROVE]: '同意取消订单凭证',
  [EvidenceType.ORDER_REFUND]: '订单退款凭证',
  [EvidenceType.ORDER_COMPLETE]: '订单完成凭证',
  [EvidenceType.ORDER_FORCE_CLOSE]: '强制关闭订单凭证',
  [EvidenceType.DISPUTE]: '争议凭证',
  [EvidenceType.PLATFORM_DECISION]: '平台裁决凭证',
  [EvidenceType.OTHER]: '其他凭证',
};
