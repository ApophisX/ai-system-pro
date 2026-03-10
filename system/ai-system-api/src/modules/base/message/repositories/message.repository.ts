import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DataSource, In, FindOperator } from 'typeorm';
import { MessageEntity } from '../entities/message.entity';
import { MessageType } from '../enums/message-type.enum';
import { MessageStatus } from '../enums/message-status.enum';

/**
 * 消息查询参数
 */
export interface MessageQueryOptions {
  userId: string;
  type?: MessageType | FindOperator<MessageType>;
  status?: MessageStatus;
  keyword?: string;
  startDate?: Date;
  endDate?: Date;
  skip: number;
  take: number;
}

/**
 * 消息仓储
 *
 * 负责消息的数据访问操作
 */
@Injectable()
export class MessageRepository extends Repository<MessageEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(MessageEntity, dataSource.createEntityManager());
  }

  /**
   * 根据 ID 查找消息
   */
  async findById(id: string): Promise<MessageEntity> {
    const message = await this.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!message) {
      throw new NotFoundException('消息不存在');
    }
    return message;
  }

  /**
   * 根据用户 ID 和消息 ID 查找消息
   */
  async findByUserIdAndId(userId: string, id: string): Promise<MessageEntity | null> {
    return this.findOne({
      where: { userId, id },
      relations: ['user'],
    });
  }

  /**
   * 分页查询用户的消息列表
   */
  async findUserMessagesWithPagination(options: MessageQueryOptions): Promise<[MessageEntity[], number]> {
    const queryBuilder = this.createQueryBuilder('message');

    queryBuilder.leftJoinAndSelect('message.user', 'user');

    // 必须属于当前用户
    queryBuilder.andWhere('message.userId = :userId', {
      userId: options.userId,
    });

    // 消息类型过滤
    if (options.type) {
      queryBuilder.andWhere('message.type = :type', {
        type: options.type,
      });
    }

    // 消息状态过滤
    if (options.status) {
      queryBuilder.andWhere('message.status = :status', {
        status: options.status,
      });
    }

    // 关键字搜索（搜索标题、内容）
    if (options.keyword) {
      queryBuilder.andWhere('(message.title LIKE :keyword OR message.content LIKE :keyword)', {
        keyword: `%${options.keyword}%`,
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

    // 排除已删除的消息
    queryBuilder.andWhere('message.status != :deletedStatus', {
      deletedStatus: MessageStatus.DELETED,
    });

    // 按创建时间倒序
    queryBuilder.orderBy('message.createdAt', 'DESC');

    queryBuilder.skip(options.skip);
    queryBuilder.take(options.take);

    return queryBuilder.getManyAndCount();
  }

  /**
   * 获取用户的未读消息数量
   */
  async countUnreadByUserId(userId: string): Promise<number> {
    return this.count({
      where: {
        userId,
        status: MessageStatus.UNREAD,
      },
    });
  }

  /**
   * 按类型获取用户的未读消息数量
   */
  async countUnreadByUserIdAndType(userId: string, type: MessageType): Promise<number> {
    return this.count({
      where: {
        userId,
        type: type || undefined,
        status: MessageStatus.UNREAD,
      },
    });
  }

  /**
   * 获取用户的消息总数
   */
  async countByUserId(userId: string): Promise<number> {
    return this.count({
      where: {
        userId,
      },
    });
  }

  /**
   * 批量更新消息状态
   */
  async batchUpdateStatus(userId: string, messageIds: string[], status: MessageStatus): Promise<void> {
    if (messageIds.length === 0) {
      return;
    }

    await this.update(
      {
        id: In(messageIds),
        userId, // 确保只能更新自己的消息
      },
      {
        status,
        readAt: status === MessageStatus.READ ? new Date() : null,
      },
    );
  }

  /**
   * 标记用户的所有未读消息为已读
   */
  async markAllAsRead(userId: string, type?: MessageType): Promise<void> {
    const where: any = {
      userId,
      status: MessageStatus.UNREAD,
    };

    if (type) {
      where.type = type;
    }

    await this.update(where, {
      status: MessageStatus.READ,
      readAt: new Date(),
    });
  }

  /**
   * 删除消息（软删除）
   */
  async deleteMessage(userId: string, messageId: string): Promise<void> {
    const result = await this.update(
      {
        id: messageId,
        userId, // 确保只能删除自己的消息
      },
      {
        status: MessageStatus.DELETED,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException('消息不存在');
    }
  }

  /**
   * 批量删除消息（软删除）
   */
  async batchDeleteMessages(userId: string, messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) {
      return;
    }

    await this.update(
      {
        id: In(messageIds),
        userId, // 确保只能删除自己的消息
      },
      {
        status: MessageStatus.DELETED,
      },
    );
  }
}
