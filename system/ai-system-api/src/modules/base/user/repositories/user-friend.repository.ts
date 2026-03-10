import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository, FindOneOptions } from 'typeorm';
import { UserFriendEntity } from '../entities/user-friend.entity';
import { FriendStatus } from '../enums';

/**
 * 用户好友关系仓储
 *
 * 负责好友关系的数据访问操作
 */
@Injectable()
export class UserFriendRepository extends Repository<UserFriendEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(UserFriendEntity, dataSource.createEntityManager());
  }

  /**
   * 根据 ID 查找好友关系
   */
  async findById(id: string, options?: FindOneOptions<UserFriendEntity>) {
    const relation = await this.findOne({
      ...options,
      where: { ...options?.where, id },
    });
    if (!relation) {
      throw new NotFoundException('好友关系不存在');
    }
    return relation;
  }

  /**
   * 查找两个用户之间的好友关系（双向查询）
   */
  async findByUsers(userId: string, friendId: string): Promise<UserFriendEntity | null> {
    return this.findOne({
      where: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    });
  }

  /**
   * 查找用户发送的好友请求（userId -> friendId）
   */
  async findByUserAndFriend(userId: string, friendId: string): Promise<UserFriendEntity | null> {
    return this.findOne({
      where: { userId, friendId },
      relations: ['friend'],
    });
  }

  /**
   * 查找用户接收的好友请求（friendId -> userId）
   */
  async findByFriendAndUser(userId: string, friendId: string): Promise<UserFriendEntity | null> {
    return this.findOne({
      where: { userId: friendId, friendId: userId },
      relations: ['user'],
    });
  }

  /**
   * 查找用户的所有好友关系（作为发起方）
   */
  async findByUserId(userId: string): Promise<UserFriendEntity[]> {
    return this.find({
      where: { userId },
      relations: ['friend'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 查找用户的所有好友关系（作为接收方，需要反向查询）
   */
  async findByFriendId(friendId: string): Promise<UserFriendEntity[]> {
    return this.find({
      where: { friendId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 查找用户的所有好友关系（双向，包括作为发起方和接收方）
   */
  async findAllByUserId(userId: string, status?: FriendStatus): Promise<UserFriendEntity[]> {
    const queryBuilder = this.createQueryBuilder('uf');
    queryBuilder
      .leftJoinAndSelect('uf.friend', 'friend')
      .leftJoinAndSelect('uf.user', 'user')
      .where('(uf.userId = :userId OR uf.friendId = :userId)', { userId });

    if (status) {
      queryBuilder.andWhere('uf.status = :status', { status });
    }

    queryBuilder.orderBy('uf.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  /**
   * 查找用户的好友请求列表（待确认的请求，作为接收方）
   */
  async findPendingRequestsByFriendId(friendId: string): Promise<UserFriendEntity[]> {
    return this.find({
      where: { friendId, status: FriendStatus.PENDING },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 查找用户已接受的好友列表
   */
  async findAcceptedFriendsByUserId(userId: string): Promise<UserFriendEntity[]> {
    return this.findAllByUserId(userId, FriendStatus.ACCEPTED);
  }

  /**
   * 检查两个用户是否已经是好友
   */
  async isFriend(userId: string, friendId: string): Promise<boolean> {
    const relation = await this.findByUsers(userId, friendId);
    return relation !== null && relation.status === FriendStatus.ACCEPTED;
  }

  /**
   * 检查是否存在好友请求（待确认状态）
   */
  async hasPendingRequest(userId: string, friendId: string): Promise<boolean> {
    const relation = await this.findByUsers(userId, friendId);
    return relation !== null && relation.status === FriendStatus.PENDING;
  }

  /**
   * 检查用户是否被屏蔽
   */
  async isBlocked(userId: string, friendId: string): Promise<boolean> {
    const relation = await this.findByUsers(userId, friendId);
    return relation !== null && relation.status === FriendStatus.BLOCKED;
  }

  /**
   * 删除好友关系（软删除）
   */
  async deleteRelation(userId: string, friendId: string): Promise<void> {
    const relation = await this.findByUsers(userId, friendId);
    if (relation) {
      await this.remove(relation);
    }
  }
}
