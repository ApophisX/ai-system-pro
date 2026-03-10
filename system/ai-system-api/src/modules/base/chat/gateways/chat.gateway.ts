import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from '../services/chat.service';
import { CreateChatMessageDto } from '../dto/create-chat-message.dto';
import { RedisService } from '@/infrastructure/redis/redis.service';
import { ChatMessageStatus } from '../enums/chat-message-status.enum';

/**
 * WebSocket 认证数据
 */
interface SocketAuth {
  userId: string;
}

/**
 * 聊天 WebSocket Gateway
 *
 * 提供实时聊天功能：
 * - 消息实时推送
 * - 在线状态管理
 * - 离线消息推送
 */
@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly onlineUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 客户端连接
   */
  async handleConnection(client: Socket) {
    try {
      const auth = await this.authenticateSocket(client);
      if (!auth) {
        this.logger.warn(`Socket连接认证失败: ${client.id}`);
        client.disconnect();
        return;
      }

      const { userId } = auth;
      client.data.userId = userId;

      // 存储在线状态
      this.onlineUsers.set(userId, client.id);
      await this.setUserOnlineStatus(userId, true);

      // 加入用户专属房间
      client.join(`user:${userId}`);

      this.logger.log(`用户上线: userId=${userId}, socketId=${client.id}`);

      // 通知好友用户上线（可选功能）
      this.server.emit('user:online', { userId });

      // 推送离线消息
      await this.pushOfflineMessages(userId, client);
    } catch (error) {
      this.logger.error(`Socket连接处理失败: ${client.id}`, error);
      client.disconnect();
    }
  }

  /**
   * 客户端断开连接
   */
  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.onlineUsers.delete(userId);
      await this.setUserOnlineStatus(userId, false);

      this.logger.log(`用户下线: userId=${userId}, socketId=${client.id}`);

      // 通知好友用户下线（可选功能）
      this.server.emit('user:offline', { userId });
    }
  }

  /**
   * 发送消息
   */
  @SubscribeMessage('message:send')
  async handleSendMessage(@MessageBody() dto: CreateChatMessageDto, @ConnectedSocket() client: Socket) {
    const senderId = client.data.userId;
    if (!senderId) {
      return { error: '未认证' };
    }

    try {
      // 创建消息
      const message = await this.chatService.createMessage(senderId, dto);

      // 发送给接收者（如果在线）
      const receiverSocketId = this.onlineUsers.get(dto.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('message:new', message);
        // 标记为已送达
        // 注意：这里简化处理，实际应该在消息送达后更新状态
      } else {
        // 接收者离线，存储到离线消息队列
        await this.addOfflineMessage(dto.receiverId, message);
      }

      // 发送确认给发送者
      client.emit('message:sent', {
        messageId: message.id,
        status: ChatMessageStatus.SENT,
      });

      return { success: true, message };
    } catch (error) {
      this.logger.error(`发送消息失败: senderId=${senderId}`, error);
      return { error: error.message || '发送消息失败' };
    }
  }

  /**
   * 标记消息为已读
   */
  @SubscribeMessage('message:read')
  async handleMarkAsRead(@MessageBody() data: { messageIds: string[] }, @ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (!userId) {
      return { error: '未认证' };
    }

    try {
      // 这里可以调用 service 的方法批量标记已读
      // await this.chatService.batchMarkAsRead(userId, data.messageIds);

      // 通知发送者消息已读
      // 这里简化处理，实际应该查询消息的发送者并通知

      return { success: true };
    } catch (error) {
      this.logger.error(`标记已读失败: userId=${userId}`, error);
      return { error: error.message || '标记已读失败' };
    }
  }

  /**
   * 正在输入
   */
  @SubscribeMessage('typing:start')
  async handleTypingStart(@MessageBody() data: { receiverId: string }, @ConnectedSocket() client: Socket) {
    const senderId = client.data.userId;
    if (!senderId) {
      return { error: '未认证' };
    }

    const receiverSocketId = this.onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('typing:start', {
        senderId,
      });
    }

    return { success: true };
  }

  /**
   * 停止输入
   */
  @SubscribeMessage('typing:stop')
  async handleTypingStop(@MessageBody() data: { receiverId: string }, @ConnectedSocket() client: Socket) {
    const senderId = client.data.userId;
    if (!senderId) {
      return { error: '未认证' };
    }

    const receiverSocketId = this.onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('typing:stop', {
        senderId,
      });
    }

    return { success: true };
  }

  /**
   * 获取在线状态
   */
  @SubscribeMessage('user:status')
  async handleGetUserStatus(@MessageBody() data: { userIds: string[] }, @ConnectedSocket() client: Socket) {
    const statuses: Record<string, boolean> = {};

    for (const userId of data.userIds) {
      statuses[userId] = await this.isUserOnline(userId);
    }

    return { statuses };
  }

  /**
   * Socket 认证
   */
  private async authenticateSocket(client: Socket): Promise<SocketAuth | null> {
    try {
      // 从查询参数或授权头获取 token
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return null;
      }

      // 验证 JWT token
      const authConfig = this.configService.get('auth');
      const secret = authConfig?.jwt?.secret || process.env.JWT_SECRET || 'your-secret-key';
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      return {
        userId: payload.sub || payload.userId,
      };
    } catch (error) {
      this.logger.error(`Socket认证失败: ${client.id}`, error);
      return null;
    }
  }

  /**
   * 设置用户在线状态（Redis）
   */
  private async setUserOnlineStatus(userId: string, online: boolean): Promise<void> {
    const key = `chat:online:${userId}`;
    if (online) {
      await this.redisService.set(key, '1', 3600); // 1小时过期
    } else {
      await this.redisService.del(key);
    }
  }

  /**
   * 检查用户是否在线
   */
  private async isUserOnline(userId: string): Promise<boolean> {
    const key = `chat:online:${userId}`;
    const value = await this.redisService.get(key);
    return value !== null;
  }

  /**
   * 添加离线消息到队列
   */
  private async addOfflineMessage(userId: string, message: any): Promise<void> {
    const key = `chat:offline:${userId}`;
    const messages = await this.redisService.get(key);
    const messageList = messages ? JSON.parse(messages) : [];
    messageList.push(message);
    // 最多保存100条离线消息
    if (messageList.length > 100) {
      messageList.shift();
    }
    await this.redisService.set(key, JSON.stringify(messageList), 86400); // 24小时过期
  }

  /**
   * 推送离线消息
   */
  private async pushOfflineMessages(userId: string, client: Socket): Promise<void> {
    const key = `chat:offline:${userId}`;
    const messages = await this.redisService.get(key);

    if (messages) {
      const messageList = JSON.parse(messages);
      // 推送离线消息
      for (const message of messageList) {
        client.emit('message:new', message);
      }
      // 清空离线消息队列
      await this.redisService.del(key);
    }
  }

  /**
   * 发送消息给指定用户（如果在线）
   */
  async sendMessageToUser(userId: string, event: string, data: any): Promise<boolean> {
    const socketId = this.onlineUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  /**
   * 广播消息给所有在线用户
   */
  broadcast(event: string, data: any): void {
    this.server.emit(event, data);
  }
}
