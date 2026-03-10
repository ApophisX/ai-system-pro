export enum SequenceNumberType {
  ASSET_INVENTORY = 'asset_inventory',
  PAYMENT = 'payment',
  PAYMENT_RECORD = 'payment_record',
  REFUND_RECORD = 'refund_record',
  REFUND = 'refund',
  ORDER = 'order',
  ASSET = 'asset',
  USER = 'user',
  CONTACT = 'contact',
  ASSET_RENTAL_PLAN = 'asset_rental_plan',
  ASSET_RENTAL_PLAN_INSTALLMENT = 'asset_rental_plan_installment',
  ASSET_RENTAL_PLAN_INSTALLMENT_ITEM = 'asset_rental_plan_installment_item',
  DEPOSIT = 'deposit',
  DEPOSIT_REFUND = 'deposit_refund',
  DEPOSIT_DEDUCTION = 'deposit_deduction',
  LESSOR_FINANCE = 'lessor_finance',
  WITHDRAW_ORDER = 'withdraw_order',
  ACCOUNT_FLOW = 'account_flow',
}

export enum SequenceNumberPrefix {
  ASSET_INVENTORY = 'AINV', // 资产盘点
  PAYMENT = 'PAY', // 付款单
  PAYMENT_RECORD = 'PAYR', // 付款记录
  REFUND_RECORD = 'RFR', // 退款记录
  REFUND = 'RF', // 退款单
  ORDER = 'ORD', // 订单
  ASSET = 'AST', // 资产
  USER = 'USR', // 用户
  CONTACT = 'CON', // 联系人
  DEPOSIT = 'DEP', // 押金
  DEPOSIT_DEDUCTION = 'DED', // 押金扣除
  DEPOSIT_REFUND = 'DER', // 押金退还
  LESSOR_FINANCE_INCOME = 'LFI', // 出租方财务-收入
  LESSOR_FINANCE_EXPENSE = 'LFE', // 出租方财务-支出
  LESSOR_FINANCE_REVERSE = 'LFR', // 出租方财务-冲正
  LESSOR_FINANCE_WITHDRAW = 'LFW', // 出租方财务-提现
  WITHDRAW_ORDER = 'WDO', // 提现订单
  ACCOUNT_FLOW = 'AFL', // 账务流水
}
