import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserFriendRepository } from '../repositories/user-friend.repository';
import { UserRepository } from '../repositories/user.repository';
import { UserFriendEntity } from '../entities/user-friend.entity';
import { CreateUserFriendDto, UpdateUserFriendDto, QueryUserFriendDto, OutputUserFriendDto } from '../dto';
import { FriendStatus } from '../enums';
import { plainToInstance } from 'class-transformer';

/**
 * 用户好友服务
 *
 * 提供好友关系的创建、管理、查询等业务逻辑
 */
@Injectable()
export class UserFriendService {
  private readonly logger = new Logger(UserFriendService.name);

  constructor(
    private readonly friendRepo: UserFriendRepository,
    private readonly userRepo: UserRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 发送好友请求
   */
  async sendFriendRequest(dto: CreateUserFriendDto, userId: string): Promise<UserFriendEntity> {
    // 不能添加自己为好友
    if (dto.friendId === userId) {
      throw new BadRequestException('不能添加自己为好友');
    }

    // 检查目标用户是否存在
    const friend = await this.userRepo.findById(dto.friendId);

    // 检查是否已经存在关系
    const existingRelation = await this.friendRepo.findByUsers(userId, dto.friendId);

    if (existingRelation) {
      if (existingRelation.status === FriendStatus.ACCEPTED) {
        throw new ConflictException('你们已经是好友了');
      }
      if (existingRelation.status === FriendStatus.PENDING) {
        throw new ConflictException('好友请求已发送，等待对方确认');
      }
      if (existingRelation.status === FriendStatus.BLOCKED) {
        throw new ForbiddenException('无法添加此用户为好友');
      }
    }

    return this.dataSource.transaction(async manager => {
      const friendRelation = new UserFriendEntity();
      friendRelation.userId = userId;
      friendRelation.friendId = dto.friendId;
      friendRelation.status = FriendStatus.PENDING;
      friendRelation.remark = dto.remark;
      friendRelation.appliedAt = new Date();

      const savedRelation = await manager.save(UserFriendEntity, friendRelation);

      this.logger.log(`好友请求已发送: userId=${userId}, friendId=${dto.friendId}`);

      return savedRelation;
    });
  }

  /**
   * 接受好友请求
   */
  async acceptFriendRequest(friendId: string, userId: string): Promise<UserFriendEntity> {
    // 查找待确认的好友请求（friendId -> userId）
    const relation = await this.friendRepo.findByFriendAndUser(userId, friendId);

    if (!relation) {
      throw new NotFoundException('未找到好友请求');
    }

    if (relation.status !== FriendStatus.PENDING) {
      throw new BadRequestException('该请求已被处理');
    }

    // 检查是否是发送给当前用户的请求
    if (relation.friendId !== userId) {
      throw new ForbiddenException('无权操作此请求');
    }

    return this.dataSource.transaction(async manager => {
      relation.status = FriendStatus.ACCEPTED;
      relation.acceptedAt = new Date();

      const savedRelation = await manager.save(UserFriendEntity, relation);

      this.logger.log(`好友请求已接受: userId=${userId}, friendId=${friendId}`);

      return savedRelation;
    });
  }

  /**
   * 拒绝好友请求（删除关系）
   */
  async rejectFriendRequest(friendId: string, userId: string): Promise<void> {
    const relation = await this.friendRepo.findByFriendAndUser(userId, friendId);

    if (!relation) {
      throw new NotFoundException('未找到好友请求');
    }

    if (relation.friendId !== userId) {
      throw new ForbiddenException('无权操作此请求');
    }

    await this.friendRepo.remove(relation);

    this.logger.log(`好友请求已拒绝: userId=${userId}, friendId=${friendId}`);
  }

  /**
   * 屏蔽用户
   */
  async blockUser(friendId: string, userId: string): Promise<UserFriendEntity> {
    if (friendId === userId) {
      throw new BadRequestException('不能屏蔽自己');
    }

    return this.dataSource.transaction(async manager => {
      let relation = await this.friendRepo.findByUsers(userId, friendId);

      if (relation) {
        relation.status = FriendStatus.BLOCKED;
      } else {
        relation = new UserFriendEntity();
        relation.userId = userId;
        relation.friendId = friendId;
        relation.status = FriendStatus.BLOCKED;
        relation.appliedAt = new Date();
      }

      const savedRelation = await manager.save(UserFriendEntity, relation);

      this.logger.log(`用户已屏蔽: userId=${userId}, friendId=${friendId}`);

      return savedRelation;
    });
  }

  /**
   * 取消屏蔽
   */
  async unblockUser(friendId: string, userId: string): Promise<void> {
    const relation = await this.friendRepo.findByUserAndFriend(userId, friendId);

    if (!relation || relation.status !== FriendStatus.BLOCKED) {
      throw new NotFoundException('未找到屏蔽关系');
    }

    if (relation.userId !== userId) {
      throw new ForbiddenException('无权操作');
    }

    await this.friendRepo.remove(relation);

    this.logger.log(`已取消屏蔽: userId=${userId}, friendId=${friendId}`);
  }

  /**
   * 删除好友（双向删除）
   */
  async deleteFriend(friendId: string, userId: string): Promise<void> {
    const relation = await this.friendRepo.findByUsers(userId, friendId);

    if (!relation) {
      throw new NotFoundException('好友关系不存在');
    }

    // 只能删除自己发起的或接收的好友关系
    if (relation.userId !== userId && relation.friendId !== userId) {
      throw new ForbiddenException('无权操作');
    }

    await this.friendRepo.remove(relation);

    this.logger.log(`好友已删除: userId=${userId}, friendId=${friendId}`);
  }

  /**
   * 更新好友备注
   */
  async updateRemark(friendId: string, remark: string, userId: string): Promise<UserFriendEntity | null> {
    let relation = await this.friendRepo.findByUsers(userId, friendId);

    if (!relation || relation.status !== FriendStatus.ACCEPTED) {
      throw new NotFoundException('好友关系不存在');
    }

    // 确保是当前用户的好友关系
    if (relation.userId !== userId && relation.friendId !== userId) {
      throw new ForbiddenException('无权操作');
    }

    // 如果关系是反向的（friendId -> userId），需要创建或更新正向关系
    if (relation.friendId === userId) {
      // 查找正向关系，如果没有则创建
      let forwardRelation = await this.friendRepo.findByUserAndFriend(userId, friendId);
      if (!forwardRelation) {
        forwardRelation = new UserFriendEntity();
        forwardRelation.userId = userId;
        forwardRelation.friendId = friendId;
        forwardRelation.status = FriendStatus.ACCEPTED;
        forwardRelation.acceptedAt = relation.acceptedAt;
      }
      forwardRelation.remark = remark;
      relation = forwardRelation;
    } else {
      relation.remark = remark;
    }

    const savedRelation = await this.dataSource.transaction(async manager => {
      const savedRelation = await manager.save(relation);

      this.logger.log(`好友备注已更新: userId=${userId}, friendId=${friendId}`);

      return savedRelation;
    });
    return savedRelation;
  }

  /**
   * 获取好友列表
   */
  async getFriendList(userId: string, dto: QueryUserFriendDto): Promise<{ data: OutputUserFriendDto[]; meta: any }> {
    const status = dto.status || FriendStatus.ACCEPTED;

    const relations = await this.friendRepo.findAllByUserId(userId, status);

    // 过滤和转换数据
    let filteredRelations = relations;

    // 关键字搜索
    if (dto.keyword) {
      filteredRelations = relations.filter(relation => {
        const friend = relation.userId === userId ? relation.friend : relation.user;
        const remark = relation.remark || '';
        return friend?.username?.includes(dto.keyword!) || remark.includes(dto.keyword!);
      });
    }

    // 分页
    const total = filteredRelations.length;
    const paginatedRelations = filteredRelations.slice(dto.page * dto.pageSize, (dto.page + 1) * dto.pageSize);

    // 加载关联的用户信息
    const relationsWithUsers = await Promise.all(
      paginatedRelations.map(async relation => {
        if (relation.userId === userId && !relation.friend) {
          relation.friend = await this.userRepo.findById(relation.friendId);
        } else if (relation.friendId === userId && !relation.user) {
          relation.user = await this.userRepo.findById(relation.userId);
        }
        return relation;
      }),
    );

    const listItems = plainToInstance(OutputUserFriendDto, relationsWithUsers, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });

    return {
      data: listItems,
      meta: {
        total,
        page: dto.page,
        pageSize: dto.pageSize,
      },
    };
  }

  /**
   * 获取待处理的好友请求列表
   */
  async getPendingRequests(
    userId: string,
    dto: QueryUserFriendDto,
  ): Promise<{ data: OutputUserFriendDto[]; meta: any }> {
    const relations = await this.friendRepo.findPendingRequestsByFriendId(userId);

    // 分页
    const total = relations.length;
    const paginatedRelations = relations.slice(dto.page * dto.pageSize, (dto.page + 1) * dto.pageSize);

    const listItems = plainToInstance(OutputUserFriendDto, paginatedRelations, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });

    return {
      data: listItems,
      meta: {
        total,
        page: dto.page,
        pageSize: dto.pageSize,
      },
    };
  }

  /**
   * 获取好友关系详情
   */
  async getFriendRelation(friendId: string, userId: string): Promise<OutputUserFriendDto | null> {
    const relation = await this.friendRepo.findByUsers(userId, friendId);

    if (!relation) {
      return null;
    }

    // 加载关联的用户信息
    if (relation.userId === userId && !relation.friend) {
      relation.friend = await this.userRepo.findById(relation.friendId);
    } else if (relation.friendId === userId && !relation.user) {
      relation.user = await this.userRepo.findById(relation.userId);
    }

    return plainToInstance(OutputUserFriendDto, relation, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }
}
