import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { AssetCommentEntity } from '../entities/asset-comment.entity';

/**
 * 留言查询参数
 */
export interface AssetCommentQueryOptions {
  assetId?: string;
  userId?: string;
  parentId?: string | null;
  topLevelOnly?: boolean;
  skip: number;
  take: number;
}

/**
 * 资产留言仓储
 *
 * 负责留言的数据访问操作
 */
@Injectable()
export class AssetCommentRepository extends Repository<AssetCommentEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(AssetCommentEntity, dataSource.createEntityManager());
  }

  /**
   * 根据 ID 查找留言
   */
  async findById(id: string): Promise<AssetCommentEntity> {
    const comment = await this.findOne({
      where: { id },
      relations: ['user', 'replyToUser', 'asset'],
    });
    if (!comment) {
      throw new NotFoundException('留言不存在');
    }
    return comment;
  }

  /**
   * 根据用户 ID 和留言 ID 查找留言
   */
  async findByUserIdAndId(userId: string, id: string): Promise<AssetCommentEntity | null> {
    return this.findOne({
      where: { userId, id },
      relations: ['user', 'replyToUser', 'asset'],
    });
  }

  /**
   * 分页查询留言列表
   */
  async findCommentsWithPagination(options: AssetCommentQueryOptions): Promise<[AssetCommentEntity[], number]> {
    const queryBuilder = this.createQueryBuilder('comment');

    // 关联用户信息
    queryBuilder.leftJoinAndSelect('comment.user', 'user');
    queryBuilder.leftJoinAndSelect('comment.replyToUser', 'replyToUser');

    // 资产ID过滤
    if (options.assetId) {
      queryBuilder.andWhere('comment.assetId = :assetId', {
        assetId: options.assetId,
      });
    }

    // 用户ID过滤
    if (options.userId) {
      queryBuilder.andWhere('comment.userId = :userId', {
        userId: options.userId,
      });
    }

    // 父留言ID过滤
    if (options.parentId !== undefined) {
      if (options.parentId === null) {
        // 查询顶级留言（parentId 为 null）
        queryBuilder.andWhere('comment.parentId IS NULL');
      } else {
        // 查询指定父留言的回复
        queryBuilder.andWhere('comment.parentId = :parentId', {
          parentId: options.parentId,
        });
      }
    } else if (options.topLevelOnly) {
      // 只查询顶级留言
      queryBuilder.andWhere('comment.parentId IS NULL');
    }

    // 排除已删除的留言
    queryBuilder.andWhere('comment.deletedAt IS NULL');

    // 按创建时间倒序
    queryBuilder.orderBy('comment.createdAt', 'DESC');

    queryBuilder.skip(options.skip);
    queryBuilder.take(options.take);

    return queryBuilder.getManyAndCount();
  }

  /**
   * 查询留言树（包含回复）
   */
  async findCommentTree(assetId: string, skip: number, take: number): Promise<[AssetCommentEntity[], number]> {
    // 先查询顶级留言
    const [topLevelComments, total] = await this.findCommentsWithPagination({
      assetId,
      parentId: null,
      topLevelOnly: true,
      skip,
      take,
    });

    // 为每个顶级留言加载回复
    if (topLevelComments.length > 0) {
      const topLevelIds = topLevelComments.map(c => c.id);
      const queryBuilder = this.createQueryBuilder('comment');
      queryBuilder
        .leftJoinAndSelect('comment.user', 'user')
        .leftJoinAndSelect('comment.replyToUser', 'replyToUser')
        .where('comment.parentId IN (:...ids)', { ids: topLevelIds })
        .andWhere('comment.deletedAt IS NULL')
        .orderBy('comment.createdAt', 'ASC');

      const replies = await queryBuilder.getMany();

      // 将回复挂载到对应的父留言下
      const replyMap = new Map<string, AssetCommentEntity[]>();
      replies.forEach(reply => {
        if (reply.parentId) {
          if (!replyMap.has(reply.parentId)) {
            replyMap.set(reply.parentId, []);
          }
          replyMap.get(reply.parentId)!.push(reply);
        }
      });

      topLevelComments.forEach(comment => {
        comment.replies = replyMap.get(comment.id) || [];
      });
    }

    return [topLevelComments, total];
  }

  /**
   * 查询指定留言的所有回复
   */
  async findRepliesByParentId(parentId: string): Promise<AssetCommentEntity[]> {
    return this.find({
      where: { parentId },
      relations: ['user', 'replyToUser'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * 统计资产的留言数量（不包含已删除）
   */
  async countByAssetId(assetId: string): Promise<number> {
    return this.createQueryBuilder('comment')
      .where('comment.assetId = :assetId', { assetId })
      .andWhere('comment.deletedAt IS NULL')
      .getCount();
  }

  /**
   * 统计用户的留言数量（不包含已删除）
   */
  async countByUserId(userId: string): Promise<number> {
    return this.createQueryBuilder('comment')
      .where('comment.userId = :userId', { userId })
      .andWhere('comment.deletedAt IS NULL')
      .getCount();
  }
}
