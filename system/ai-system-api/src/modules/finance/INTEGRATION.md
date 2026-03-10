# 财务模块集成说明

## 一、财务记录创建时机

### 1. 收入记录创建时机

#### 1.1 订单租金收入（ORDER_RENT）
- **触发时机**：支付完成事件（`PaymentEvents.COMPLETED`）
- **实现位置**：`src/modules/rental-order/listeners/payment-event.listener.ts`
- **处理逻辑**：
  1. 监听支付完成事件
  2. 查询支付记录（PaymentRecord）
  3. 为每个已完成的支付记录创建财务收入记录
  4. 自动确认入账（支付完成即确认入账）

#### 1.2 押金扣款收入（DEPOSIT_DEDUCT）
- **触发时机**：押金扣款状态更新为 `EXECUTED`（已执行）时
- **实现位置**：需要在押金扣款执行完成的地方调用 `FinanceDepositService.handleDepositDeductionExecuted()`
- **处理逻辑**：
  1. 押金扣款状态更新为 `EXECUTED` 时
  2. 调用 `FinanceDepositService.handleDepositDeductionExecuted(deduction)`
  3. 创建财务收入记录
  4. 自动确认入账（扣款执行完成即确认入账）

**注意**：目前系统中押金扣款执行完成（状态变为 EXECUTED）的逻辑可能还未实现，需要在实现时调用财务服务。

#### 1.3 逾期费用收入（LATE_FEE）
- **状态**：待实现
- **触发时机**：订单逾期时
- **实现位置**：待确定

#### 1.4 违约费用收入（BREACH_FEE）
- **状态**：待实现
- **触发时机**：订单违约时
- **实现位置**：待确定

#### 1.5 赔偿收入（COMPENSATION）
- **状态**：待实现
- **触发时机**：资产损坏赔偿时
- **实现位置**：待确定

### 2. 支出记录创建时机

#### 2.1 租金退款（RENT_REFUND）
- **触发时机**：退款完成事件（`PaymentEvents.REFUND_COMPLETED`）
- **实现位置**：`src/modules/finance/listeners/finance-event.listener.ts`
- **处理逻辑**：
  1. 监听退款完成事件
  2. 查询退款记录（RefundRecord）
  3. 创建财务支出记录
  4. 自动确认入账（退款完成即确认入账）

#### 2.2 押金退还（DEPOSIT_REFUND）
- **触发时机**：押金退款完成事件（`PaymentEvents.DEPOSIT_REFUND_COMPLETED`）
- **实现位置**：`src/modules/finance/listeners/finance-event.listener.ts`
- **处理逻辑**：
  1. 监听押金退款完成事件
  2. 查询押金记录（Deposit）
  3. 计算退款金额（押金总额 - 已扣除金额）
  4. 创建财务支出记录
  5. 自动确认入账（退款完成即确认入账）

#### 2.3 提现支出（WITHDRAW）
- **触发时机**：提现完成时
- **实现位置**：需要在提现完成的地方调用 `FinanceEventListener.handleWithdrawalCompleted()`
- **处理逻辑**：
  1. 提现状态更新为 `COMPLETED` 时
  2. 调用 `FinanceEventListener.handleWithdrawalCompleted(withdrawal)`
  3. 创建财务支出记录
  4. 自动确认入账（提现完成即确认入账）

**注意**：目前系统中提现完成（状态变为 COMPLETED）的逻辑可能还未实现，需要在实现时调用财务服务。

## 二、集成步骤

### 步骤1：在押金扣款执行完成时调用财务服务

在押金扣款状态更新为 `EXECUTED` 的地方，添加以下代码：

```typescript
import { FinanceDepositService } from '@/modules/finance/services/finance-deposit.service';

// 在押金扣款执行完成后
if (deduction.status === DepositDeductionStatus.EXECUTED) {
  await this.financeDepositService.handleDepositDeductionExecuted(deduction);
}
```

### 步骤2：在提现完成时调用财务服务

在提现状态更新为 `COMPLETED` 的地方，添加以下代码：

```typescript
import { FinanceEventListener } from '@/modules/finance/listeners/finance-event.listener';

// 在提现完成后
if (withdrawal.status === WithdrawalStatus.COMPLETED) {
  await this.financeEventListener.handleWithdrawalCompleted(withdrawal);
}
```

## 三、数据完整性检查

### 检查清单

1. **支付完成**：每个已完成的支付记录（PaymentRecord）都应该有一条对应的财务收入记录
2. **押金扣款执行完成**：每个已执行的押金扣款（DepositDeduction，status=EXECUTED）都应该有一条对应的财务收入记录
3. **退款完成**：每个已完成的退款记录（RefundRecord，status=COMPLETED）都应该有一条对应的财务支出记录
4. **押金退款完成**：每个已退款的押金（Deposit，status=RETURNED）都应该有一条对应的财务支出记录
5. **提现完成**：每个已完成的提现记录（WithdrawalRecord，status=COMPLETED）都应该有一条对应的财务支出记录

### 补偿机制

如果发现数据遗漏，可以使用以下方法进行补偿：

```typescript
// 1. 补偿支付完成的财务记录
const paymentRecords = await paymentRecordRepo.find({
  where: { status: PaymentStatus.COMPLETED },
});

for (const record of paymentRecords) {
  const existingFinance = await financeRepo.findOne({
    where: { paymentRecordId: record.id },
  });
  
  if (!existingFinance) {
    await financeService.createOrderRentIncome(...);
    await financeService.confirmFinance({ financeId: finance.id });
  }
}

// 2. 补偿押金扣款的财务记录
const deductions = await deductionRepo.find({
  where: { status: DepositDeductionStatus.EXECUTED },
});

for (const deduction of deductions) {
  await financeDepositService.checkAndCreateFinanceForExecutedDeduction(deduction.id);
}

// 3. 补偿退款的财务记录
const refunds = await refundRepo.find({
  where: { status: RefundStatus.COMPLETED },
});

for (const refund of refunds) {
  await financeEventListener.handleRefundCompleted(refund);
}

// 4. 补偿押金退款的财务记录
const deposits = await depositRepo.find({
  where: { status: DepositStatus.RETURNED },
});

for (const deposit of deposits) {
  await financeEventListener.handleDepositRefundCompleted(deposit);
}

// 5. 补偿提现的财务记录
const withdrawals = await withdrawalRepo.find({
  where: { status: WithdrawalStatus.COMPLETED },
});

for (const withdrawal of withdrawals) {
  await financeEventListener.handleWithdrawalCompleted(withdrawal);
}
```

## 四、注意事项

1. **幂等性**：所有财务记录创建方法都包含幂等性检查，重复调用不会创建重复记录
2. **事务安全**：财务记录创建在独立事务中执行，不会影响主业务流程
3. **错误处理**：财务记录创建失败不会影响主业务流程，只记录错误日志
4. **数据一致性**：所有财务记录都关联到具体的业务记录（订单、支付、退款等），确保可追溯性
