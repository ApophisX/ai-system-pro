# 财务模块实现总结

## 已完成的工作

### 1. 核心服务实现 ✅

#### 1.1 FinanceService（财务服务）
- ✅ `createIncomeRecord()` - 创建收入记录
- ✅ `createExpenseRecord()` - 创建支出记录
- ✅ `confirmFinance()` - 确认入账（更新状态为已入账，计算账后余额）
- ✅ `createReverseRecord()` - 创建冲正记录
- ✅ `createOrderRentIncome()` - 创建订单租金收入记录（便捷方法）
- ✅ `createDepositDeductionIncome()` - 创建押金扣款收入记录（便捷方法）
- ✅ `createRentRefundExpense()` - 创建租金退款支出记录（便捷方法）
- ✅ `createDepositRefundExpense()` - 创建押金退还支出记录（便捷方法）
- ✅ `createWithdrawExpense()` - 创建提现支出记录（便捷方法）

#### 1.2 FinanceRepository（财务仓储）
- ✅ `findByLessorId()` - 根据出租方ID查询财务记录
- ✅ `findByOrderId()` - 根据订单ID查询财务记录
- ✅ `findByPaymentId()` - 根据支付ID查询财务记录
- ✅ `findByPaymentRecordId()` - 根据支付记录ID查询财务记录
- ✅ `findByDepositDeductionId()` - 根据押金扣款ID查询财务记录
- ✅ `findByRefundRecordId()` - 根据退款记录ID查询财务记录
- ✅ `findByWithdrawalRecordId()` - 根据提现记录ID查询财务记录
- ✅ `calculateAvailableBalance()` - 计算可用余额（可提现余额）
- ✅ `calculateTotalIncome()` - 计算累计收入
- ✅ `calculateTotalExpense()` - 计算累计支出
- ✅ `getLastBalanceAfter()` - 获取最后一条财务记录的账后余额

#### 1.3 FinanceEventListener（财务事件监听器）
- ✅ `handlePaymentCompleted()` - 监听支付完成事件，创建订单租金收入记录
- ✅ `handleRefundCompleted()` - 监听退款完成事件，创建租金退款支出记录
- ✅ `handleDepositRefundCompleted()` - 监听押金退款完成事件，创建押金退还支出记录
- ✅ `handleWithdrawalCompleted()` - 处理提现完成，创建提现支出记录（方法已实现，待调用）

#### 1.4 FinanceDepositService（押金扣款财务服务）
- ✅ `handleDepositDeductionExecuted()` - 处理押金扣款执行完成，创建收入记录
- ✅ `checkAndCreateFinanceForExecutedDeduction()` - 补偿机制：检查并创建财务记录

### 2. 业务集成 ✅

#### 2.1 支付完成 → 订单租金收入
- ✅ **位置**：`src/modules/rental-order/listeners/payment-event.listener.ts`
- ✅ **触发时机**：`PaymentEvents.COMPLETED` 事件
- ✅ **处理逻辑**：
  1. 查询已完成的支付记录（PaymentRecord）
  2. 为每个支付记录创建财务收入记录
  3. 自动确认入账
  4. 计算账后余额

#### 2.2 退款完成 → 租金退款支出
- ✅ **位置**：`src/modules/finance/listeners/finance-event.listener.ts`
- ✅ **触发时机**：`PaymentEvents.REFUND_COMPLETED` 事件
- ✅ **处理逻辑**：
  1. 查询退款记录（RefundRecord）
  2. 创建财务支出记录
  3. 自动确认入账

#### 2.3 押金退款完成 → 押金退还支出
- ✅ **位置**：`src/modules/finance/listeners/finance-event.listener.ts`
- ✅ **触发时机**：`PaymentEvents.DEPOSIT_REFUND_COMPLETED` 事件
- ✅ **处理逻辑**：
  1. 查询押金记录（Deposit）
  2. 计算退款金额（押金总额 - 已扣除金额）
  3. 创建财务支出记录
  4. 自动确认入账

### 3. 模块配置 ✅

- ✅ 更新 `FinanceModule`，注册所有服务和仓储
- ✅ 更新 `RentalOrderModule`，导入 `FinanceModule`
- ✅ 注册 `FinanceEventListener` 和 `FinanceDepositService`

## 待完成的工作

### 1. 押金扣款执行完成 → 押金扣款收入 ⚠️

**状态**：方法已实现，但需要在押金扣款执行完成的地方调用

**需要做的事情**：
1. 找到押金扣款状态更新为 `EXECUTED` 的地方
2. 在该位置调用 `FinanceDepositService.handleDepositDeductionExecuted(deduction)`

**示例代码**：
```typescript
import { FinanceDepositService } from '@/modules/finance/services/finance-deposit.service';

// 在押金扣款执行完成后
if (deduction.status === DepositDeductionStatus.EXECUTED && !deduction.deductedAt) {
  deduction.deductedAt = new Date();
  await manager.save(DepositDeductionEntity, deduction);
  
  // 创建财务收入记录
  await this.financeDepositService.handleDepositDeductionExecuted(deduction);
}
```

**可能的位置**：
- 平台审核通过后自动执行扣款
- 手动执行扣款的接口
- 扣款状态更新的地方

### 2. 提现完成 → 提现支出 ⚠️

**状态**：方法已实现，但需要在提现完成的地方调用

**需要做的事情**：
1. 找到提现状态更新为 `COMPLETED` 的地方
2. 在该位置调用 `FinanceEventListener.handleWithdrawalCompleted(withdrawal)`

**示例代码**：
```typescript
import { FinanceEventListener } from '@/modules/finance/listeners/finance-event.listener';

// 在提现完成后
if (withdrawal.status === WithdrawalStatus.COMPLETED) {
  await this.financeEventListener.handleWithdrawalCompleted(withdrawal);
}
```

**可能的位置**：
- 提现回调处理（`PaymentCallbackService.handleWithdrawalCallback`）
- 提现状态更新的地方

### 3. 其他收入类型（待实现）📋

#### 3.1 逾期费用收入（LATE_FEE）
- **状态**：待实现
- **触发时机**：订单逾期时
- **实现位置**：待确定

#### 3.2 违约费用收入（BREACH_FEE）
- **状态**：待实现
- **触发时机**：订单违约时
- **实现位置**：待确定

#### 3.3 赔偿收入（COMPENSATION）
- **状态**：待实现
- **触发时机**：资产损坏赔偿时
- **实现位置**：待确定

## 数据完整性保障

### 幂等性设计
- ✅ 所有财务记录创建方法都包含幂等性检查
- ✅ 通过业务标识（paymentRecordId、refundRecordId等）检查是否已创建记录
- ✅ 重复调用不会创建重复记录

### 事务安全
- ✅ 财务记录创建在独立事务中执行
- ✅ 不会影响主业务流程
- ✅ 失败时只记录错误日志，不抛出异常

### 错误处理
- ✅ 所有财务记录创建都有 try-catch 错误处理
- ✅ 错误不影响主业务流程
- ✅ 记录详细的错误日志，便于排查

## 测试建议

### 1. 单元测试
- 测试 `FinanceService` 的各个方法
- 测试 `FinanceRepository` 的查询方法
- 测试业务规则验证（direction 和 incomeType/expenseType 的约束）

### 2. 集成测试
- 测试支付完成 → 收入记录创建
- 测试退款完成 → 支出记录创建
- 测试押金退款完成 → 支出记录创建
- 测试账后余额计算

### 3. 数据完整性测试
- 检查所有已完成的支付记录是否有对应的财务记录
- 检查所有已完成的退款记录是否有对应的财务记录
- 检查所有已退款的押金是否有对应的财务记录

## 使用示例

### 1. 查询出租方的财务记录

```typescript
// 查询收入记录
const [incomes, total] = await financeRepo.findByLessorId(lessorId, {
  direction: FinanceDirection.INCOME,
  status: FinanceStatus.CONFIRMED,
  skip: 0,
  take: 20,
});

// 查询支出记录
const [expenses, total] = await financeRepo.findByLessorId(lessorId, {
  direction: FinanceDirection.EXPENSE,
  status: FinanceStatus.CONFIRMED,
  skip: 0,
  take: 20,
});

// 计算可用余额
const availableBalance = await financeRepo.calculateAvailableBalance(lessorId);
```

### 2. 手动创建财务记录（特殊场景）

```typescript
// 创建收入记录
const finance = await financeService.createIncomeRecord({
  lessorId: 'uuid',
  incomeType: FinanceIncomeType.ORDER_RENT,
  amount: '1000.00',
  orderId: 'uuid',
  orderNo: 'SN202501290000000000000001',
  paymentId: 'uuid',
  paymentNo: 'ZD202501290000000000000001',
});

// 确认入账
await financeService.confirmFinance({ financeId: finance.id });
```

### 3. 创建冲正记录

```typescript
const reverseFinance = await financeService.createReverseRecord({
  originalFinanceId: originalFinance.id,
  reverseReason: '订单退款，需要冲正原收入记录',
});
```

## 注意事项

1. **数据一致性**：所有财务记录必须在事务内创建，确保数据一致性
2. **余额计算**：`balanceAfter` 应在确认入账时计算并记录，避免后续计算错误
3. **币种转换**：不同币种的金额不能直接相加，需要按实时汇率转换
4. **可提现余额**：仅计算 `affectAvailable = true` 且 `status = CONFIRMED` 的收入记录
5. **冲正记录**：冲正记录必须关联原记录，且金额应相同、方向相反
6. **单号唯一性**：`financeNo` 必须全局唯一，使用序列号生成服务确保唯一性
7. **业务大类**：建议在创建记录时自动推导 `businessType`，便于后续统计和查询
8. **原始记录关联**：创建冲正记录时，需要同时更新原始记录的 `originalFinanceId`，确保双向关联
