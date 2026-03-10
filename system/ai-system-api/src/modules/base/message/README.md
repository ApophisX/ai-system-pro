# 消息中心模块

消息中心模块提供用户消息管理功能，支持多种消息类型和消息状态管理。

## 功能特性

- ✅ 消息创建（单个/批量）
- ✅ 消息列表查询（分页、筛选、搜索）
- ✅ 消息详情查看（自动标记已读）
- ✅ 消息状态更新（已读/未读）
- ✅ 批量操作（批量更新、批量删除）
- ✅ 未读消息统计
- ✅ 按类型统计未读消息数量

## 消息类型

| 类型           | 说明         | 使用场景                                       |
| -------------- | ------------ | ---------------------------------------------- |
| `SYSTEM`       | 系统消息     | 系统通知、公告等                               |
| `USER`         | 用户消息     | 用户之间的互动消息，如关注、私信等             |
| `ORDER`        | 订单消息     | 订单相关的通知，如订单创建、支付、完成、取消等 |
| `VERIFICATION` | 实名认证消息 | 实名认证审核结果通知                           |
| `PAYMENT`      | 支付消息     | 支付相关的通知，如支付成功、退款等             |
| `ASSET`        | 资产消息     | 资产相关的通知，如资产审核、上架、下架等       |
| `REVIEW`       | 评价消息     | 评价相关的通知，如收到评价、评价回复等         |

## 消息状态

| 状态      | 说明             |
| --------- | ---------------- |
| `UNREAD`  | 未读             |
| `READ`    | 已读             |
| `DELETED` | 已删除（软删除） |

## API 接口

### App 端接口

#### 1. 获取消息列表

```
GET /app/message
```

**查询参数：**

- `page`: 页码（默认 0）
- `pageSize`: 每页数量（默认 10）
- `type`: 消息类型（可选）
- `status`: 消息状态（可选）
- `keyword`: 关键字搜索（可选）
- `startDate`: 开始日期（可选）
- `endDate`: 结束日期（可选）

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "SYSTEM",
      "title": "系统通知",
      "content": "这是一条系统消息",
      "status": "UNREAD",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 0,
    "pageSize": 10,
    "total": 100
  }
}
```

#### 2. 获取消息详情

```
GET /app/message/:id
```

**说明：** 查看消息详情时，如果消息是未读状态，会自动标记为已读。

#### 3. 更新消息

```
PUT /app/message/:id
```

**请求体：**

```json
{
  "status": "READ"
}
```

#### 4. 批量更新消息

```
PUT /app/message/batch
```

**请求体：**

```json
{
  "messageIds": ["uuid-1", "uuid-2"],
  "status": "READ"
}
```

#### 5. 标记所有消息为已读

```
PUT /app/message/read-all?type=SYSTEM
```

**查询参数：**

- `type`: 消息类型（可选，不传则标记所有类型）

#### 6. 删除消息

```
DELETE /app/message/:id
```

#### 7. 批量删除消息

```
DELETE /app/message/batch
```

**请求体：**

```json
{
  "messageIds": ["uuid-1", "uuid-2"]
}
```

#### 8. 获取未读消息数量

```
GET /app/message/unread/count?type=SYSTEM
```

**查询参数：**

- `type`: 消息类型（可选，不传则返回所有类型的未读数量）

#### 9. 获取各类型未读消息数量统计

```
GET /app/message/unread/count-by-type
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "SYSTEM": 5,
    "USER": 3,
    "ORDER": 10,
    "VERIFICATION": 0,
    "PAYMENT": 2,
    "ASSET": 1,
    "REVIEW": 0
  }
}
```

## 使用示例

### 在其他模块中创建消息

```typescript
import { MessageService } from '@/modules/base/message/services';
import { MessageType } from '@/modules/base/message/enums';

@Injectable()
export class OrderService {
  constructor(private messageService: MessageService) {}

  async createOrder(dto: CreateOrderDto, userId: string) {
    // 创建订单逻辑...

    // 创建订单消息
    await this.messageService.create({
      userId: order.ownerId,
      type: MessageType.ORDER,
      title: '新订单通知',
      content: `您有一个新的订单：${order.id}`,
      relatedId: order.id,
      relatedType: 'ORDER',
      extra: {
        link: `/order/${order.id}`,
      },
    });
  }
}
```

### 批量创建消息

```typescript
// 向多个用户发送系统通知
await this.messageService.batchCreate(['user-id-1', 'user-id-2', 'user-id-3'], {
  type: MessageType.SYSTEM,
  title: '系统维护通知',
  content: '系统将于今晚进行维护，预计耗时 2 小时',
  extra: {
    link: '/announcement/123',
  },
});
```

## 数据库表结构

### message 表

| 字段           | 类型         | 说明               |
| -------------- | ------------ | ------------------ |
| `id`           | UUID         | 主键               |
| `user_id`      | UUID         | 用户 ID（接收者）  |
| `type`         | VARCHAR(50)  | 消息类型           |
| `title`        | VARCHAR(200) | 消息标题           |
| `content`      | TEXT         | 消息内容           |
| `status`       | VARCHAR(20)  | 消息状态           |
| `related_id`   | UUID         | 关联对象 ID        |
| `related_type` | VARCHAR(50)  | 关联对象类型       |
| `extra`        | JSON         | 扩展信息           |
| `read_at`      | TIMESTAMP    | 阅读时间           |
| `created_at`   | TIMESTAMP    | 创建时间           |
| `updated_at`   | TIMESTAMP    | 更新时间           |
| `deleted_at`   | TIMESTAMP    | 删除时间（软删除） |

### 索引

- `user_id`
- `type`
- `status`
- `(user_id, status)` - 复合索引
- `(user_id, type)` - 复合索引
- `created_at`

## 注意事项

1. **权限控制**：所有接口都需要 JWT 认证，用户只能操作自己的消息
2. **自动标记已读**：查看消息详情时，如果消息是未读状态，会自动标记为已读
3. **软删除**：删除消息采用软删除方式，不会真正删除数据
4. **事务支持**：创建消息的操作在事务中执行，确保数据一致性
