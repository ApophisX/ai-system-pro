import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { ChatConversationRepository, ChatMessageRepository } from '../repositories';
import {
  CreateChatMessageDto,
  QueryChatConversationDto,
  QueryChatMessageDto,
  OutputChatConversationDto,
  OutputChatMessageDto,
  UpdateChatConversationDto,
} from '../dto';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';
import { ChatMessageStatus } from '../enums/chat-message-status.enum';
import { ChatMessageType } from '../enums/chat-message-type.enum';
import { ChatConversationEntity } from '../entities/chat-conversation.entity';
import { ChatMessageEntity } from '../entities/chat-message.entity';
import { OutputUserDto } from '@/modules/base/user/dto';

/**
 * 聊天服务
 *
 * 提供聊天相关的业务逻辑
 */
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly conversationRepo: ChatConversationRepository,
    private readonly messageRepo: ChatMessageRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 创建聊天消息
   */
  async createMessage(senderId: string, dto: CreateChatMessageDto): Promise<OutputChatMessageDto> {
    // 不能给自己发消息
    if (senderId === dto.receiverId) {
      throw new BadRequestException('不能给自己发消息');
    }

    // 验证消息内容
    this.validateMessageContent(dto);

    const message = await this.dataSource.transaction(async manager => {
      // 查找或创建会话
      const conversation = await this.conversationRepo.findOrCreateConversation(senderId, dto.receiverId);

      // 创建消息
      const newMessage = manager.create(ChatMessageEntity, {
        conversationId: conversation.id,
        senderId,
        receiverId: dto.receiverId,
        type: dto.type,
        content: dto.content,
        fileUrl: dto.fileUrl,
        fileName: dto.fileName,
        fileSize: dto.fileSize,
        mimeType: dto.mimeType,
        width: dto.width,
        height: dto.height,
        duration: dto.duration,
        extra: dto.extra,
        status: ChatMessageStatus.SENT,
        isRead: false,
      });

      const savedMessage = await manager.save(ChatMessageEntity, newMessage);

      // 更新会话的最后一条消息
      const messagePreview = this.getMessagePreview(savedMessage);
      await manager.update(
        ChatConversationEntity,
        { id: conversation.id },
        {
          lastMessageId: savedMessage.id,
          lastMessageContent: messagePreview,
          lastMessageAt: savedMessage.createdAt,
        },
      );

      // 增加接收者的未读消息数
      if (conversation.userId1 === dto.receiverId) {
        await manager.increment(ChatConversationEntity, { id: conversation.id }, 'unreadCount1', 1);
      } else {
        await manager.increment(ChatConversationEntity, { id: conversation.id }, 'unreadCount2', 1);
      }

      // 重新加载关系
      return manager.findOne(ChatMessageEntity, {
        where: { id: savedMessage.id },
        relations: ['sender', 'receiver', 'conversation'],
      });
    });

    this.logger.log(
      `消息已创建: messageId=${message!.id}, senderId=${senderId}, receiverId=${dto.receiverId}, type=${dto.type}`,
    );

    return plainToInstance(OutputChatMessageDto, message, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 获取会话列表
   */
  async getConversations(
    userId: string,
    dto: QueryChatConversationDto,
  ): Promise<{
    data: OutputChatConversationDto[];
    meta: PaginationMetaDto;
  }> {
    const [conversations, total] = await this.conversationRepo.findUserConversationsWithPagination({
      userId,
      keyword: dto.keyword,
      skip: dto.skip,
      take: dto.pageSize,
    });

    // 转换并补充对方用户信息
    const listItems = conversations.map(conv => {
      const otherUser = conv.userId1 === userId ? conv.user2 : conv.user1;
      const unreadCount = conv.getUnreadCount(userId);
      const isBlocked = conv.isBlockedBy(userId);

      const dto = plainToInstance(OutputChatConversationDto, conv, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      });

      dto.otherUser = plainToInstance(OutputUserDto, otherUser, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      });
      dto.unreadCount = unreadCount;
      dto.isBlocked = isBlocked;

      return dto;
    });

    const meta = new PaginationMetaDto(dto.page, dto.pageSize);
    meta.total = total;

    return { data: listItems, meta };
  }

  /**
   * 获取会话详情
   */
  async getConversationById(userId: string, conversationId: string): Promise<OutputChatConversationDto> {
    const conversation = await this.conversationRepo.findByUserIdAndId(userId, conversationId);
    if (!conversation) {
      throw new NotFoundException('会话不存在');
    }

    const otherUser = conversation.userId1 === userId ? conversation.user2 : conversation.user1;
    const unreadCount = conversation.getUnreadCount(userId);
    const isBlocked = conversation.isBlockedBy(userId);

    const dto = plainToInstance(OutputChatConversationDto, conversation, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });

    dto.otherUser = plainToInstance(OutputUserDto, otherUser, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
    dto.unreadCount = unreadCount;
    dto.isBlocked = isBlocked;

    return dto;
  }

  /**
   * 获取消息列表
   */
  async getMessages(
    userId: string,
    dto: QueryChatMessageDto,
  ): Promise<{
    data: OutputChatMessageDto[];
    meta: PaginationMetaDto;
  }> {
    let conversationId = dto.conversationId;

    // 如果提供了对方用户ID但没有会话ID，查找或创建会话
    if (!conversationId && dto.otherUserId) {
      const conversation = await this.conversationRepo.findOrCreateConversation(userId, dto.otherUserId);
      conversationId = conversation.id;
    }

    if (!conversationId) {
      throw new BadRequestException('必须提供会话ID或对方用户ID');
    }

    // 验证用户是会话的参与者
    const conversation = await this.conversationRepo.findByUserIdAndId(userId, conversationId);
    if (!conversation) {
      throw new NotFoundException('会话不存在');
    }

    const [messages, total] = await this.messageRepo.findMessagesWithPagination({
      conversationId,
      type: dto.type as any,
      unreadOnly: dto.unreadOnly,
      startDate: dto.startDate,
      endDate: dto.endDate,
      skip: dto.skip,
      take: dto.pageSize,
    });

    const listItems = plainToInstance(OutputChatMessageDto, messages, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });

    const meta = new PaginationMetaDto(dto.page, dto.pageSize);
    meta.total = total;

    return { data: listItems, meta };
  }

  /**
   * 标记会话为已读
   */
  async markConversationAsRead(userId: string, conversationId: string): Promise<void> {
    const conversation = await this.conversationRepo.findByUserIdAndId(userId, conversationId);
    if (!conversation) {
      throw new NotFoundException('会话不存在');
    }

    await this.dataSource.transaction(async manager => {
      // 标记消息为已读
      await this.messageRepo.markConversationAsRead(conversationId, userId);

      // 重置未读消息数
      await this.conversationRepo.resetUnreadCount(conversationId, userId);
    });

    this.logger.log(`会话已标记为已读: conversationId=${conversationId}, userId=${userId}`);
  }

  /**
   * 更新会话（屏蔽/取消屏蔽）
   */
  async updateConversation(
    userId: string,
    conversationId: string,
    dto: UpdateChatConversationDto,
  ): Promise<OutputChatConversationDto> {
    const conversation = await this.conversationRepo.findByUserIdAndId(userId, conversationId);
    if (!conversation) {
      throw new NotFoundException('会话不存在');
    }

    if (dto.blocked !== undefined) {
      await this.conversationRepo.updateBlockStatus(conversationId, userId, dto.blocked);
    }

    const updatedConversation = await this.conversationRepo.findByUserIdAndId(userId, conversationId);
    if (!updatedConversation) {
      throw new NotFoundException('会话不存在');
    }

    const otherUser = updatedConversation.userId1 === userId ? updatedConversation.user2 : updatedConversation.user1;
    const unreadCount = updatedConversation.getUnreadCount(userId);
    const isBlocked = updatedConversation.isBlockedBy(userId);

    const outputDto = plainToInstance(OutputChatConversationDto, updatedConversation, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });

    outputDto.otherUser = plainToInstance(OutputUserDto, otherUser, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
    outputDto.unreadCount = unreadCount;
    outputDto.isBlocked = isBlocked;

    return outputDto;
  }

  /**
   * 撤回消息
   */
  async recallMessage(userId: string, messageId: string): Promise<OutputChatMessageDto> {
    const message = await this.messageRepo.findById(messageId);

    // 只能撤回自己发送的消息
    if (message.senderId !== userId) {
      throw new BadRequestException('只能撤回自己发送的消息');
    }

    // 只能撤回2分钟内的消息
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    if (message.createdAt < twoMinutesAgo) {
      throw new BadRequestException('只能撤回2分钟内的消息');
    }

    await this.messageRepo.recallMessage(messageId, userId);

    const updatedMessage = await this.messageRepo.findById(messageId);

    this.logger.log(`消息已撤回: messageId=${messageId}, userId=${userId}`);

    return plainToInstance(OutputChatMessageDto, updatedMessage, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 获取未读消息总数
   */
  async getTotalUnreadCount(userId: string): Promise<number> {
    return this.conversationRepo.getTotalUnreadCount(userId);
  }

  /**
   * 验证消息内容
   */
  private validateMessageContent(dto: CreateChatMessageDto): void {
    if (dto.type === ChatMessageType.TEXT) {
      if (!dto.content || dto.content.trim().length === 0) {
        throw new BadRequestException('文本消息内容不能为空');
      }
    } else if (
      [ChatMessageType.IMAGE, ChatMessageType.VIDEO, ChatMessageType.AUDIO, ChatMessageType.FILE].includes(dto.type)
    ) {
      if (!dto.fileUrl) {
        throw new BadRequestException(`${dto.type}消息必须提供文件URL`);
      }
    }
  }

  /**
   * 获取消息预览文本
   */
  private getMessagePreview(message: ChatMessageEntity): string {
    switch (message.type) {
      case ChatMessageType.TEXT:
        return message.content || '';
      case ChatMessageType.IMAGE:
        return '[图片]';
      case ChatMessageType.VIDEO:
        return '[视频]';
      case ChatMessageType.AUDIO:
        return '[语音]';
      case ChatMessageType.FILE:
        return `[文件] ${message.fileName || '未知文件'}`;
      case ChatMessageType.SYSTEM:
        return message.content || '[系统消息]';
      default:
        return '[消息]';
    }
  }
}
