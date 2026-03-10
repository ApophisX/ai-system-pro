import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DataSource, In, LessThan } from 'typeorm';
import { ChatMessageEntity } from '../entities/chat-message.entity';
import { ChatMessageStatus } from '../enums/chat-message-status.enum';
import { ChatMessageType } from '../enums/chat-message-type.enum';

/**
 * 聊天消息查询参数
 */
export interface ChatMessageQueryOptions {
  conversationId?: string;
  senderId?: string;
  receiverId?: string;
  type?: ChatMessageType;
  unreadOnly?: boolean;
  startDate?: Date;
  endDate?: Date;
  skip: number;
  take: number;
}

/**
 * 聊天消息仓储
 *
 * 负责聊天消息的数据访问操作
 */
@Injectable()
export class ChatMessageRepository extends Repository<ChatMessageEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(ChatMessageEntity, dataSource.createEntityManager());
  }

  /**
   * 根据 ID 查找消息
   */
  async findById(id: string): Promise<ChatMessageEntity> {
    const message = await this.findOne({
      where: { id },
      relations: ['sender', 'receiver', 'conversation'],
    });
    if (!message) {
      throw new NotFoundException('消息不存在');
    }
    return message;
  }

  /**
   * 根据会话ID和消息ID查找消息（确保消息属于该会话）
   */
  async findByConversationIdAndId(conversationId: string, id: string): Promise<ChatMessageEntity | null> {
    return this.findOne({
      where: { conversationId, id },
      relations: ['sender', 'receiver'],
    });
  }

  /**
   * 分页查询会话的消息列表
   */
  async findMessagesWithPagination(options: ChatMessageQueryOptions): Promise<[ChatMessageEntity[], number]> {
    const queryBuilder = this.createQueryBuilder('message');

    queryBuilder.leftJoinAndSelect('message.sender', 'sender');
    queryBuilder.leftJoinAndSelect('message.receiver', 'receiver');

    // 会话ID过滤
    if (options.conversationId) {
      queryBuilder.andWhere('message.conversationId = :conversationId', {
        conversationId: options.conversationId,
      });
    }

    // 发送者过滤
    if (options.senderId) {
      queryBuilder.andWhere('message.senderId = :senderId', {
        senderId: options.senderId,
      });
    }

    // 接收者过滤
    if (options.receiverId) {
      queryBuilder.andWhere('message.receiverId = :receiverId', {
        receiverId: options.receiverId,
      });
    }

    // 消息类型过滤
    if (options.type) {
      queryBuilder.andWhere('message.type = :type', {
        type: options.type,
      });
    }

    // 只查询未读消息
    if (options.unreadOnly) {
      queryBuilder.andWhere('message.isRead = :isRead', {
        isRead: false,
      });
    }

    // 日期范围过滤
    if (options.startDate) {
      queryBuilder.andWhere('message.createdAt >= :startDate', {
        startDate: options.startDate,
      });
    }
    if (options.endDate) {
      queryBuilder.andWhere('message.createdAt <= :endDate', {
        endDate: options.endDate,
      });
    }

    // 排除已撤回和失败的消息
    queryBuilder.andWhere('message.status != :recalledStatus', {
      recalledStatus: ChatMessageStatus.RECALLED,
    });
    queryBuilder.andWhere('message.status != :failedStatus', {
      failedStatus: ChatMessageStatus.FAILED,
    });

    // 按创建时间倒序（最新的在前）
    queryBuilder.orderBy('message.createdAt', 'DESC');

    queryBuilder.skip(options.skip);
    queryBuilder.take(options.take);

    return queryBuilder.getManyAndCount();
  }

  /**
   * 获取会话的未读消息数量
   */
  async countUnreadByConversationId(conversationId: string, receiverId: string): Promise<number> {
    return this.count({
      where: {
        conversationId,
        receiverId,
        isRead: false,
        status: ChatMessageStatus.SENT,
      },
    });
  }

  /**
   * 标记会话的所有消息为已读
   */
  async markConversationAsRead(conversationId: string, receiverId: string): Promise<void> {
    await this.update(
      {
        conversationId,
        receiverId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
        status: ChatMessageStatus.READ,
      },
    );
  }

  /**
   * 标记单条消息为已读
   */
  async markAsRead(messageId: string): Promise<void> {
    await this.update(
      { id: messageId },
      {
        isRead: true,
        readAt: new Date(),
        status: ChatMessageStatus.READ,
      },
    );
  }

  /**
   * 批量标记消息为已读
   */
  async batchMarkAsRead(messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) {
      return;
    }

    await this.update(
      {
        id: In(messageIds),
      },
      {
        isRead: true,
        readAt: new Date(),
        status: ChatMessageStatus.READ,
      },
    );
  }

  /**
   * 撤回消息
   */
  async recallMessage(messageId: string, senderId: string): Promise<void> {
    const result = await this.update(
      {
        id: messageId,
        senderId, // 确保只能撤回自己发送的消息
      },
      {
        status: ChatMessageStatus.RECALLED,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException('消息不存在或无权撤回');
    }
  }

  /**
   * 获取会话的最后一条消息
   */
  async getLastMessage(conversationId: string): Promise<ChatMessageEntity | null> {
    return this.findOne({
      where: { conversationId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取会话中指定时间之前的消息（用于分页加载历史消息）
   */
  async findMessagesBefore(conversationId: string, beforeDate: Date, limit: number = 20): Promise<ChatMessageEntity[]> {
    return this.find({
      where: {
        conversationId,
        createdAt: LessThan(beforeDate),
      },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['sender', 'receiver'],
    });
  }
}
