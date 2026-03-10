import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, In, QueryDeepPartialEntity } from 'typeorm';
import { MessageRepository } from '../repositories';
import { MessageEntity } from '../entities';
import {
  CreateMessageDto,
  QueryMessageDto,
  OutputMessageDto,
  UpdateMessageDto,
  BatchUpdateMessageDto,
  OutputUnreadCountByTypeDto,
} from '../dto';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';
import { plainToInstance } from 'class-transformer';
import { MessageStatus } from '../enums/message-status.enum';
import { MessageType } from '../enums/message-type.enum';

/**
 * 消息服务
 *
 * 提供消息的业务逻辑
 */
@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly messageRepo: MessageRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 创建消息
   */
  async create(dto: CreateMessageDto): Promise<OutputMessageDto> {
    const message = await this.dataSource.transaction(async manager => {
      const newMessage = manager.create(MessageEntity, {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        content: dto.content,
        relatedId: dto.relatedId,
        relatedType: dto.relatedType,
        extra: dto.extra,
        status: MessageStatus.UNREAD,
      });

      return manager.save(MessageEntity, newMessage);
    });

    this.logger.log(`消息已创建: messageId=${message.id}, userId=${dto.userId}, type=${dto.type}`);

    return plainToInstance(OutputMessageDto, message, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 批量创建消息
   */
  async batchCreate(userIds: string[], dto: Omit<CreateMessageDto, 'userId'>): Promise<OutputMessageDto[]> {
    if (userIds.length === 0) {
      return [];
    }

    const messages = await this.dataSource.transaction(async manager => {
      const newMessages = userIds.map(userId =>
        manager.create(MessageEntity, {
          userId,
          type: dto.type,
          title: dto.title,
          content: dto.content,
          relatedId: dto.relatedId,
          relatedType: dto.relatedType,
          extra: dto.extra,
          status: MessageStatus.UNREAD,
        }),
      );

      return manager.save(MessageEntity, newMessages);
    });

    this.logger.log(`批量消息已创建: count=${messages.length}, type=${dto.type}`);

    return plainToInstance(OutputMessageDto, messages, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 获取消息详情
   */
  async getById(userId: string, id: string): Promise<OutputMessageDto> {
    const message = await this.messageRepo.findByUserIdAndId(userId, id);
    if (!message) {
      throw new NotFoundException('消息不存在');
    }

    // 如果是未读消息，自动标记为已读
    if (message.status === MessageStatus.UNREAD) {
      await this.messageRepo.update(
        { id: message.id },
        {
          status: MessageStatus.READ,
          readAt: new Date(),
        },
      );
      message.status = MessageStatus.READ;
      message.readAt = new Date();
    }

    return plainToInstance(OutputMessageDto, message, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 获取消息列表
   */
  async getList(userId: string, dto: QueryMessageDto): Promise<{ data: OutputMessageDto[]; meta: PaginationMetaDto }> {
    const meta = new PaginationMetaDto(dto.page, dto.pageSize);

    const [messages, total] = await this.messageRepo.findUserMessagesWithPagination({
      userId,
      type: dto.type === MessageType.SYSTEM ? In([MessageType.SYSTEM, MessageType.VERIFICATION]) : dto.type,
      status: dto.status,
      keyword: dto.keyword,
      startDate: dto.startDate,
      endDate: dto.endDate,
      skip: meta.skip,
      take: meta.pageSize,
    });

    const listItems = plainToInstance(OutputMessageDto, messages, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });

    meta.total = total;

    return { data: listItems, meta };
  }

  /**
   * 更新消息
   */
  async update(userId: string, id: string, dto: UpdateMessageDto): Promise<OutputMessageDto> {
    const message = await this.messageRepo.findByUserIdAndId(userId, id);
    if (!message) {
      throw new NotFoundException('消息不存在');
    }

    const updateData: QueryDeepPartialEntity<MessageEntity> = {};
    if (dto.status) {
      updateData.status = dto.status;
      if (dto.status === MessageStatus.READ && !message.readAt) {
        updateData.readAt = new Date();
      }
    }

    await this.messageRepo.update({ id }, updateData);

    const updatedMessage = await this.messageRepo.findByUserIdAndId(userId, id);
    if (!updatedMessage) {
      throw new NotFoundException('消息不存在');
    }

    this.logger.log(`消息已更新: messageId=${id}, userId=${userId}`);

    return plainToInstance(OutputMessageDto, updatedMessage, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 批量更新消息
   */
  async batchUpdate(userId: string, dto: BatchUpdateMessageDto): Promise<void> {
    if (dto.messageIds.length === 0) {
      return;
    }

    const status = dto.status || MessageStatus.READ;
    await this.messageRepo.batchUpdateStatus(userId, dto.messageIds, status);

    this.logger.log(`批量消息已更新: userId=${userId}, count=${dto.messageIds.length}, status=${status}`);
  }

  /**
   * 标记所有消息为已读
   */
  async markAllAsRead(userId: string, type?: MessageType): Promise<void> {
    await this.messageRepo.markAllAsRead(userId, type);

    this.logger.log(`所有消息已标记为已读: userId=${userId}, type=${type || 'ALL'}`);
  }

  /**
   * 删除消息
   */
  async delete(userId: string, id: string): Promise<void> {
    await this.messageRepo.deleteMessage(userId, id);

    this.logger.log(`消息已删除: messageId=${id}, userId=${userId}`);
  }

  /**
   * 批量删除消息
   */
  async batchDelete(userId: string, messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) {
      return;
    }

    await this.messageRepo.batchDeleteMessages(userId, messageIds);

    this.logger.log(`批量消息已删除: userId=${userId}, count=${messageIds.length}`);
  }

  /**
   * 获取未读消息数量
   */
  async getUnreadCount(userId: string, type?: MessageType): Promise<number> {
    if (type) {
      return this.messageRepo.countUnreadByUserIdAndType(userId, type);
    }
    return this.messageRepo.countUnreadByUserId(userId);
  }

  /**
   * 获取各类型未读消息数量统计
   */
  async getUnreadCountByType(userId: string): Promise<OutputUnreadCountByTypeDto> {
    // const types = Object.values(MessageType);
    // const counts: Record<MessageType, number> = {} as Record<MessageType, number>;

    // await Promise.all(
    //   types.map(async type => {
    //     counts[type] = await this.messageRepo.countUnreadByUserIdAndType(userId, type);
    //   }),
    // );

    const [systemCount, orderCount] = await Promise.all([
      this.messageRepo.countBy({
        userId,
        type: In([MessageType.SYSTEM, MessageType.VERIFICATION]),
        status: MessageStatus.UNREAD,
      }),
      this.messageRepo.countBy({
        userId,
        type: MessageType.ORDER,
        status: MessageStatus.UNREAD,
      }),
    ]);

    return {
      system: systemCount,
      order: orderCount,
    };
  }
}
