---
name: backend-nestjs
description: NestJS 后端开发规范（三层架构、TypeORM、Repository 模式）。在 apps/api 开发、编写 Controller/Service/Repository、新增接口或修改 NestJS 代码时使用。遵循 docs/backend/ 中的架构与红线。
---

# Backend NestJS 开发规范

本 skill 适用于 `apps/api` 的 NestJS 后端开发，技术栈：NestJS + TypeORM + MySQL + Swagger。

## 1. 三层架构（必须遵守）

```
Controller → Service → Repository → TypeORM/MySQL
```

| 层             | 职责                                         | 禁止                               |
| -------------- | -------------------------------------------- | ---------------------------------- |
| **Controller** | 接收请求、DTO 校验、Guard 权限、调用 Service | 业务逻辑、直接操作数据库           |
| **Service**    | 业务逻辑、事务管理、调用 Repository          | 直接写 SQL、直接 @InjectRepository |
| **Repository** | TypeORM 封装、数据访问、返回 Entity          | 业务逻辑、跨模块被调用             |

**依赖方向**：Controller 只能依赖 Service；Service 依赖 Repository、DataSource；Repository 只依赖 TypeORM。跨模块通过 Service 通信，禁止跨模块直接访问 Repository。

## 2. 模块结构

```
src/modules/[module-name]/
├── [module-name].module.ts
├── [module-name].controller.ts
├── [module-name].service.ts
├── [module-name].repository.ts
├── dto/
│   ├── create-[module].dto.ts
│   ├── query-[module].dto.ts
│   ├── output-[module].dto.ts
│   └── update-[module].dto.ts
├── entities/
│   └── [module].entity.ts
└── types/  (可选)
```

复杂模块可拆分为 `controllers/`、`services/`、`repositories/` 子目录，命名：`[feature]-[module].controller.ts`。

## 3. Controller 规范

- 全部加 Swagger 注解（@ApiTags、@SwaggerApiResponse 等）
- 使用 DTO + class-validator 校验
- 权限用 `@UseGuards(JwtAuthGuard)` 等
- 只调用 Service，不包含业务逻辑

```typescript
@ApiTags('Vote')
@Controller('vote')
export class VoteController {
  constructor(private voteService: VoteService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @SwaggerApiResponse(OutputVoteDto, { description: '创建投票' })
  async create(@CurrentUser() user: OutputUserDto, @Body() dto: CreateVoteDto) {
    return this.voteService.create(user, dto);
  }

  @Get(':id')
  @SwaggerApiResponse(OutputVoteDto, { description: '投票详情' })
  async getById(@Param('id') id: string) {
    return this.voteService.getById(id);
  }
}
```

## 4. Service 规范

- 一个方法 = 一个业务用例
- 写操作必须在事务内：`this.dataSource.transaction(async (manager) => { ... })`
- 业务验证在 Service，抛出 NestJS 异常
- 使用 Logger，禁止 console.log

```typescript
@Injectable()
export class VoteService {
  constructor(
    private voteRepo: VoteRepository,
    private dataSource: DataSource,
    private logger: Logger = new Logger(VoteService.name),
  ) {}

  async create(dto: CreateVoteDto, ownerId: string): Promise<VoteEntity> {
    const assembly = await this.assemblyRepo.findById(dto.assemblyId);
    if (!assembly) throw new NotFoundException('业主大会不存在');

    return this.dataSource.transaction(async manager => {
      const vote = new VoteEntity();
      vote.assemblyId = dto.assemblyId;
      vote.ownerId = ownerId;
      vote.title = dto.title;
      vote.status = 'active';
      return manager.save(vote);
    });
  }
}
```

## 5. Repository 规范

- 使用 `@InjectRepository(Entity)` 或继承 `Repository<Entity>`
- 方法名表达业务含义：`findById`、`findByOwnerId`、`save`、`update`
- 不包含业务逻辑，只做数据访问
- 返回 Entity

```typescript
@Injectable()
export class VoteRepository {
  constructor(
    @InjectRepository(VoteEntity)
    private repo: Repository<VoteEntity>,
  ) {}

  async findById(id: string): Promise<VoteEntity | null> {
    return this.repo.findOne({ where: { id }, relations: ['assembly'] });
  }

  async findByOwnerId(ownerId: string): Promise<VoteEntity[]> {
    return this.repo.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }
}
```

## 6. DTO 规范

- **Create**：创建请求，class-validator 校验
- **Query**：分页/筛选，`page`、`limit` 等
- **Output**：响应格式，优先用 `OmitType(Entity, [...])` 继承
- **Update**：更新请求，字段用 `@IsOptional()`

## 7. 异常与日志

- 使用 NestJS 内置异常：`NotFoundException`、`BadRequestException`、`ForbiddenException` 等
- 禁止 console.log，使用 `Logger`
- 日志不记录密码、Token 等敏感信息

## 8. API 文档同步

- 新增/修改接口时，更新 `./docs/api-spec/*.yaml`
- Swagger 装饰器与 OpenAPI 规范保持一致

## 9. 红线（禁止）

- Controller 直接调用 Repository
- Controller 包含业务逻辑
- Service 直接写 SQL 或 @InjectRepository
- Repository 包含业务判断
- 跨模块直接访问 Repository
- 写操作不在事务内
- 使用 `any` 类型
- 使用 console.log
- 硬编码配置/密钥
- 列表查询不分页

## 10. 详细文档

完整规范见项目文档：

- [architecture.md](../docs/architecture.md) - 架构与分层
- [coding-standards.md](../docs/coding-standards.md) - 编码规范
- [prohibitions.md](../docs/prohibitions.md) - 红线细则
- [adr.md](../docs/adr.md) - 技术决策
