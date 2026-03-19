# 编码规范 (Coding Standards)

**该文件定义日常编码的具体规范和要求。**

> 本规范适用于 **MySQL + TypeORM 的 NestJS 项目**  
> 目标：**快速开发 / 代码清晰 / 易于维护**

**关联文档**：

- [architecture.md](./architecture.md) - 三层架构原则与分层职责
- [prohibitions.md](./prohibitions.md) - 禁止事项（红线）
- [adr.md](./adr.md) - 技术决策记录
- `share-doc/api-spec/` - API 契约与 OpenAPI 规范（全仓共享）

---

## 1. 总原则

1. **快速开发优先**：优先实现功能，再优化性能
2. **代码清晰**：代码结构清晰，易于理解和维护
3. **适度抽象**：只在必要时抽象，避免过度设计
4. **实用主义**：选择最简单有效的方案

---

## 2. Controller 规范

### 职责

1. 接收 HTTP 请求
2. 参数校验（DTO + class-validator）
3. 权限检查（Guard）
4. 调用 Service
5. 返回 HTTP 响应

### 禁止

- ❌ 业务逻辑判断
- ❌ 直接操作数据库
- ❌ 复杂的计算

### 示例

全部要加上swagger注解

```typescript
@Controller('items')
export class ItemController {
  constructor(private itemService: ItemService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateItemDto, @User() user: User) {
    return this.itemService.create(dto, user.id);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.itemService.getById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.itemService.update(id, dto);
  }
}
```

---

## 3. Service 规范

### 职责

1. 业务逻辑实现
2. 事务管理
3. 调用 Repository 访问数据
4. 调用外部服务、缓存等

### 约束

- 一个方法 = 一个业务用例
- 写操作必须在事务内
- 复杂逻辑可以拆分为私有方法

### 示例

```typescript
@Injectable()
export class ItemService {
  constructor(
    private itemRepo: ItemRepository,
    private parentRepo: ParentRepository,
    private dataSource: DataSource,
    private logger: Logger = new Logger(ItemService.name),
  ) {}

  async create(dto: CreateItemDto, userId: string): Promise<ItemEntity> {
    // 1. 业务验证
    const parent = await this.parentRepo.findById(dto.parentId);
    if (!parent) {
      throw new NotFoundException('父记录不存在');
    }

    // 2. 在事务内创建
    const item = await this.dataSource.transaction(async manager => {
      const newItem = new ItemEntity();
      newItem.parentId = dto.parentId;
      newItem.userId = userId;
      newItem.title = dto.title;
      newItem.status = 'active';

      return manager.save(newItem);
    });

    this.logger.log(`Item created: ${item.id}`);
    return item;
  }

  async getById(id: string): Promise<ItemEntity | null> {
    return this.itemRepo.findById(id);
  }
}
```

---

## 4. Repository 规范

### 职责

1. 使用 TypeORM 操作 MySQL
2. 封装数据库查询
3. 返回 Entity

### 约束

- 方法名清晰、表达业务含义
- 不包含业务逻辑
- 不包含复杂的查询逻辑（复杂查询放在 Service）

### 示例

```typescript
@Injectable()
export class ItemRepository {
  constructor(
    @InjectRepository(ItemEntity)
    private repo: Repository<ItemEntity>,
  ) {}

  async save(item: ItemEntity): Promise<ItemEntity> {
    return this.repo.save(item);
  }

  async findById(id: string): Promise<ItemEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['parent'],
    });
  }

  async findByUserId(userId: string): Promise<ItemEntity[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['parent'],
    });
  }

  async update(id: string, data: Partial<ItemEntity>): Promise<void> {
    await this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
```

---

## 5. Entity 规范

### 用途

ORM Entity：TypeORM 数据库表映射

### 约束

- 使用 TypeORM 装饰器（@Entity、@Column 等）
- 包含数据库字段和关系
- 不包含业务逻辑
- 根据字段意义，选择合适的字段类型
- 不用特意定义 `name`，SnakeNamingStrategy 会统一处理

### 字段声明：必须使用 @ColumnWithApi

**禁止** 同时写 `@ApiProperty` + `@Column`，会导致注释写两遍。**必须** 使用 `@ColumnWithApi` 组合装饰器，一次声明同时生效于 Column 与 Swagger。

参考：[`src/modules/base/user/entities/user.entity.ts`](../modules/base/user/entities/user.entity.ts)

```typescript
// ❌ 错误：注释写两遍
@ApiProperty({ description: '社区名称' })
@Column({ type: 'varchar', length: 100, comment: '社区名称' })
name: string;

// ✅ 正确：使用 @ColumnWithApi，comment 同时用于 Column 和 ApiProperty
@ColumnWithApi({ type: 'varchar', length: 100, comment: '社区名称' })
name: string;

// 可选字段加 optional: true
@ColumnWithApi({ type: 'varchar', length: 255, nullable: true, comment: '小区地址', optional: true })
address?: string;

// 枚举字段
@ColumnWithApi({ type: 'enum', enum: StatusEnum, default: StatusEnum.PENDING, comment: '状态' })
status: StatusEnum;
```

### 示例

```typescript
import { Entity, Column, ManyToOne } from 'typeorm';
import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { BaseEntity } from '@/infrastructure/database/entities/base.entity';
import { ColumnWithApi } from '@/common/decorators/column-with-api.decorator';

@Entity('items')
export class ItemEntity extends BaseEntity {
  @Expose()
  @ColumnWithApi({ type: 'uuid', comment: '用户 ID' })
  @IsNotEmpty()
  userId: string;

  @Expose()
  @ColumnWithApi({ type: 'uuid', comment: '父级 ID' })
  @IsNotEmpty()
  parentId: string;

  @Expose()
  @ColumnWithApi({ type: 'varchar', length: 200, comment: '标题' })
  @IsNotEmpty()
  title: string;

  @Expose()
  @ColumnWithApi({ type: 'varchar', length: 50, comment: '状态' })
  status: string;

  @Expose()
  @ColumnWithApi({ type: 'varchar', length: 500, nullable: true, comment: '备注', optional: true })
  remark?: string;

  @ManyToOne(() => ParentEntity)
  parent: ParentEntity;
}
```

---

## 6. DTO 规范（四分类）

### DTO 分类

| 类型       | 文件命名                 | 用途                        | 数据方向           |
| ---------- | ------------------------ | --------------------------- | ------------------ |
| **Create** | `create-[module].dto.ts` | 创建/新增请求参数           | Request → Service  |
| **Query**  | `query-[module].dto.ts`  | 查询/列表请求（分页、筛选） | Request → Service  |
| **Output** | `output-[module].dto.ts` | HTTP 响应数据格式           | Service → Response |
| **Update** | `update-[module].dto.ts` | 更新/编辑请求参数           | Request → Service  |

### 约束

- 使用 class-validator 验证请求 DTO
- 使用 class-transformer 转换数据
- 不包含业务逻辑
- 分离请求和响应结构

### 创建 DTO（Create）

```typescript
// create-item.dto.ts - 创建请求
export class CreateItemDto {
  @IsUUID()
  @IsNotEmpty()
  parentId: string;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}
```

### 查询 DTO（Query）

```typescript
// query-item.dto.ts - 查询/列表请求
export class QueryItemDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit: number = 20;

  @IsOptional()
  @IsEnum(['ACTIVE', 'CLOSED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  startDate?: string;
}
```

### 响应 DTO（Output）

**原则**：使用 `OmitType(Entity, [...])` 继承实体，避免重复定义字段；虚拟字段和关联实体可单独补充定义。

- **实体字段**：通过 OmitType 从 Entity 继承，omit 掉不需暴露的字段（如关联、敏感字段、内部字段）
- **虚拟字段**：在 Output DTO 类中单独定义（如脱敏昵称、计算字段）
- **聚合/统计数据**：无对应实体的 Output（如汇总 DTO）可完全自定义

```typescript
// output-item.dto.ts - 基于实体 OmitType
import { OmitType } from '@nestjs/swagger';
import { ItemEntity } from '../entities';

export class OutputItemDto extends OmitType(ItemEntity, [
  'userId',
  'parentId',
  'parent',
  'user',
  'deletedAt',
  'version',
  'updatedBy',
  'updatedAt',
] as const) {
  /** 虚拟字段：脱敏用户昵称 */
  @ApiPropertyOptional()
  userNickname: string;
}

/** 聚合数据 DTO（无对应实体，单独定义） */
export class OutputItemSummaryDto {
  totalCount: number;
  activeCount: number;
  closedCount: number;
}
```

```typescript
// 在 Controller 中返回
@Get(':id')
async getById(@Param('id') id: string): Promise<OutputItemDto> {
  return this.itemService.getById(id);
}
```

### 更新 DTO（Update）

```typescript
// update-item.dto.ts - 更新请求
export class UpdateItemDto {
  @IsOptional()
  @IsEnum(['ACTIVE', 'CLOSED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}

// 在 Service 中使用
async update(id: string, dto: UpdateItemDto): Promise<void> {
  await this.itemRepo.update(id, dto);
}
```

---

## 7. 模块结构与组织

### 简单模块（单功能）

小型模块使用单文件结构：

```
src/modules/auth/
├── auth.module.ts
├── auth.controller.ts      # 单一控制器
├── auth.service.ts         # 单一服务
├── auth.repository.ts      # 单一仓储
├── dto/
│   ├── create-auth.dto.ts
│   ├── query-auth.dto.ts
│   ├── output-auth.dto.ts
│   └── update-auth.dto.ts
├── entities/
│   └── user.entity.ts
└── types/
    └── auth.types.ts
```

### 复杂模块（多功能）

大型模块按功能分目录：

```
src/modules/item/
├── item.module.ts
├── controllers/             # 多个功能控制器
│   ├── item-create.controller.ts
│   ├── item-query.controller.ts
│   └── item-manage.controller.ts
├── services/                # 多个功能服务
│   ├── item-create.service.ts
│   ├── item-query.service.ts
│   └── item-manage.service.ts
├── repositories/            # 多个功能仓储
│   ├── item-create.repository.ts
│   ├── item-query.repository.ts
│   └── item-manage.repository.ts
├── dto/                     # DTO 统一管理
│   ├── create-item.dto.ts
│   ├── query-item.dto.ts
│   ├── output-item.dto.ts
│   └── update-item.dto.ts
├── entities/
│   └── item.entity.ts
└── types/
    └── item.types.ts
```

### 模块注册（module.ts）

```typescript
// item.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemEntity } from './entities/item.entity';

// Controllers
import { ItemCreateController } from './controllers/item-create.controller';
import { ItemQueryController } from './controllers/item-query.controller';
import { ItemManageController } from './controllers/item-manage.controller';

// Services
import { ItemCreateService } from './services/item-create.service';
import { ItemQueryService } from './services/item-query.service';
import { ItemManageService } from './services/item-manage.service';

// Repositories
import { ItemCreateRepository } from './repositories/item-create.repository';
import { ItemQueryRepository } from './repositories/item-query.repository';
import { ItemManageRepository } from './repositories/item-manage.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ItemEntity])],
  controllers: [ItemCreateController, ItemQueryController, ItemManageController],
  providers: [
    ItemCreateService,
    ItemQueryService,
    ItemManageService,
    ItemCreateRepository,
    ItemQueryRepository,
    ItemManageRepository,
  ],
  exports: [ItemCreateService, ItemQueryService, ItemManageService],
})
export class ItemModule {}
```

### 功能命名规范

- `[feature]-[module].controller.ts` - 功能+模块名称
- `[feature]-[module].service.ts` - 示例：`item-create.service.ts`
- `[feature]-[module].repository.ts` - 示例：`item-query.repository.ts`

**示例**：

- `item-create.controller.ts` - 创建项的控制器
- `item-create.service.ts` - 创建项的业务逻辑
- `item-create.repository.ts` - 创建项的数据操作
- `item-query.controller.ts` - 查询项的控制器
- `item-manage.controller.ts` - 管理项的控制器（权限隔离）

---

## 8. 异常处理

### 原则

- Service 层抛出业务异常
- NestJS 自动转换为 HTTP 响应

### 异常类型

| 异常                         | HTTP 状态 | 说明       |
| ---------------------------- | --------- | ---------- |
| BadRequestException          | 400       | 错误请求   |
| UnauthorizedException        | 401       | 未授权     |
| ForbiddenException           | 403       | 禁止访问   |
| NotFoundException            | 404       | 未找到     |
| ConflictException            | 409       | 冲突       |
| InternalServerErrorException | 500       | 服务器错误 |

### 示例

```typescript
// Service 层
async getById(id: string) {
  const item = await this.itemRepo.findById(id);
  if (!item) {
    throw new NotFoundException('记录不存在');
  }
  return item;
}

// 自动转换为 HTTP 响应：
// HTTP 404
// { "statusCode": 404, "message": "记录不存在", "error": "Not Found" }
```

---

## 9. 日志规范

### 原则

- 禁止 console.log，使用 Logger
- 记录关键业务操作
- 关键错误必须记录

### 示例

```typescript
constructor(
  private logger: Logger = new Logger(ItemService.name),
) {}

async create(dto: CreateItemDto, userId: string) {
  this.logger.log(`Creating item: parentId=${dto.parentId}, userId=${userId}`);

  try {
    const item = await this.itemRepo.save(newItem);
    this.logger.log(`Item created: itemId=${item.id}`);
    return item;
  } catch (error) {
    this.logger.error('Failed to create item', error);
    throw error;
  }
}
```

---

## 10. 事务规范

### 原则

写操作必须在事务内，确保数据一致性

### 示例

```typescript
// 方式1：使用 DataSource.transaction()
async createItem(dto: CreateItemDto): Promise<ItemEntity> {
  return this.dataSource.transaction(async (manager) => {
    const item = await manager.save(ItemEntity, itemData);
    // 其他操作
    return item;
  });
}

// 方式2：使用 QueryRunner
async createItem(dto: CreateItemDto): Promise<ItemEntity> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const item = await queryRunner.manager.save(ItemEntity, itemData);
    await queryRunner.commitTransaction();
    return item;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

---

## 11. 权限与安全

### 原则

- 权限检查在 Controller 层（Guard）
- Service 层可以接收用户信息进行业务判断

### 示例

```typescript
@Controller('item')
export class ItemController {
  @Post()
  @UseGuards(JwtAuthGuard) // 权限检查
  async create(@Body() dto: CreateItemDto, @User() user: User) {
    return this.itemService.create(dto, user.id); // 传递用户信息
  }
}
```

---

## 12. 快速开发建议

1. **先实现功能**：快速实现业务需求
2. **适度抽象**：代码重复 3+ 次再抽象
3. **代码清晰**：优先代码可读性
4. **迭代优化**：功能完成后再优化性能
5. **测试覆盖**：关键业务逻辑必须有测试

---

## 13. 命名规范

| 对象       | 命名                  | 示例             |
| ---------- | --------------------- | ---------------- |
| Controller | `[Module]Controller`  | `ItemController` |
| Service    | `[Module]Service`     | `ItemService`    |
| Repository | `[Module]Repository`  | `ItemRepository` |
| Entity     | `[Module]Entity`      | `ItemEntity`     |
| DTO        | `[Action][Module]Dto` | `CreateItemDto`  |
| Module     | `[Module]Module`      | `ItemModule`     |
| Guard      | `[Purpose]Guard`      | `JwtAuthGuard`   |

---

## 14. 禁止事项

- ❌ Controller 包含业务逻辑
- ❌ Service 直接返回 ORM 查询结果（简化时可以）
- ❌ Repository 包含业务逻辑
- ❌ 使用 console.log
- ❌ 硬编码配置值
- ❌ 忽视异常处理
- ❌ 跳过事务管理（写操作）

- ORM Entity 使用 TypeORM/Prisma 装饰器
- 可以同时使用 ORM Entity 和 Domain Entity
- 或者直接使用 ORM Entity 作为业务对象（简化方案）

---

## 8. 模块化规范

### 模块结构

参考 [architecture.md](./architecture.md) 中的「模块化组织」章节

### 模块间通信

- **同步**：通过 Service 接口
- **异步**：通过事件（EventService）
- **共享类型**：通过 common/types

---

## 9. 异常处理规范

### 原则

1. Service 层抛出业务异常
2. Controller 层统一捕获（NestJS 自动处理）
3. 使用 NestJS 内置异常类

### 异常类型

- `BadRequestException` - 400 错误请求
- `UnauthorizedException` - 401 未授权
- `ForbiddenException` - 403 禁止访问
- `NotFoundException` - 404 未找到
- `ConflictException` - 409 冲突
- `InternalServerErrorException` - 500 服务器错误

### 示例

```typescript
// Service 层
if (!parent.isVotingOpen()) {
  throw new BadRequestException('操作已截止');
}

// Controller 层（自动处理）
// NestJS 会自动转换为 HTTP 响应
```

---

## 10. 日志规范

### 原则

1. 禁止使用 `console.log`
2. 使用 NestJS Logger
3. 关键操作记录日志
4. 使用结构化日志

### 日志级别

- `error` - 错误
- `warn` - 警告
- `log` - 信息
- `debug` - 调试

### 示例

```typescript
constructor(private logger: Logger) {}

async createItem(dto: CreateItemDto) {
  this.logger.log('Creating item', { parentId: dto.parentId });

  try {
    // 业务逻辑
  } catch (error) {
    this.logger.error('Failed to create item', error);
    throw error;
  }
}
```

---

## 11. 事务规范

### 原则

1. 事务在 Service 层管理
2. 写操作应该在事务内
3. 使用 TypeORM 事务装饰器或手动管理

### 示例

```typescript
// 方式1：使用装饰器（需要配置）
@Transactional()
async create(dto: CreateItemDto): Promise<ItemEntity> {
  // 事务内的操作
}

// 方式2：手动管理
async create(dto: CreateItemDto): Promise<ItemEntity> {
  return this.dataSource.transaction(async (manager) => {
    const item = await manager.save(ItemEntity, itemData);
    // 其他操作
    return item;
  });
}
```

---

## 12. 缓存规范

### 原则

1. 缓存逻辑在 Service 层
2. 缓存作为优化手段，不作为数据源
3. 缓存失效要可控

### 示例

```typescript
async getItem(id: string): Promise<ItemEntity> {
  const cached = await this.cacheService.get(`item:${id}`);
  if (cached) return cached;

  const item = await this.itemRepo.findById(id);
  if (item) {
    await this.cacheService.set(`item:${id}`, item, 300);
  }
  return item;
}
```

---

## 13. 权限与安全规范

### 原则

1. 权限检查在 Controller 层（通过 Guard）
2. Service 层可以接收用户信息进行业务判断
3. 敏感操作需要二次校验

### 示例

```typescript
@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemController {
  @Post()
  async create(@Body() dto: CreateItemDto, @CurrentUser() user: User) {
    return this.itemService.create(dto, user.id);
  }
}
```

---

## 14. 测试规范

### 原则

1. Service 层必须有单元测试
2. Controller 层有集成测试
3. 关键业务逻辑必须有测试覆盖

### 示例

```typescript
describe('ItemService', () => {
  let service: ItemService;
  let repo: ItemRepository;

  beforeEach(() => {
    repo = mock<ItemRepository>();
    service = new ItemService(repo);
  });

  it('should create item', async () => {
    // 测试逻辑
  });
});
```

---

## 15. 代码组织规范

### 目录结构

```
src/
├── modules/           # 业务模块
├── common/            # 共享代码
├── infrastructure/    # 基础设施
├── config/           # 配置
└── main.ts           # 入口
```

### 命名规范

- Controller：`[Module]Controller`
- Service：`[Module]Service`
- Repository：`[Module]Repository`
- DTO：`[Action][Module]Dto`（如 `CreateItemDto`）
- Entity：`[Module]Entity`

---

## 16. 禁止事项（红线）

- ❌ Controller 包含业务逻辑
- ❌ Service 直接返回 ORM Entity（可选，简化时可以）
- ❌ Repository 包含业务逻辑
- ❌ 使用 `console.log`
- ❌ 硬编码配置值
- ❌ 无测试的关键业务逻辑

---

## 17. 快速开发建议

1. **先实现功能**：快速实现功能，再优化架构
2. **适度抽象**：只在必要时抽象，避免过度设计
3. **代码清晰**：代码结构清晰，易于理解和维护
4. **迭代优化**：随着业务增长，逐步优化架构
