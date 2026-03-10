# 禁止事项（红线）

**关联文档**：

- [architecture.md](./architecture.md) - 架构原则（理解「为什么」禁止）
- [coding-standards.md](./coding-standards.md) - 编码规范
- [adr.md](./adr.md) - 技术决策记录

---

## 架构红线（不可跨越）

### ❌ 跨越分层

**禁止**：

- Controller 直接调用 Repository
- Controller 包含业务逻辑
- Service 包含 SQL 查询（应该通过 Repository）
- Repository 包含业务判断逻辑

**错误示例**：

```typescript
// ❌ Controller 直接操作数据库
@Controller('votes')
export class VoteController {
  constructor(private voteRepo: VoteRepository) {}

  @Post()
  async create(@Body() dto: CreateVoteDto) {
    return this.voteRepo.save(dto);  // ❌ 错误：应该调用 Service
  }
}

// ❌ Controller 包含业务逻辑
@Post()
async create(@Body() dto: CreateVoteDto) {
  if (dto.optionId === '') {  // ❌ 业务逻辑应该在 Service
    throw new BadRequestException('选项不能为空');
  }
  return this.voteService.save(...);
}

// ❌ Service 直接写 SQL（应该用 Repository）
@Injectable()
export class VoteService {
  async create(dto) {
    return this.dataSource.query(  // ❌ 应该用 Repository
      'INSERT INTO votes (...) VALUES (...)'
    );
  }
}

// ❌ Repository 包含业务逻辑
@Injectable()
export class VoteRepository {
  async save(vote) {
    if (vote.expiresAt < new Date()) {  // ❌ 业务逻辑不应该在 Repository
      throw new Error('投票已过期');
    }
    return this.repo.save(vote);
  }
}
```

**正确示例**：

```typescript
// ✅ Controller 只调用 Service
@Controller("votes")
export class VoteController {
  constructor(private voteService: VoteService) {}

  @Post()
  async create(@Body() dto: CreateVoteDto) {
    return this.voteService.create(dto);
  }
}

// ✅ Service 包含业务逻辑和 Repository 调用
@Injectable()
export class VoteService {
  async create(dto: CreateVoteDto): Promise<VoteEntity> {
    // 业务验证
    if (dto.expiresAt < new Date()) {
      throw new BadRequestException("投票已过期");
    }

    // 调用 Repository
    return this.voteRepo.save(newVote);
  }
}

// ✅ Repository 只负责数据访问
@Injectable()
export class VoteRepository {
  async save(vote: VoteEntity): Promise<VoteEntity> {
    return this.repo.save(vote);
  }
}
```

### ❌ 模块边界违规

**禁止**：

- 直接访问其他模块的 Repository
- 模块间循环依赖

**错误示例**：

```typescript
// ❌ 错误：跨模块直接访问 Repository
export class VoteService {
  constructor(
    private ownerRepo: OwnerRepository, // ❌ 不能跨模块访问 Repository
  ) {}
}

// ❌ 错误：模块间循环依赖
// 投票模块 → 业主模块 → 投票模块
```

**正确做法**：

```typescript
// ✅ 通过 Service 接口通信
export class VoteService {
  constructor(
    private ownerService: OwnerService, // ✅ 正确：通过 Service
  ) {}

  async create(dto, ownerId) {
    const owner = await this.ownerService.getById(ownerId);
    if (!owner) throw new NotFoundException("业主不存在");
    // ...
  }
}
```

## 编码红线

### ❌ 代码质量

- **禁止**：使用 `console.log`，必须使用 Logger
- **禁止**：硬编码配置值（使用 .env）
- **禁止**：魔术数字或字符串（定义常量）
- **禁止**：过长的方法（>100 行）
- **禁止**：循环复杂度过高（>15）
- **禁止**：使用 `any` 类型

**错误示例**：

```typescript
// ❌ 禁止使用 console.log
function create(order) {
  console.log("Creating order:", order); // ❌
  return order;
}

// ❌ 禁止硬编码配置
const dbUrl = "mysql://localhost:3306/mydb"; // ❌

// ❌ 禁止魔术数字
const discount = amount * 0.1; // ❌ 什么是 0.1?

// ❌ 禁止使用 any
const order: any = { ...dto }; // ❌
```

**正确示例**：

```typescript
// ✅ 使用 Logger
this.logger.log("Creating order", { orderId: order.id });

// ✅ 使用配置（.env）
const dbUrl = this.configService.get("DATABASE_URL");

// ✅ 定义常量
const DEFAULT_DISCOUNT = 0.1;
const discount = amount * DEFAULT_DISCOUNT;

// ✅ 使用类型
const order: OrderEntity = { ...dto };
```

### ❌ 错误处理

- **禁止**：忽视异常
- **禁止**：不处理 Promise reject
- **禁止**：空的 catch 块

**错误示例**：

```typescript
// ❌ 不处理异常
const order = await this.orderService.create(dto); // 没有 try-catch

// ❌ 空的 catch 块
try {
  await this.orderService.create(dto);
} catch (error) {
  // ❌ 什么都不做
}

// ❌ 忽视 Promise reject
this.orderService.create(dto); // 没有 await
```

**正确示例**：

```typescript
// ✅ 正确处理异常
try {
  const order = await this.orderService.create(dto);
  return order;
} catch (error) {
  this.logger.error("Failed to create order", error);
  throw error;
}

// ✅ 记录日志
try {
  await this.orderService.create(dto);
} catch (error) {
  this.logger.error("Order creation failed", error);
  throw new InternalServerErrorException("订单创建失败");
}
```

### ❌ 数据库操作

- **禁止**：写操作不在事务内
- **禁止**：在循环内做数据库操作（使用批量操作）
- **禁止**：N+1 查询问题

**错误示例**：

```typescript
// ❌ 写操作不在事务内
async create(dto) {
  const vote = await this.voteRepo.save(newVote);  // 没有事务
  await this.optionRepo.update(optionId, { status: 'active' });  // 可能失败
}

// ❌ 在循环内做查询（N+1 问题）
async getVotesWithOwners() {
  const votes = await this.voteRepo.find();
  for (const vote of votes) {
    vote.owner = await this.ownerRepo.findById(vote.ownerId);  // ❌ N+1
  }
  return votes;
}

// ❌ 在循环内做保存
async updateVotes(voteIds) {
  for (const id of voteIds) {
    await this.voteRepo.update(id, { status: 'closed' });  // ❌ 多次数据库操作
  }
}
```

**正确示例**：

```typescript
// ✅ 使用事务
async create(dto) {
  return this.dataSource.transaction(async (manager) => {
    const vote = await manager.save(VoteEntity, newVote);
    await manager.update(OptionEntity, optionId, { status: 'active' });
    return vote;
  });
}

// ✅ 使用关系或 JOIN（避免 N+1）
async getVotesWithOwners() {
  return this.voteRepo.find({
    relations: ['owner'],  // ✅ 一次查询获取关系数据
  });
}

// ✅ 使用批量操作
async updateVotes(voteIds) {
  await this.voteRepo.update(
    { id: In(voteIds) },
    { status: 'closed' },
  );
}
```

### ❌ 性能问题

- **禁止**：查询所有数据（必须分页）
- **禁止**：加载不必要的关系（使用 lazy loading）
- **禁止**：查询过多字段（使用 select）

**错误示例**：

```typescript
// ❌ 查询所有数据
async getAllVotes() {
  return this.voteRepo.find();  // 可能数百万条记录
}

// ❌ 加载不必要的关系
async getVote(id) {
  return this.voteRepo.findOne({
    where: { id },
    relations: ['owner', 'options', 'assembly', 'attachments'],  // 太多
  });
}

// ❌ 查询所有字段
async search(keyword) {
  return this.voteRepo.find({
    where: { title: Like(`%${keyword}%`) },  // 没有分页
  });
}
```

**正确示例**：

```typescript
// ✅ 分页查询
async getVotes(page = 1, limit = 20) {
  return this.voteRepo.find({
    skip: (page - 1) * limit,
    take: limit,
    order: { createdAt: 'DESC' },
  });
}

// ✅ 只加载必要的关系
async getVote(id) {
  return this.voteRepo.findOne({
    where: { id },
    relations: ['owner', 'assembly'],  // 只加载必要的关系
  });
}

// ✅ 分页和 select
async search(keyword, page = 1, limit = 20) {
  return this.voteRepo.find({
    select: ['id', 'title', 'status'],  // 只查询必要字段
    where: { title: Like(`%${keyword}%`) },
    skip: (page - 1) * limit,
    take: limit,
  });
}
```

## 安全红线

### ❌ 敏感数据

- **禁止**：在日志中记录敏感数据（密码、token、支付信息）
- **禁止**：在错误信息中暴露敏感数据
- **禁止**：返回敏感字段给客户端

**错误示例**：

```typescript
// ❌ 日志记录敏感数据
this.logger.log("User login", { password: user.password }); // ❌

// ❌ 错误信息暴露数据
throw new Error(`Payment failed for card: ${card.number}`); // ❌

// ❌ 返回敏感字段
return {
  ...user,
  password: user.password, // ❌
  apiKey: user.apiKey, // ❌
};
```

**正确示例**：

```typescript
// ✅ 不记录敏感数据
this.logger.log("User login", { userId: user.id });

// ✅ 使用通用错误信息
throw new InternalServerErrorException("支付失败，请稍后重试");

// ✅ 过滤敏感字段
const { password, apiKey, ...safeUser } = user;
return safeUser;
```

### ❌ 权限检查

- **禁止**：跳过权限检查
- **禁止**：在 Service 中假设用户已授权
- **禁止**：使用字符串魔法检查权限

**正确示例**：

```typescript
// ✅ Controller 层使用 Guard
@Controller("votes")
export class VoteController {
  @Get(":id")
  @UseGuards(JwtAuthGuard) // 权限检查
  async getById(@Param("id") id: string, @User() user: User) {
    return this.voteService.getById(id, user.id);
  }
}

// ✅ Service 层验证权限
@Injectable()
export class VoteService {
  async getById(id: string, ownerId: string) {
    const vote = await this.voteRepo.findById(id);
    if (!vote || vote.ownerId !== ownerId) {
      throw new ForbiddenException("无权访问此投票");
    }
    return vote;
  }
}
```

### ❌ 魔术数字

**正确做法**：

```typescript
// ✅ 使用 Logger
constructor(private logger: Logger) {}

async create(order) {
  this.logger.log('Creating order', { orderId: order.id });
  return order;
}

// ✅ 配置来自环境变量
const API_KEY = this.configService.get('PAYMENT_API_KEY');
const TIMEOUT = this.configService.get('REQUEST_TIMEOUT', 5000);

// ✅ 常量定义
export const PREMIUM_PRICE_THRESHOLD = 10000;
if (price > PREMIUM_PRICE_THRESHOLD) {
  applyPremiumFee();
}
```

### ❌ 测试相关

- **禁止**：关键业务逻辑没有测试
- **禁止**：跳过失败的测试（注释掉或使用 skip）
- **建议**：Service 层有单元测试覆盖

**规范**：

```typescript
// ✅ Service 层单元测试
describe("VoteService", () => {
  it("should create vote", async () => {
    // 测试逻辑
  });

  it("should throw error when vote expired", async () => {
    // 测试逻辑
  });
});
```

### ❌ 安全相关

- **禁止**：在日志中记录敏感信息（密码、Token、身份证号）
- **禁止**：直接在代码中嵌入密钥、Token、凭证
- **禁止**：权限检查逻辑在 Service 中（应在 Controller/Guard）
- **禁止**：返回错误的详细技术信息给客户端

**错误示例**：

```typescript
// ❌ 禁止：日志记录敏感信息
this.logger.info(`User login`, {
  password: user.password, // ❌ 错误
  token: jwtToken, // ❌ 错误
});

// ❌ 禁止：硬编码密钥
const JWT_SECRET = "my-super-secret-key-12345";

// ❌ 禁止：权限检查在 Service
export class VoteService {
  async approve(voteId: string, ownerId: string) {
    const owner = await this.ownerRepo.getById(ownerId);
    if (owner.role !== "COMMITTEE_CHAIR") {
      // ❌ 错误
      throw new ForbiddenException();
    }
    // ...
  }
}
```

**正确做法**：

```typescript
// ✅ 日志不记录敏感信息
this.logger.info(`User login`, { userId: user.id });

// ✅ 密钥从环境变量读取
const JWT_SECRET = this.configService.get('JWT_SECRET');

// ✅ 权限检查在 Controller/Guard
@Post('votes/:id/approve')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('COMMITTEE_CHAIR')
async approve(@Param('id') voteId: string) {
  return this.voteService.approveVote(voteId);
}
```

## 业务红线

### ❌ 业务逻辑

- **禁止**：在代码中假设业务规则，必须查阅 `docs/product/` 中的 PRD 及业务需求文档
- **禁止**：创建未在业务文档中定义的业务角色
- **禁止**：假设存在自动审批、保险理赔等未确定的功能
- **禁止**：提前实现金融/Web3 相关逻辑（仅做类型预留）

### ❌ 设计决策

- **禁止**：引入未经讨论的新技术栈
- **禁止**：做出与现有架构不一致的设计决策
- **禁止**：跳过代码审查直接合并

## 合并前检查清单

**所有代码合并前必须通过以下检查**：

- [ ] 遵循三层架构，Controller → Service → Repository
- [ ] Controller 不包含业务逻辑
- [ ] Service 包含业务逻辑
- [ ] Repository 只负责数据访问
- [ ] 模块边界清晰，没有跨模块直接访问
- [ ] 关键业务逻辑有测试覆盖
- [ ] 没有使用 `console.log`
- [ ] 没有硬编码的配置值或密钥
- [ ] 异常处理合理，没有泄露敏感信息
- [ ] 日志结构化，不记录敏感信息
- [ ] 代码能通过 ESLint/Prettier 检查
- [ ] 已通过代码审查

**违反任何红线的代码不得合并。**
