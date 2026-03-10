import { InstallmentStatus } from '../enums';

export const InstallmentStatusLabelMap: Record<InstallmentStatus, string> = {
  [InstallmentStatus.PENDING]: '待支付',
  [InstallmentStatus.PAID]: '已支付',
  [InstallmentStatus.OVERDUE]: '已逾期',
  [InstallmentStatus.CANCELED]: '已取消',
  [InstallmentStatus.COMPLETED]: '已完成',
  [InstallmentStatus.EXPIRED]: '已过期',
  [InstallmentStatus.PARTIAL_PAID]: '部分支付',
  [InstallmentStatus.GENERATING]: '待生成',
  [InstallmentStatus.DUE]: '已到期',
  [InstallmentStatus.CLOSED]: '已关闭',
};
