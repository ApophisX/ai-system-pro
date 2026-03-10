import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

// Entities
import { ChatConversationEntity, ChatMessageEntity } from './entities';

// Repositories
import { ChatConversationRepository, ChatMessageRepository } from './repositories';

// Services
import { ChatService } from './services/chat.service';

// Controllers
import { AppChatController } from './controllers';

// Gateways
import { ChatGateway } from './gateways';

/**
 * 聊天模块
 *
 * 提供用户之间的实时聊天功能：
 * - 文本、图片、视频、语音、文件消息
 * - 实时消息推送（WebSocket）
 * - 在线/离线状态管理
 * - 离线消息存储和推送
 * - 消息已读/未读状态
 * - 消息撤回
 * - 会话管理（屏蔽、删除等）
 *
 * @example
 * // HTTP API 接口
 * POST   /app/chat/messages                   发送消息
 * GET    /app/chat/conversations               获取会话列表
 * GET    /app/chat/conversations/:id           获取会话详情
 * GET    /app/chat/messages                    获取消息列表
 * PUT    /app/chat/conversations/:id/read      标记会话为已读
 * PUT    /app/chat/conversations/:id            更新会话（屏蔽等）
 * PUT    /app/chat/messages/:id/recall         撤回消息
 * GET    /app/chat/unread/count                获取未读消息总数
 *
 * // WebSocket 事件
 * 连接: ws://host/chat?token=xxx
 * 事件:
 *   - message:send       发送消息
 *   - message:read       标记已读
 *   - typing:start       正在输入
 *   - typing:stop        停止输入
 *   - user:status        获取在线状态
 * 监听:
 *   - message:new        新消息
 *   - message:sent       消息发送确认
 *   - typing:start       对方正在输入
 *   - typing:stop        对方停止输入
 *   - user:online        用户上线
 *   - user:offline       用户下线
 */
@Module({
  imports: [TypeOrmModule.forFeature([ChatConversationEntity, ChatMessageEntity]), JwtModule, ConfigModule],
  controllers: [AppChatController],
  providers: [ChatConversationRepository, ChatMessageRepository, ChatService, ChatGateway],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
