# 技术决策记录 (ADR)

**关联文档**：

- [architecture.md](./architecture.md) - 架构原则
- [coding-standards.md](./coding-standards.md) - 编码规范
- [prohibitions.md](./prohibitions.md) - 禁止事项（红线）

---

## ADR-001: 三层架构 + 快速开发优先

**决策**：采用简洁的三层架构（Controller → Service → Repository），快速开发优先

**背景**：

- 项目需要快速开发和快速迭代
- 四层架构（DDD + Clean Architecture）过度设计，开发成本高
- 需要平衡开发速度和代码质量

**决策**：

- ✅ 采用三层架构：Controller / Service / Repository
- ✅ Service 层包含业务逻辑
- ✅ Repository 层负责 MySQL 数据访问
- ✅ 模块化组织，每个模块独立目录
- ✅ 适度抽象，避免过度设计
- ✅ 代码清晰优先，性能优化在必要时进行

**优势**：

- 开发速度快（相比四层架构快 50%）
- 代码结构清晰，易于理解和维护
- 模块边界清晰，便于后续拆分为微服务

**演进路径**：

```
三层架构（当前）→ 微服务拆分（未来）
```

**相关规范**：[architecture.md](./architecture.md), [coding-standards.md](./coding-standards.md)

---

## ADR-002: NestJS + TypeScript strict + Express

**决策**：使用 NestJS + Express + TypeScript strict 作为核心技术栈

**背景**：

- 需要企业级 Web 框架
- 需要良好的工程化支持（DI、装饰器、模块系统）
- 需要类型安全

**决策**：

- ✅ NestJS 作为应用框架（DI、模块化、装饰器）
- ✅ Express 作为 HTTP 框架（性能好，生态丰富）
- ✅ TypeScript strict 模式（严格类型检查）
- ✅ 禁止使用 `any` 类型
- ✅ 所有外部库必须有类型定义

**约束**：

```typescript
// ❌ 禁止
const data: any = await fetch(...);

// ✅ 正确
interface UserData {
  id: string;
  name: string;
}
const data: UserData = await fetch(...);
```

---

## ADR-003: TypeORM + MySQL

**决策**：使用 TypeORM 操作 MySQL 数据库

**背景**：

- MySQL 是项目指定的数据库
- TypeORM 成熟稳定，社区活跃
- TypeORM 提供了装饰器 API，与 NestJS 集成好
- TypeORM 支持事务管理

**决策**：

- ✅ 使用 TypeORM 作为 ORM
- ✅ MySQL 8.0+ 作为数据库
- ✅ Repository 模式封装 TypeORM
- ✅ Service 层不直接使用 TypeORM，通过 Repository 访问
- ✅ Entity 直接返回给 Service（简化方案）

**约束**：

```typescript
// ❌ 禁止：Service 直接使用 TypeORM
@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(ItemEntity)
    private repo: Repository<ItemEntity>,
  ) {}

  async create(dto) {
    return this.repo.save(dto); // ❌ 应该通过 Repository
  }
}

// ✅ 正确：通过 Repository
@Injectable()
export class ItemService {
  constructor(private itemRepo: ItemRepository) {}

  async create(dto) {
    return this.itemRepo.save(newItem); // ✅
  }
}
```

**事务管理**：

```typescript
// ✅ 使用 DataSource 管理事务
async create(dto: CreateItemDto): Promise<ItemEntity> {
  return this.dataSource.transaction(async (manager) => {
    const item = await manager.save(ItemEntity, itemData);
    await manager.update(ParentEntity, parentId, { status: 'active' });
    return item;
  });
}
```

---

## ADR-004: Redis 用于缓存（可选）

**决策**：可选使用 Redis 进行缓存优化

**背景**：

- 项目初期优先功能开发，缓存作为后续优化
- Redis 可以提高性能，减少数据库查询
- 需要支持分布式锁

**决策**：

- ✅ Redis 用于热点数据缓存（可选）
- ✅ Redis 用于分布式锁
- ✅ 缓存作为优化手段，不作为数据源
- ❌ 不用 Redis 存储业务关键数据
- ❌ 缓存失效后应该能从数据库恢复

**使用场景**（可选）：

| 场景       | 键格式               | 过期时间 |
| ---------- | -------------------- | -------- |
| 用户信息   | `user:{userId}`      | 1 小时   |
| 列表缓存   | `items:{categoryId}` | 5 分钟   |
| 创建锁     | `item:creating:{id}` | 10 秒    |
| 幂等键     | `idempotent:{key}`   | 24 小时  |

**示例**（可选）：

```typescript
// ✅ 缓存读取不到则查询数据库
async getUser(userId: string): Promise<UserEntity> {
  const cached = await this.cacheService.get(`user:${userId}`);
  if (cached) return cached;

  const user = await this.userRepo.findById(userId);
  if (user) {
    await this.cacheService.set(`user:${userId}`, user, 3600);
  }
  return user;
}
```

---

## ADR-005: Module-Based 模块化组织

**决策**：按业务模块组织代码，模块之间通过 Service 接口通信

**背景**：

- 三层架构需要清晰的模块边界
- 模块化便于代码维护和后续拆分
- 避免全局污染和循环依赖

**决策**：

- ✅ 每个业务模块一个独立目录
- ✅ 模块内包含：Controller、Service、Repository、DTO、Entity
- ✅ 模块间通过 Service 接口通信
- ✅ 模块间不直接访问 Repository
- ✅ 避免模块间循环依赖

**模块结构**：

```
src/modules/[module-name]/
├── [module-name].controller.ts
├── [module-name].service.ts
├── [module-name].repository.ts
├── [module-name].module.ts
├── dto/
├── entities/
└── types/
```

**跨模块通信**：

```typescript
// ❌ 禁止：直接访问其他模块的 Repository
export class ItemService {
  constructor(private userRepo: UserRepository) {} // ❌
}

// ✅ 正确：通过 Service 通信
export class ItemService {
  constructor(private userService: UserService) {} // ✅

  async create(dto, userId) {
    const user = await this.userService.getById(userId);
    // ...
  }
}
```

---

## ADR-006: 快速开发规范

**决策**：优先功能完成，适度抽象，代码清晰

**原则**：

1. **快速实现**：优先完成功能需求，后续优化
2. **适度抽象**：代码重复 3+ 次再抽象，避免过度设计
3. **代码清晰**：优先代码可读性和可维护性
4. **渐进优化**：性能优化在必要时进行

**开发流程**：

```
1. 理解需求 → 2. 快速实现 → 3. 代码清晰 → 4. 测试覆盖 → 5. 优化性能
```

---

## ADR-007: 事务管理

**决策**：所有写操作必须在事务内，确保数据一致性

**原则**：

- 事务在 Service 层管理
- 写操作（insert/update/delete）必须在事务内
- 使用 DataSource.transaction() 或 QueryRunner 管理

**约束**：

```typescript
// ❌ 禁止：写操作不在事务内
async create(dto) {
  const item = await this.itemRepo.save(newItem);
  await this.parentRepo.update(parentId, { status: 'active' });  // 可能失败
}

// ✅ 正确：使用事务
async create(dto): Promise<ItemEntity> {
  return this.dataSource.transaction(async (manager) => {
    const item = await manager.save(ItemEntity, itemData);
    await manager.update(ParentEntity, parentId, { status: 'active' });
    return item;
  });
}
```

---

## ADR-008: 异常处理和日志

**决策**：

- Service 层抛出业务异常
- NestJS 自动转换为 HTTP 响应
- 禁止使用 console.log，使用 Logger

**异常类型**：

| 异常                         | HTTP 状态 |
| ---------------------------- | --------- |
| BadRequestException          | 400       |
| UnauthorizedException        | 401       |
| ForbiddenException           | 403       |
| NotFoundException            | 404       |
| ConflictException            | 409       |
| InternalServerErrorException | 500       |

**日志规范**：

```typescript
// ❌ 禁止
console.log("Item created");

// ✅ 正确
this.logger.log("Item created", { itemId: item.id });
this.logger.error("Failed to create item", error);
```

---

## ADR-009: 分层日志与链路追踪（可选）

**决策**：实现结构化日志和分布式链路追踪

**背景**：

- 需要快速定位生产问题
- 需要业务流程的可视化追踪
- 需要性能瓶颈的识别

**决策**：

- ✅ 使用 Winston 作为日志框架
- ✅ 使用 OpenTelemetry 进行链路追踪（可选）
- ✅ 所有日志都带 traceId 和 spanId
- ✅ 使用 Prometheus 收集指标（可选）
- ✅ 使用 Grafana 可视化监控（可选）

**日志级别**：

| 级别  | 用途     | 示例               |
| ----- | -------- | ------------------ |
| error | 系统异常 | 数据库连接失败     |
| warn  | 业务异常 | 操作被拒绝         |
| info  | 关键流程 | 创建完成、流程结束 |
| debug | 调试信息 | 参数值、中间结果   |

**约束**：

```typescript
// ✅ 结构化日志
this.logger.info('Item created', {
  traceId: context.traceId,
  itemId: item.id,
  userId: item.userId,
  timestamp: new Date().toISOString(),
});

// ✅ 错误日志包含堆栈
catch (error) {
  this.logger.error('Failed to process', {
    traceId: context.traceId,
    error: error.message,
    stack: error.stack,
  });
}
```

---

## ADR-010: MVP 范围限制

**决策**：阶段一（MVP）仅实现核心业务，不提前设计复杂功能

**背景**：

- 需要快速验证业务模式
- 过度设计会增加复杂度和上市时间
- 微服务和高级功能可在后续阶段实现

**设计约束**：

```typescript
// ✅ 为扩展预留接口（不实现）
interface Config {
  advancedFeature?: boolean; // 可选，当前不实现
}

// ❌ 禁止：提前实现未确定的功能
// 不要在 MVP 阶段实现未在 PRD 中定义的功能

// ✅ 为扩展预留类型（有注释说明）
enum UserRole {
  USER = "user",
  ADMIN = "admin",
  // EXTENDED_ROLE = 'extended', // 留作后续实现
}
```

---

## ADR-011: 代码审查与质量门禁

**决策**：建立严格的代码审查和质量检查机制

**背景**：

- 需要确保架构一致性
- 需要及早发现技术债务
- 需要知识共享和团队学习

**决策**：

- ✅ 所有代码必须通过 Code Review
- ✅ 必须有 Domain 层单元测试覆盖
- ✅ 必须通过 ESLint 和 Prettier 检查
- ✅ 架构问题优先级最高，可要求重构
- ❌ 红线问题（见 [prohibitions.md](./prohibitions.md)）不得合并

**Review 检查清单**：

- [ ] 分层架构正确
- [ ] 模块边界清晰
- [ ] 没有引入技术债务
- [ ] Service 层有单元测试覆盖
- [ ] 没有违反编码规范
- [ ] 日志结构化，无敏感信息

---

## 决策变更流程

如需修改这些已做决策：

1. **创建 ADR 文档** - 在本文件中追加或新建独立 ADR 文件
2. **团队讨论** - 至少两名架构师同意
3. **影响评估** - 评估对现有系统的影响
4. **实施计划** - 定义迁移策略和时间表
5. **文档更新** - 更新相关规范文档
6. **团队通知** - 通知所有开发人员
