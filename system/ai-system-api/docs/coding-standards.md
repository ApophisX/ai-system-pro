# 编码规范 (Coding Standards)

**该文件定义日常编码的具体规范和要求。**

> 本规范适用于 **MySQL + TypeORM 的 NestJS 项目**  
> 目标：**快速开发 / 代码清晰 / 易于维护**

**关联文档**：

- [architecture.md](./architecture.md) - 三层架构原则与分层职责
- [prohibitions.md](./prohibitions.md) - 禁止事项（红线）
- [adr.md](./adr.md) - 技术决策记录
- `docs/api-spec/` - API 契约与 OpenAPI 规范

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
@Controller('votes')
export class VoteController {
  constructor(private voteService: VoteService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateVoteDto, @User() user: User) {
    return this.voteService.create(dto, user.id);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.voteService.getById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateVoteDto) {
    return this.voteService.update(id, dto);
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
export class VoteService {
  constructor(
    private voteRepo: VoteRepository,
    private assemblyRepo: AssemblyRepository,
    private dataSource: DataSource,
    private logger: Logger = new Logger(VoteService.name),
  ) {}

  async create(dto: CreateVoteDto, ownerId: string): Promise<VoteEntity> {
    // 1. 业务验证
    const assembly = await this.assemblyRepo.findById(dto.assemblyId);
    if (!assembly) {
      throw new NotFoundException('业主大会不存在');
    }

    // 2. 在事务内创建投票
    const vote = await this.dataSource.transaction(async manager => {
      const newVote = new VoteEntity();
      newVote.assemblyId = dto.assemblyId;
      newVote.ownerId = ownerId;
      newVote.title = dto.title;
      newVote.status = 'active';

      return manager.save(newVote);
    });

    this.logger.log(`Vote created: ${vote.id}`);
    return vote;
  }

  async getById(id: string): Promise<VoteEntity | null> {
    return this.voteRepo.findById(id);
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
export class VoteRepository {
  constructor(
    @InjectRepository(VoteEntity)
    private repo: Repository<VoteEntity>,
  ) {}

  async save(vote: VoteEntity): Promise<VoteEntity> {
    return this.repo.save(vote);
  }

  async findById(id: string): Promise<VoteEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['assembly'],
    });
  }

  async findByOwnerId(ownerId: string): Promise<VoteEntity[]> {
    return this.repo.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
      relations: ['assembly'],
    });
  }

  async update(id: string, data: Partial<VoteEntity>): Promise<void> {
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
- 不用特意定义

```ts
// @Column({ type: 'varchar', name: "verification_status" }) 不用定义name，后面会统一处理
@Column({ type: 'varchar'})
verificationStatus;
string;
```

### 示例

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  BaseEntity,
  BaseEntityWithNumericId, //如果实体比较简单，不考虑ID问题可用这个继承
} from '@/infrastructure/database/entities/base.entity';
@Entity('votes')
export class VoteEntity extends BaseEntity {
  @ApiProperty();
  @PrimaryGeneratedColumn('uuid')
  @Expose();
  id: string;

  @ApiProperty();
  @Column({ type: 'uuid' })
  @Expose();
  ownerId: string;

  @ApiProperty();
  @Column({ type: 'uuid' })
  @Expose();
  @IsNotEmpty();
  assemblyId: string;

  @ApiProperty();
  @Column({ type: 'varchar', length: 200 })
  @Expose();
  @IsNotEmpty();
  title: string;

  @ApiProperty();
  @Column({ type: 'varchar', length: 50 })
  @Expose();
  status: string;

  @ApiPropertyOptional();
  @Column({ type: 'varchar', length: 500 })
  @Expose();
  @IsOptional();
  remark: string;

  // 关系
  @ManyToOne(() => AssemblyEntity)
  assembly: AssemblyEntity;
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
// create-vote.dto.ts - 创建投票请求
export class CreateVoteDto {
  @IsUUID()
  @IsNotEmpty()
  assemblyId: string;

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
// query-vote.dto.ts - 查询/列表请求
export class QueryVoteDto {
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
  assemblyId?: string;

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
// output-vote.dto.ts - 基于实体 OmitType
import { OmitType } from '@nestjs/swagger';
import { VoteEntity } from '../entities';

export class OutputVoteDto extends OmitType(VoteEntity, [
  'ownerId',
  'assemblyId',
  'assembly',
  'owner',
  'deletedAt',
  'version',
  'updatedBy',
  'updatedAt',
] as const) {
  /** 虚拟字段：脱敏业主昵称 */
  @ApiPropertyOptional()
  ownerNickname: string;
}

/** 聚合数据 DTO（无对应实体，单独定义） */
export class OutputVoteSummaryDto {
  totalCount: number;
  activeCount: number;
  closedCount: number;
}
```

```typescript
// 在 Controller 中返回
@Get(':id')
async getById(@Param('id') id: string): Promise<OutputVoteDto> {
  return this.voteService.getById(id);
}
```

### 更新 DTO（Update）

```typescript
// update-vote.dto.ts - 更新投票请求
export class UpdateVoteDto {
  @IsOptional()
  @IsEnum(['ACTIVE', 'CLOSED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}

// 在 Service 中使用
async update(id: string, dto: UpdateVoteDto): Promise<void> {
  await this.voteRepo.update(id, dto);
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
src/modules/vote/
├── vote.module.ts
├── controllers/             # 多个功能控制器
│   ├── vote-create.controller.ts
│   ├── vote-query.controller.ts
│   └── vote-manage.controller.ts
├── services/                # 多个功能服务
│   ├── vote-create.service.ts
│   ├── vote-query.service.ts
│   └── vote-manage.service.ts
├── repositories/            # 多个功能仓储
│   ├── vote-create.repository.ts
│   ├── vote-query.repository.ts
│   └── vote-manage.repository.ts
├── dto/                     # DTO 统一管理
│   ├── create-vote.dto.ts
│   ├── query-vote.dto.ts
│   ├── output-vote.dto.ts
│   └── update-vote.dto.ts
├── entities/
│   └── vote.entity.ts
└── types/
    └── vote.types.ts
```

### 模块注册（module.ts）

```typescript
// vote.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoteEntity } from './entities/vote.entity';

// Controllers
import { VoteCreateController } from './controllers/vote-create.controller';
import { VoteQueryController } from './controllers/vote-query.controller';
import { VoteManageController } from './controllers/vote-manage.controller';

// Services
import { VoteCreateService } from './services/vote-create.service';
import { VoteQueryService } from './services/vote-query.service';
import { VoteManageService } from './services/vote-manage.service';

// Repositories
import { VoteCreateRepository } from './repositories/vote-create.repository';
import { VoteQueryRepository } from './repositories/vote-query.repository';
import { VoteManageRepository } from './repositories/vote-manage.repository';

@Module({
  imports: [TypeOrmModule.forFeature([VoteEntity])],
  controllers: [VoteCreateController, VoteQueryController, VoteManageController],
  providers: [
    VoteCreateService,
    VoteQueryService,
    VoteManageService,
    VoteCreateRepository,
    VoteQueryRepository,
    VoteManageRepository,
  ],
  exports: [VoteCreateService, VoteQueryService, VoteManageService],
})
export class VoteModule {}
```

### 功能命名规范

- `[feature]-[module].controller.ts` - 功能+模块名称
- `[feature]-[module].service.ts` - 示例：`order-create.service.ts`
- `[feature]-[module].repository.ts` - 示例：`order-query.repository.ts`

**示例**：

- `vote-create.controller.ts` - 创建投票的控制器
- `vote-create.service.ts` - 创建投票的业务逻辑
- `vote-create.repository.ts` - 创建投票的数据操作
- `vote-query.controller.ts` - 查询投票的控制器
- `vote-manage.controller.ts` - 管理投票的控制器（权限隔离）

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
  const vote = await this.voteRepo.findById(id);
  if (!vote) {
    throw new NotFoundException('投票不存在');
  }
  return vote;
}

// 自动转换为 HTTP 响应：
// HTTP 404
// { "statusCode": 404, "message": "订单不存在", "error": "Not Found" }
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
  private logger: Logger = new Logger(OrderService.name),
) {}

async create(dto: CreateVoteDto, ownerId: string) {
  this.logger.log(`Creating vote: assemblyId=${dto.assemblyId}, ownerId=${ownerId}`);

  try {
    const vote = await this.voteRepo.save(newVote);
    this.logger.log(`Vote created: voteId=${vote.id}`);
    return vote;
  } catch (error) {
    this.logger.error('Failed to create vote', error);
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
async createVote(dto: CreateVoteDto): Promise<VoteEntity> {
  return this.dataSource.transaction(async (manager) => {
    const vote = await manager.save(VoteEntity, voteData);
    // 其他操作
    return vote;
  });
}

// 方式2：使用 QueryRunner
async createVote(dto: CreateVoteDto): Promise<VoteEntity> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const vote = await queryRunner.manager.save(VoteEntity, voteData);
    await queryRunner.commitTransaction();
    return vote;
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
@Controller('vote')
export class VoteController {
  @Post()
  @UseGuards(JwtAuthGuard) // 权限检查
  async create(@Body() dto: CreateVoteDto, @User() user: User) {
    return this.voteService.create(dto, user.id); // 传递用户信息
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
| Controller | `[Module]Controller`  | `VoteController` |
| Service    | `[Module]Service`     | `VoteService`    |
| Repository | `[Module]Repository`  | `VoteRepository` |
| Entity     | `[Module]Entity`      | `VoteEntity`     |
| DTO        | `[Action][Module]Dto` | `CreateVoteDto`  |
| Module     | `[Module]Module`      | `VoteModule`     |
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
if (!assembly.isVotingOpen()) {
  throw new BadRequestException('投票已截止');
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

async createVote(dto: CreateVoteDto) {
  this.logger.log('Creating vote', { assemblyId: dto.assemblyId });

  try {
    // 业务逻辑
  } catch (error) {
    this.logger.error('Failed to create vote', error);
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
async createOrder(dto: CreateOrderDto): Promise<Order> {
  // 事务内的操作
}

// 方式2：手动管理
async createOrder(dto: CreateOrderDto): Promise<Order> {
  return this.dataSource.transaction(async (manager) => {
    const order = await manager.save(OrderEntity, orderData);
    // 其他操作
    return order;
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
async getVote(id: string): Promise<Vote> {
  const cached = await this.cacheService.get(`vote:${id}`);
  if (cached) return cached;

  const vote = await this.voteRepo.findById(id);
  if (vote) {
    await this.cacheService.set(`vote:${id}`, vote, 300);
  }
  return vote;
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
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  @Post()
  async create(@Body() dto: CreateVoteDto, @CurrentUser() user: User) {
    return this.voteService.create(dto, user.id);
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
describe('VoteService', () => {
  let service: VoteService;
  let repo: VoteRepository;

  beforeEach(() => {
    repo = mock<VoteRepository>();
    service = new VoteService(repo);
  });

  it('should create vote', async () => {
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
- DTO：`[Action][Module]Dto`（如 `CreateOrderDto`）
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
