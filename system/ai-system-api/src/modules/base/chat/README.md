# 聊天模块 (Chat Module)

## 概述

聊天模块提供用户之间的实时聊天功能，支持文本、图片、视频、语音、文件等多种消息类型，具备完整的在线/离线消息处理能力。

## 功能特性

### 核心功能

- ✅ **多种消息类型**：文本、图片、视频、语音、文件
- ✅ **实时消息推送**：基于 WebSocket 的实时通信
- ✅ **在线状态管理**：实时显示用户在线/离线状态
- ✅ **离线消息存储**：自动存储离线消息，用户上线后推送
- ✅ **消息已读/未读**：支持消息已读状态追踪
- ✅ **消息撤回**：支持撤回2分钟内的消息
- ✅ **会话管理**：会话列表、屏蔽、删除等功能
- ✅ **输入状态提示**：显示"对方正在输入"状态

### 技术特性

- 三层架构：Controller → Service → Repository
- WebSocket 实时通信
- Redis 在线状态管理
- 离线消息队列（Redis）
- 事务保证数据一致性
- 完整的 Swagger API 文档

## 安装依赖

在使用此模块前，需要安装以下依赖：

```bash
pnpm add @nestjs/platform-socket.io socket.io
```

## 数据库表结构

### chat_conversation（聊天会话表）

- `id`: UUID 主键
- `user_id1`: 用户1 ID（较小的用户ID）
- `user_id2`: 用户2 ID（较大的用户ID）
- `status`: 会话状态（active/deleted/blocked）
- `last_message_id`: 最后一条消息 ID
- `last_message_content`: 最后一条消息内容（预览）
- `last_message_at`: 最后一条消息时间
- `unread_count1`: 用户1未读消息数
- `unread_count2`: 用户2未读消息数
- `blocked_by_user1`: 用户1是否屏蔽了会话
- `blocked_by_user2`: 用户2是否屏蔽了会话
- `last_read_at1`: 用户1最后阅读时间
- `last_read_at2`: 用户2最后阅读时间

### chat_message（聊天消息表）

- `id`: UUID 主键
- `conversation_id`: 会话 ID
- `sender_id`: 发送者 ID
- `receiver_id`: 接收者 ID
- `type`: 消息类型（text/image/video/audio/file/system）
- `content`: 消息内容
- `file_url`: 文件 URL
- `file_name`: 文件名称
- `file_size`: 文件大小（字节）
- `mime_type`: 文件 MIME 类型
- `width`: 图片/视频宽度（像素）
- `height`: 图片/视频高度（像素）
- `duration`: 语音/视频时长（秒）
- `status`: 消息状态（sending/sent/delivered/read/failed/recalled）
- `is_read`: 是否已读
- `read_at`: 已读时间
- `extra`: 扩展信息（JSON）

## API 接口

### HTTP API

#### 发送消息

```http
POST /app/chat/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "receiverId": "uuid-of-receiver",
  "type": "text",
  "content": "你好，这是一条消息"
}
```

#### 获取会话列表

```http
GET /app/chat/conversations?page=0&pageSize=20&keyword=张三
Authorization: Bearer {token}
```

#### 获取消息列表

```http
GET /app/chat/messages?conversationId=uuid&page=0&pageSize=20
Authorization: Bearer {token}
```

#### 标记会话为已读

```http
PUT /app/chat/conversations/{conversationId}/read
Authorization: Bearer {token}
```

#### 撤回消息

```http
PUT /app/chat/messages/{messageId}/recall
Authorization: Bearer {token}
```

#### 获取未读消息总数

```http
GET /app/chat/unread/count
Authorization: Bearer {token}
```

### WebSocket API

#### 连接

```javascript
const socket = io('http://localhost:3000/chat', {
  auth: {
    token: 'your-jwt-token',
  },
});
```

#### 发送消息

```javascript
socket.emit('message:send', {
  receiverId: 'uuid-of-receiver',
  type: 'text',
  content: '你好',
});
```

#### 监听新消息

```javascript
socket.on('message:new', (message) => {
  console.log('收到新消息:', message);
});
```

#### 标记已读

```javascript
socket.emit('message:read', {
  messageIds: ['message-id-1', 'message-id-2'],
});
```

#### 正在输入

```javascript
socket.emit('typing:start', {
  receiverId: 'uuid-of-receiver',
});

socket.emit('typing:stop', {
  receiverId: 'uuid-of-receiver',
});
```

#### 监听输入状态

```javascript
socket.on('typing:start', (data) => {
  console.log('对方正在输入:', data.senderId);
});

socket.on('typing:stop', (data) => {
  console.log('对方停止输入:', data.senderId);
});
```

#### 获取在线状态

```javascript
socket.emit('user:status', {
  userIds: ['user-id-1', 'user-id-2'],
});

socket.on('user:status', (data) => {
  console.log('在线状态:', data.statuses);
});
```

## 消息类型

### 文本消息

```json
{
  "receiverId": "uuid",
  "type": "text",
  "content": "这是一条文本消息"
}
```

### 图片消息

```json
{
  "receiverId": "uuid",
  "type": "image",
  "fileUrl": "https://example.com/image.jpg",
  "width": 1920,
  "height": 1080,
  "fileSize": 1024000,
  "mimeType": "image/jpeg"
}
```

### 视频消息

```json
{
  "receiverId": "uuid",
  "type": "video",
  "fileUrl": "https://example.com/video.mp4",
  "width": 1920,
  "height": 1080,
  "duration": 30,
  "fileSize": 10485760,
  "mimeType": "video/mp4"
}
```

### 语音消息

```json
{
  "receiverId": "uuid",
  "type": "audio",
  "fileUrl": "https://example.com/audio.mp3",
  "duration": 10,
  "fileSize": 512000,
  "mimeType": "audio/mpeg"
}
```

### 文件消息

```json
{
  "receiverId": "uuid",
  "type": "file",
  "fileUrl": "https://example.com/document.pdf",
  "fileName": "document.pdf",
  "fileSize": 2048000,
  "mimeType": "application/pdf"
}
```

## 在线状态管理

在线状态存储在 Redis 中，键格式：`chat:online:{userId}`

- 用户上线时设置键，TTL 为 3600 秒（1小时）
- 用户下线时删除键
- 通过 `user:status` 事件查询在线状态

## 离线消息处理

离线消息存储在 Redis 中，键格式：`chat:offline:{userId}`

- 当接收者离线时，消息会被存储到离线消息队列
- 用户上线后，自动推送所有离线消息
- 最多保存 100 条离线消息
- 消息 TTL 为 86400 秒（24小时）

## 使用示例

### 前端连接 WebSocket

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/chat', {
  auth: {
    token: localStorage.getItem('token'),
  },
});

// 监听新消息
socket.on('message:new', (message) => {
  // 显示消息
  displayMessage(message);
});

// 发送消息
function sendMessage(receiverId: string, content: string) {
  socket.emit('message:send', {
    receiverId,
    type: 'text',
    content,
  });
}

// 标记已读
function markAsRead(messageIds: string[]) {
  socket.emit('message:read', { messageIds });
}
```

## 注意事项

1. **消息撤回限制**：只能撤回2分钟内的消息
2. **离线消息限制**：最多保存100条离线消息
3. **在线状态过期**：在线状态 TTL 为1小时，需要定期刷新
4. **文件上传**：文件需要先上传到 OSS，然后使用返回的 URL
5. **会话唯一性**：通过 userId1 < userId2 保证会话唯一性

## 扩展功能

未来可以考虑添加以下功能：

- [ ] 群聊功能
- [ ] 消息转发
- [ ] 消息搜索
- [ ] 消息加密
- [ ] 阅后即焚
- [ ] 消息撤回通知
- [ ] 消息已读回执
- [ ] 消息编辑
- [ ] 消息回复
- [ ] 消息引用
