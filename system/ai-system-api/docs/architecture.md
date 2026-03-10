# 架构原则 & 分层约束

**关联文档**：

- [coding-standards.md](./coding-standards.md) - 编码规范（落地实现）
- [prohibitions.md](./prohibitions.md) - 禁止事项（红线）
- [adr.md](./adr.md) - 技术决策记录

---

## 核心架构原则

### 1. 三层架构（Three-Layer Architecture）

系统采用简洁的三层架构，层与层之间的边界清晰：

```text
┌──────────────────────────────────┐
│    Controller Layer              │  HTTP 请求处理
│  (Controllers, DTOs)             │
└────────────────┬─────────────────┘
                 │ Service
┌────────────────▼─────────────────┐
│    Service Layer                 │  业务逻辑
│  (Services, Business Logic)      │
└────────────────┬─────────────────┘
                 │ Repository
┌────────────────▼─────────────────┐
│    Repository Layer              │  数据访问（MySQL）
│  (Repositories, TypeORM)         │
└──────────────────────────────────┘
```

**核心规则**：

- **Controller**：参数校验、权限检查、调用 Service
- **Service**：业务逻辑实现、事务管理、调用 Repository
- **Repository**：使用 TypeORM 操作 MySQL 数据库

### 2. 快速开发优先（Speed First）

- **优先实现功能**：快速完成功能需求，再优化性能
- **适度抽象**：只在代码重复时才抽象，避免过度设计
- **代码清晰**：代码结构易于理解和维护
- **实用主义**：选择最简单有效的方案

### 3. 模块化组织（Module-Based）

- 每个业务模块 = 一个独立目录
- 模块内包含：Controller、Service、Repository、DTO、Entity
- 模块间通过 Service 接口通信（避免直接调用 Repository）
- 模块边界清晰，便于后续拆分为微服务

### 4. 技术栈规范

- **数据库**：MySQL 8.0+
- **ORM**：TypeORM（MySQL 驱动）
- **Web 框架**：NestJS + Express
- **语言**：TypeScript (strict mode)

## 分层职责定义

### Controller Layer（控制器层）

**职责**：

- 接收 HTTP 请求
- 参数校验（通过 DTO + class-validator）
- 权限检查（通过 Guard）
- 调用 Service
- 返回响应

**禁止**：

- 业务逻辑判断
- 直接操作数据库
- 复杂的计算

**示例**：

```typescript
@ApiTags("Item")
@Controller("item")
export class ItemController {
  constructor(private itemService: ItemService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @SwaggerApiResponse([OutputItemDto], { description: "列表" })
  async create(@CurrentUser() user: OutputUserDto, @Body() dto: CreateItemDto): PromiseApiResponse<OutputItemDto[]> {
    return this.itemService.create(user, dto);
  }

  @Get(":id")
  @SwaggerApiResponse(OutputItemDto, { description: "详情" })
  async getById(@CurrentUser() user: OutputUserDto, @Param("id") id: string): PromiseApiResponse<OutputItemDto> {
    return this.itemService.getById(user, id);
  }
}
```

### Service Layer（服务层）

**职责**：

- 业务逻辑实现
- 事务管理
- 调用 Repository 访问数据
- 调用缓存、外部 API
- 复杂业务流程编排

**约束**：

- 一个方法 = 一个业务用例
- 写操作必须在事务内
- 复杂逻辑可以拆分为私有方法
- 可以注入多个 Repository 和其他 Service

**示例**：

```typescript
@Injectable()
export class ItemService {
  constructor(
    private itemRepo: ItemRepository,
    private parentRepo: ParentRepository,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateItemDto, userId: string): Promise<ItemEntity> {
    // 1. 业务验证
    const parent = await this.parentRepo.findById(dto.parentId);

    // 2. 在事务内创建
    return this.dataSource.transaction(async (manager) => {
      const item = this.itemRepo.create(dto);
      item.userId = userId;
      item.status = "active";
      return manager.save(item);
    });
  }

  async getById(id: string): Promise<OutputItemDto | null> {
    const item = await this.itemRepo.findById(id);
    return plainToInstance(ItemEntity, item, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }
}
```

### Repository Layer（仓储层）

**职责**：

- 数据访问（仅使用 TypeORM）
- 封装 MySQL 操作
- 查询构建

**约束**：

- 只能依赖 TypeORM 和 DataSource
- 方法名清晰，表达业务含义
- 不包含业务逻辑
- 直接返回 ORM Entity（简化方案）

**示例**：

```typescript
@Injectable()
export class ItemRepository extends Repository<ItemEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(ItemEntity, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<ItemEntity> {
    const item = await this.findOne({
      where: { id },
      relations: ["parent", "user"],
    });

    if (!item) {
      throw new NotFoundException("记录不存在");
    }
    return item;
  }

  async findByUserId(userId: string): Promise<ItemEntity[]> {
    return this.find({
      where: { userId },
      order: { createdAt: "DESC" },
      relations: ["parent"],
    });
  }

  async findByStatus(status: string): Promise<ItemEntity[]> {
    return this.find({
      where: { status },
    });
  }
}
```

## 模块结构规范

```
src/modules/[module-name]/
├── [module-name].module.ts        # 模块定义，注册所有依赖
├── controllers/                   # 控制器目录（可选，单文件时可省略）
│   ├── [feature-a]-[module].controller.ts
│   └── [feature-b]-[module].controller.ts
├── services/                      # 服务目录（可选，单文件时可省略）
│   ├── [feature-a]-[module].service.ts
│   └── [feature-b]-[module].service.ts
├── repositories/                   # 仓储目录（可选，单文件时可省略）
│   ├── [feature-a]-[module].repository.ts
│   └── [feature-b]-[module].repository.ts
├── dto/                           # DTO 目录（必需）
│   ├── create-[module].dto.ts    # 创建请求 DTO
│   ├── query-[module].dto.ts     # 查询/分页 DTO
│   ├── output-[module].dto.ts    # 响应输出 DTO
│   └── update-[module].dto.ts    # 更新请求 DTO
├── entities/                      # TypeORM Entity（必需）
│   └── [module].entity.ts
└── types/                         # 类型定义（可选）
    └── [module].types.ts
```

**模块大小判断**：

| 模块特征         | 结构   | 示例                                                                       |
| ---------------- | ------ | -------------------------------------------------------------------------- |
| 单一功能，代码少 | 单文件 | `auth/auth.controller.ts`                                                  |
| 多功能，代码量大 | 分目录 | `order/controllers/`, `order/services/`                                    |
| 需要多个权限角色 | 分目录 | `user/controllers/user-public.controller.ts` 和 `user-admin.controller.ts` |

**DTO 四分法**：

- `create-[module].dto.ts` - 创建/新增请求参数
- `query-[module].dto.ts` - 查询/列表请求（分页、筛选、排序）
- `output-[module].dto.ts` - HTTP 响应数据格式
- `update-[module].dto.ts` - 更新/编辑请求参数

## 依赖方向规则

```
Controller → Service → Repository → TypeORM
```

**核心约束**：

- ✅ Controller 只能依赖 Service（多个 Service 可以）
- ✅ Service 可以依赖 Repository、其他 Service、DataSource
- ✅ Repository 只能依赖 TypeORM 和 DataSource
- ❌ 跨越层调用（如 Controller → Repository）
- ❌ 跨模块直接访问 Repository

## 模块间通信

**允许的方式**：

1. **同步通信**：ServiceA 注入 ServiceB，调用 ServiceB 的方法
2. **共享数据**：通过 common/types 共享类型定义
3. **避免循环依赖**：模块间清晰的依赖关系

**示例**：

```typescript
// ✅ 正确：Service 间通过方法调用通信
@Injectable()
export class ItemService {
  constructor(
    private userService: UserService, // 注入其他 Service
    private itemRepo: ItemRepository,
  ) {}

  async create(dto: CreateItemDto, userId: string) {
    // 调用其他 Service
    const user = await this.userService.getById(userId);
    if (!user) throw new NotFoundException("用户不存在");

    // 使用自己的 Repository
    return this.itemRepo.save(newItem);
  }
}
```

## 交叉关注点处理

### 事务管理

**原则**：写操作必须在事务内

```typescript
// 方式1：使用 DataSource.transaction()
async create(dto: CreateItemDto): Promise<ItemEntity> {
  return this.dataSource.transaction(async (manager) => {
    const item = await manager.save(ItemEntity, itemData);
    await manager.update(ParentEntity, parentId, { status: 'active' });
    return item;
  });
}

// 方式2：注入 EntityManager
async create(
  @Param() dto: CreateItemDto,
  @TransactionManager() manager: EntityManager,
): Promise<ItemEntity> {
  const item = await manager.save(ItemEntity, itemData);
  return item;
}
```

### 日志

- Service 层记录关键业务操作
- 使用 NestJS Logger
- 避免 console.log

```typescript
constructor(
  private logger: Logger = new Logger(ItemService.name),
) {}

async create(dto: CreateItemDto, userId: string) {
  this.logger.log(`Creating item: parentId=${dto.parentId}, userId=${userId}`);

  const item = await this.itemRepo.save(newItem);
  this.logger.log(`Item created: itemId=${item.id}`);

  return item;
}
```

### 异常处理

- Service 层抛出业务异常
- Controller 层自动转换为 HTTP 响应（NestJS 内置）

```typescript
// Service 层
if (!parent) {
  throw new NotFoundException("父记录不存在");
}

// 自动转换为 HTTP 404 响应
// { "statusCode": 404, "message": "记录不存在", "error": "Not Found" }
```

## 演进路径

```
三层架构（当前）→ 微服务拆分（未来）
```

- 当前：三层架构，快速开发
- 模块边界清晰，便于后续拆分
- 需要时可以演进为微服务
