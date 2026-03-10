import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DataSource, In } from 'typeorm';
import { ChatConversationEntity } from '../entities/chat-conversation.entity';
import { ChatConversationStatus } from '../enums/chat-conversation-status.enum';

/**
 * 聊天会话查询参数
 */
export interface ChatConversationQueryOptions {
  userId: string;
  keyword?: string;
  skip: number;
  take: number;
}

/**
 * 聊天会话仓储
 *
 * 负责聊天会话的数据访问操作
 */
@Injectable()
export class ChatConversationRepository extends Repository<ChatConversationEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(ChatConversationEntity, dataSource.createEntityManager());
  }

  /**
   * 根据 ID 查找会话
   */
  async findById(id: string): Promise<ChatConversationEntity> {
    const conversation = await this.findOne({
      where: { id },
      relations: ['user1', 'user2', 'lastMessage'],
    });
    if (!conversation) {
      throw new NotFoundException('会话不存在');
    }
    return conversation;
  }

  /**
   * 根据用户ID查找会话（确保用户是会话的参与者）
   */
  async findByUserIdAndId(userId: string, id: string): Promise<ChatConversationEntity | null> {
    return this.findOne({
      where: [
        { id, userId1: userId },
        { id, userId2: userId },
      ],
      relations: ['user1', 'user2', 'lastMessage'],
    });
  }

  /**
   * 查找或创建两个用户之间的会话
   * 确保 userId1 < userId2 以保持唯一性
   */
  async findOrCreateConversation(userId1: string, userId2: string): Promise<ChatConversationEntity> {
    // 确保 userId1 < userId2
    const [u1, u2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

    let conversation = await this.findOne({
      where: { userId1: u1, userId2: u2 },
      relations: ['user1', 'user2'],
    });

    if (!conversation) {
      conversation = this.create({
        userId1: u1,
        userId2: u2,
        status: ChatConversationStatus.ACTIVE,
        unreadCount1: 0,
        unreadCount2: 0,
        blockedByUser1: false,
        blockedByUser2: false,
      });
      conversation = await this.save(conversation);
      // 重新加载关系
      conversation = await this.findOne({
        where: { id: conversation.id },
        relations: ['user1', 'user2'],
      });
    }

    return conversation!;
  }

  /**
   * 分页查询用户的会话列表
   */
  async findUserConversationsWithPagination(
    options: ChatConversationQueryOptions,
  ): Promise<[ChatConversationEntity[], number]> {
    const queryBuilder = this.createQueryBuilder('conversation');

    queryBuilder.leftJoinAndSelect('conversation.user1', 'user1');
    queryBuilder.leftJoinAndSelect('conversation.user2', 'user2');
    queryBuilder.leftJoinAndSelect('conversation.lastMessage', 'lastMessage');

    // 用户必须是会话的参与者
    queryBuilder.andWhere('(conversation.userId1 = :userId OR conversation.userId2 = :userId)', {
      userId: options.userId,
    });

    // 只查询正常状态的会话
    queryBuilder.andWhere('conversation.status = :status', {
      status: ChatConversationStatus.ACTIVE,
    });

    // 关键字搜索（搜索对方用户名、手机号等）
    if (options.keyword) {
      queryBuilder.andWhere(
        '(user1.username LIKE :keyword OR user1.phone LIKE :keyword OR user2.username LIKE :keyword OR user2.phone LIKE :keyword)',
        { keyword: `%${options.keyword}%` },
      );
    }

    // 按最后消息时间倒序
    queryBuilder.orderBy('conversation.lastMessageAt', 'DESC');
    queryBuilder.addOrderBy('conversation.createdAt', 'DESC');

    queryBuilder.skip(options.skip);
    queryBuilder.take(options.take);

    return queryBuilder.getManyAndCount();
  }

  /**
   * 更新会话的最后一条消息
   */
  async updateLastMessage(conversationId: string, messageId: string, messageContent: string): Promise<void> {
    await this.update(
      { id: conversationId },
      {
        lastMessageId: messageId,
        lastMessageContent: messageContent,
        lastMessageAt: new Date(),
      },
    );
  }

  /**
   * 增加未读消息数
   */
  async incrementUnreadCount(conversationId: string, receiverId: string): Promise<void> {
    const conversation = await this.findById(conversationId);
    if (conversation.userId1 === receiverId) {
      await this.increment({ id: conversationId }, 'unreadCount1', 1);
    } else if (conversation.userId2 === receiverId) {
      await this.increment({ id: conversationId }, 'unreadCount2', 1);
    }
  }

  /**
   * 重置未读消息数
   */
  async resetUnreadCount(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.findById(conversationId);
    const updateData: any = {};
    if (conversation.userId1 === userId) {
      updateData.unreadCount1 = 0;
      updateData.lastReadAt1 = new Date();
    } else if (conversation.userId2 === userId) {
      updateData.unreadCount2 = 0;
      updateData.lastReadAt2 = new Date();
    }
    if (Object.keys(updateData).length > 0) {
      await this.update({ id: conversationId }, updateData);
    }
  }

  /**
   * 更新会话屏蔽状态
   */
  async updateBlockStatus(conversationId: string, userId: string, blocked: boolean): Promise<void> {
    const conversation = await this.findById(conversationId);
    const updateData: any = {};
    if (conversation.userId1 === userId) {
      updateData.blockedByUser1 = blocked;
    } else if (conversation.userId2 === userId) {
      updateData.blockedByUser2 = blocked;
    }
    if (Object.keys(updateData).length > 0) {
      await this.update({ id: conversationId }, updateData);
    }
  }

  /**
   * 获取用户的总未读消息数（所有会话）
   */
  async getTotalUnreadCount(userId: string): Promise<number> {
    const conversations = await this.find({
      where: [
        { userId1: userId, status: ChatConversationStatus.ACTIVE },
        { userId2: userId, status: ChatConversationStatus.ACTIVE },
      ],
    });

    let total = 0;
    for (const conv of conversations) {
      if (conv.userId1 === userId) {
        total += conv.unreadCount1;
      } else {
        total += conv.unreadCount2;
      }
    }

    return total;
  }
}
