# 出租方收入 / 支出明细账规则说明

## 一、账务方向

- **INCOME**：收入
- **EXPENSE**：支出

## 二、收入类型（INCOME）

- **ORDER_RENT**：订单租金收入
- **DEPOSIT_DEDUCT**：押金扣款收入
- **LATE_FEE**：逾期费用收入
- **BREACH_FEE**：违约费用收入
- **COMPENSATION**：赔偿收入（如资产损坏赔偿）

## 三、支出类型（EXPENSE）

- **RENT_REFUND**：租金退款
- **DEPOSIT_REFUND**：押金退还
- **WITHDRAW**：提现支出

## 四、账务状态（账务视角）

- **PENDING**：待入账（业务已发生，尚未确认记账）
- **CONFIRMED**：已入账（账务确认，不可逆）
- **REVERSED**：已冲正（发生退款或撤销后的账务调整）

## 五、资金流状态（前端展示用）

### 收入：
- **CREDITING**：入账中
- **CREDITED**：已入账

### 支出：
- **REFUNDING**：退款中
- **REFUNDED**：已退款
- **WITHDRAWING**：提现中
- **WITHDRAWN**：已提现

## 六、币种支持

支持多币种 / 加密货币 / 跨境结算，避免默认所有金额均为 CNY 的隐性假设。

### 支持的币种：
- **CNY**：人民币（默认）
- **USD**：美元
- **EUR**：欧元
- **JPY**：日元
- **HKD**：港币
- **GBP**：英镑
- **BTC**：比特币
- **ETH**：以太坊

### 币种使用规则：
- 每条财务记录必须明确指定币种
- 不同币种的金额不能直接相加，需要按汇率转换
- 默认币种为 CNY（人民币）

## 七、账后余额快照（balanceAfter）

### 用途：
- 记录本条财务记录入账后的出租方可用余额
- 用于历史对账、审计、快速计算
- 无需回溯全表即可获取历史任意时点的余额

### 计算规则：
- 在确认入账（status = CONFIRMED）时记录
- 余额 = 上一条记录的 balanceAfter + 当前记录的金额（收入为正，支出为负）
- 第一条记录：balanceAfter = amount（收入）或 0 - amount（支出）

## 八、可用余额影响标识（affectAvailable）

### 用途：
标识该记录是否影响"可提现余额"。

### 规则：
- **true**：影响可提现余额
  - 已确认的收入（status = CONFIRMED, direction = INCOME）
  - 提现支出（direction = EXPENSE, expenseType = WITHDRAW）
- **false**：不影响可提现余额
  - 待入账收入（status = PENDING, direction = INCOME）
  - 已冲正记录（status = REVERSED）

### 计算可提现余额：
```sql
SELECT SUM(amount) 
FROM lessor_finance 
WHERE lessor_id = ? 
  AND affect_available = true 
  AND direction = 'income'
  AND status = 'confirmed'
```

## 九、业务规则约束

### 1. 账务方向与类型约束（强制）

**规则**：
- `direction = INCOME` 时：
  - `incomeType` **必填**
  - `expenseType` **必须为空**
- `direction = EXPENSE` 时：
  - `expenseType` **必填**
  - `incomeType` **必须为空**

**实现方式**：
- 通过 `@IsValidFinanceDirection` 自定义验证器在 DTO 层验证
- 在 Service 层进行二次校验，确保数据一致性

### 2. 财务单号生成规则（financeNo）

**规则**：
- 全局唯一，不可复用
- 包含业务前缀，便于人工排查：
  - **IN**：收入（Income）
  - **EX**：支出（Expense）
  - **RF**：冲正（Reverse）
  - **WD**：提现（Withdraw）

**生成示例**：
- 收入：`IN202501290000000000000001`
- 支出：`EX202501290000000000000001`
- 冲正：`RF202501290000000000000001`
- 提现：`WD202501290000000000000001`

**格式**：`前缀(2位) + 日期(8位YYYYMMDD) + 混淆后的自增序列(16位)` = 26位

### 3. 账务约束规则

- 每一条收支记录必须有明确的业务来源，不允许孤立流水；
- 累计退款金额不得超过对应账单的已支付金额；
- 已确认入账的记录不可直接修改，仅允许通过冲正方式处理；
- 提现仅允许针对已确认且可用余额发起。

## 十、关联业务标识（至少其一）

每条财务记录必须关联至少一个业务来源：

- 订单ID、NO（orderId、orderNo）
- 账单ID、NO（paymentId、paymentNo）
- 账单支付记录ID、NO（paymentRecordId、paymentRecordNo）
- 押金扣款记录ID、NO（depositDeductionId、deductionNo）
- 退款单ID、NO（refundRecordId、refundNo）
- 提现单ID、NO（withdrawalRecordId、withdrawalNo）

## 十一、平台服务费（预留字段）

### 字段说明：
- **platformFeeAmount**：平台服务费金额
- **platformFeeRate**：平台服务费率（单位：百分比，如 5.5 表示 5.5%）

### 使用场景：
- 平台抽成：从订单租金中抽取一定比例作为平台服务费
- 服务费计算：`platformFeeAmount = amount * platformFeeRate / 100`
- 实际到账金额：`actualAmount = amount - platformFeeAmount`

### 注意事项：
- 当前版本为预留字段，暂未启用
- 若未来涉及平台抽成/服务费，可通过此字段进行拆账
- 或通过独立平台账务表进行拆账（推荐方案）

## 十二、字段说明

### 核心字段
| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| financeNo | string(50) | 财务单号（唯一，业务标识） | 是 |
| lessorId | uuid | 出租方 ID | 是 |
| direction | enum | 账务方向（INCOME/EXPENSE） | 是 |
| incomeType | enum | 收入类型（direction=INCOME时必填） | 条件必填 |
| expenseType | enum | 支出类型（direction=EXPENSE时必填） | 条件必填 |
| status | enum | 账务状态（PENDING/CONFIRMED/REVERSED） | 是 |
| flowStatus | enum | 资金流状态（前端展示用） | 否 |
| currency | enum | 币种（默认CNY） | 是 |
| amount | decimal(15,2) | 金额 | 是 |
| balanceAfter | decimal(15,2) | 账后余额快照 | 否 |
| affectAvailable | boolean | 可用余额影响标识 | 是 |
| businessType | enum | 业务大类（用于统计/报表） | 否 |
| originalFinanceId | uuid | 原始财务记录 ID（如果被冲正则标记） | 否 |

### 关联业务标识（至少其一）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| orderId | uuid | 订单 ID |
| orderNo | string(50) | 订单号（冗余字段） |
| paymentId | uuid | 账单 ID |
| paymentNo | string(50) | 账单号（冗余字段） |
| paymentRecordId | uuid | 账单支付记录 ID |
| paymentRecordNo | string(50) | 账单支付记录号（冗余字段） |
| depositDeductionId | uuid | 押金扣款记录 ID |
| deductionNo | string(50) | 押金扣款单号（冗余字段） |
| refundRecordId | uuid | 退款单 ID |
| refundNo | string(50) | 退款单号（冗余字段） |
| withdrawalRecordId | uuid | 提现单 ID |
| withdrawalNo | string(50) | 提现单号（冗余字段） |

### 时间字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| confirmedAt | timestamp | 入账时间（确认入账的时间） |
| reversedAt | timestamp | 冲正时间（发生冲正的时间） |
| businessOccurredAt | timestamp | 业务发生时间（业务实际发生的时间） |

### 其他字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| remark | text | 备注/说明 |
| reverseReason | text | 冲正原因 |
| reversedFinanceId | uuid | 关联的冲正记录 ID（如果本条记录是冲正记录） |
| reversedFinanceNo | string(50) | 关联的冲正记录单号（冗余字段） |
| originalFinanceId | uuid | 原始财务记录 ID（如果本条记录被冲正，则在原始记录中标记） |
| originalFinanceNo | string(50) | 原始财务记录单号（冗余字段） |
| businessType | enum | 业务大类（ORDER/DEPOSIT/PENALTY/COMPENSATION/WITHDRAW） |
| platformFeeAmount | decimal(15,2) | 平台服务费金额（预留） |
| platformFeeRate | decimal(5,2) | 平台服务费率（预留，单位：百分比） |

## 十三、业务大类（businessType）

### 用途：
用于统计 / 报表 / 快速筛选，提供更高层级的业务分类。

### 业务大类映射：

| 业务大类 | 包含的收入类型 | 包含的支出类型 |
|---------|--------------|--------------|
| **ORDER** | ORDER_RENT | RENT_REFUND |
| **DEPOSIT** | DEPOSIT_DEDUCT | DEPOSIT_REFUND |
| **PENALTY** | LATE_FEE, BREACH_FEE | - |
| **COMPENSATION** | COMPENSATION | - |
| **WITHDRAW** | - | WITHDRAW |

### 自动推导：
- `businessType` 可以通过 `incomeType` 或 `expenseType` 自动推导
- 也可以手动设置（用于特殊场景）
- 使用 `deriveBusinessType()` 方法自动推导

### 使用示例：
```typescript
// 自动推导
const finance = {
  direction: FinanceDirection.INCOME,
  incomeType: FinanceIncomeType.ORDER_RENT,
  // businessType 会自动推导为 BusinessType.ORDER
};

// 手动设置
const finance = {
  direction: FinanceDirection.INCOME,
  incomeType: FinanceIncomeType.ORDER_RENT,
  businessType: BusinessType.ORDER, // 手动设置
};
```

## 十四、原始财务记录关联（originalFinanceId）

### 用途：
- 在原始记录中标记"被哪条记录冲正了"
- 快速判断原始记录是否已被冲正（避免重复冲正）
- 双向关联，便于审计追踪

### 关联关系：
- **原始记录**：`originalFinanceId = null`（未被冲正）或 `originalFinanceId = 冲正记录ID`（已被冲正）
- **冲正记录**：`reversedFinanceId = 原始记录ID`

### 使用示例：
```typescript
// 1. 创建原始收入记录
const originalFinance = {
  id: 'A',
  financeNo: 'IN202501290000000000000001',
  amount: '1000.00',
  originalFinanceId: null, // 未被冲正
};

// 2. 创建冲正记录
const reverseFinance = {
  id: 'B',
  financeNo: 'RF202501290000000000000001',
  amount: '1000.00',
  reversedFinanceId: 'A', // 关联原始记录
};

// 3. 更新原始记录，标记已被冲正
originalFinance.originalFinanceId = 'B';
originalFinance.originalFinanceNo = 'RF202501290000000000000001';
```

### 查询示例：
```sql
-- 查询已被冲正的记录
SELECT * FROM lessor_finance WHERE original_finance_id IS NOT NULL;

-- 查询某条记录的冲正记录
SELECT * FROM lessor_finance WHERE reversed_finance_id = 'A';
```

## 十五、索引设计

为优化查询性能，创建以下索引：

1. **主查询索引**：`lessorId + direction + status + flowStatus + financeNo`
2. **业务大类查询索引**：`lessorId + businessType + status`
3. **订单关联索引**：`orderId + orderNo`
4. **账单关联索引**：`paymentId + paymentNo`
5. **支付记录关联索引**：`paymentRecordId + paymentRecordNo`
6. **押金扣款关联索引**：`depositDeductionId + deductionNo`
7. **退款关联索引**：`refundRecordId + refundNo`
8. **提现关联索引**：`withdrawalRecordId + withdrawalNo`
9. **原始记录查询索引**：`originalFinanceId`
10. **冲正记录查询索引**：`reversedFinanceId`

## 十六、使用示例

### 1. 创建收入记录（订单租金收入）

```typescript
const finance = {
  financeNo: 'IN202501290000000000000001',
  lessorId: 'uuid',
  direction: FinanceDirection.INCOME,
  incomeType: FinanceIncomeType.ORDER_RENT,
  businessType: BusinessType.ORDER, // 业务大类（可自动推导）
  status: FinanceStatus.PENDING,
  flowStatus: FinanceFlowStatus.CREDITING,
  currency: Currency.CNY,
  amount: '1000.00',
  affectAvailable: false, // 待入账，不影响可提现余额
  orderId: 'uuid',
  orderNo: 'SN202501290000000000000001',
  paymentId: 'uuid',
  paymentNo: 'ZD202501290000000000000001',
};

// 自动推导业务大类
finance.businessType = finance.deriveBusinessType(); // BusinessType.ORDER
```

### 2. 确认入账（更新为已入账）

```typescript
finance.status = FinanceStatus.CONFIRMED;
finance.flowStatus = FinanceFlowStatus.CREDITED;
finance.affectAvailable = true; // 已确认，影响可提现余额
finance.confirmedAt = new Date();
finance.balanceAfter = '1000.00'; // 计算账后余额
```

### 3. 创建支出记录（提现）

```typescript
const finance = {
  financeNo: 'WD202501290000000000000001',
  lessorId: 'uuid',
  direction: FinanceDirection.EXPENSE,
  expenseType: FinanceExpenseType.WITHDRAW,
  status: FinanceStatus.PENDING,
  flowStatus: FinanceFlowStatus.WITHDRAWING,
  currency: Currency.CNY,
  amount: '500.00',
  affectAvailable: true, // 提现影响可提现余额
  withdrawalRecordId: 'uuid',
  withdrawalNo: 'TK202501290000000000000001',
};
```

### 4. 创建冲正记录

```typescript
// 1. 创建冲正记录
const reverseFinance = {
  financeNo: 'RF202501290000000000000001',
  lessorId: 'uuid',
  direction: FinanceDirection.EXPENSE, // 冲正通常是支出
  expenseType: FinanceExpenseType.RENT_REFUND,
  businessType: BusinessType.ORDER, // 业务大类
  status: FinanceStatus.REVERSED,
  currency: Currency.CNY,
  amount: '1000.00', // 与原记录金额相同，方向相反
  reversedFinanceId: originalFinance.id,
  reversedFinanceNo: originalFinance.financeNo,
  reverseReason: '订单退款，需要冲正原收入记录',
};

// 2. 更新原始记录，标记已被冲正
originalFinance.originalFinanceId = reverseFinance.id;
originalFinance.originalFinanceNo = reverseFinance.financeNo;
originalFinance.status = FinanceStatus.REVERSED; // 更新状态
originalFinance.reversedAt = new Date(); // 记录冲正时间
```

### 5. 查询业务大类统计

```typescript
// 按业务大类统计收入
const statistics = await financeRepo
  .createQueryBuilder('finance')
  .select('finance.businessType', 'businessType')
  .addSelect('SUM(finance.amount)', 'totalAmount')
  .where('finance.lessorId = :lessorId', { lessorId })
  .andWhere('finance.direction = :direction', { direction: FinanceDirection.INCOME })
  .andWhere('finance.status = :status', { status: FinanceStatus.CONFIRMED })
  .groupBy('finance.businessType')
  .getRawMany();

// 结果示例：
// [
//   { businessType: 'ORDER', totalAmount: '5000.00' },
//   { businessType: 'DEPOSIT', totalAmount: '1000.00' },
//   { businessType: 'PENALTY', totalAmount: '500.00' },
// ]
```

## 十七、注意事项

1. **数据一致性**：所有财务记录必须在事务内创建，确保数据一致性
2. **余额计算**：balanceAfter 应在确认入账时计算并记录，避免后续计算错误
3. **币种转换**：不同币种的金额不能直接相加，需要按实时汇率转换
4. **可提现余额**：仅计算 `affectAvailable = true` 且 `status = CONFIRMED` 的收入记录
5. **冲正记录**：冲正记录必须关联原记录，且金额应相同、方向相反
6. **单号唯一性**：financeNo 必须全局唯一，使用序列号生成服务确保唯一性
7. **业务大类**：建议在创建记录时自动推导 `businessType`，便于后续统计和查询
8. **原始记录关联**：创建冲正记录时，需要同时更新原始记录的 `originalFinanceId`，确保双向关联
