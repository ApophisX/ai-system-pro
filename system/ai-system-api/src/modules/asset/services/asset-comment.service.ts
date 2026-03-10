import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AssetCommentRepository } from '../repositories/asset-comment.repository';
import { AssetCommentEntity } from '../entities/asset-comment.entity';
import { CreateAssetCommentDto, QueryAssetCommentDto, OutputAssetCommentDto, UpdateAssetCommentDto } from '../dto';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';
import { plainToInstance } from 'class-transformer';
import { AssetRepository } from '../repositories';

/**
 * 资产留言服务
 *
 * 提供留言的业务逻辑
 */
@Injectable()
export class AssetCommentService {
  private readonly logger = new Logger(AssetCommentService.name);

  constructor(
    private readonly commentRepo: AssetCommentRepository,
    private readonly assetRepo: AssetRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 创建留言
   */
  async create(userId: string, dto: CreateAssetCommentDto): Promise<OutputAssetCommentDto> {
    // 验证资产是否存在
    const asset = await this.assetRepo.findOne({
      where: { id: dto.assetId },
    });
    if (!asset) {
      throw new NotFoundException('资产不存在');
    }

    // 如果是回复，验证父留言是否存在
    let parentComment: AssetCommentEntity | null = null;
    if (dto.parentId) {
      parentComment = await this.commentRepo.findOne({
        where: { id: dto.parentId },
        relations: ['user'],
      });
      if (!parentComment) {
        throw new NotFoundException('父留言不存在');
      }
      // 确保父留言属于同一个资产
      if (parentComment.assetId !== dto.assetId) {
        throw new BadRequestException('父留言不属于该资产');
      }
    }

    // 创建留言
    const comment = await this.dataSource.transaction(async manager => {
      const newComment = manager.create(AssetCommentEntity, {
        assetId: dto.assetId,
        userId,
        content: dto.content,
        parentId: dto.parentId || null,
        replyToUserId: dto.replyToUserId || parentComment?.userId || null,
      });

      return manager.save(AssetCommentEntity, newComment);
    });

    this.logger.log(`留言已创建: commentId=${comment.id}, assetId=${dto.assetId}, userId=${userId}`);

    // 加载关联数据
    const commentWithRelations = await this.commentRepo.findById(comment.id);

    return plainToInstance(OutputAssetCommentDto, commentWithRelations, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 获取留言详情
   */
  async getById(id: string): Promise<OutputAssetCommentDto> {
    const comment = await this.commentRepo.findById(id);

    return plainToInstance(OutputAssetCommentDto, comment, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 获取留言列表
   */
  async getList(dto: QueryAssetCommentDto): Promise<{ data: OutputAssetCommentDto[]; meta: PaginationMetaDto }> {
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    let comments: AssetCommentEntity[];
    let total: number;

    // 如果查询的是留言树（顶级留言+回复），使用特殊查询
    if (dto.assetId && !dto.parentId && !dto.topLevelOnly) {
      [comments, total] = await this.commentRepo.findCommentTree(dto.assetId, skip, take);
    } else {
      // 普通分页查询
      [comments, total] = await this.commentRepo.findCommentsWithPagination({
        assetId: dto.assetId,
        userId: dto.userId,
        parentId: dto.parentId !== undefined ? dto.parentId : null,
        topLevelOnly: dto.topLevelOnly,
        skip,
        take,
      });
    }

    const listItems = plainToInstance(OutputAssetCommentDto, comments, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });

    const meta = new PaginationMetaDto(page, pageSize);
    meta.total = total;

    return { data: listItems, meta };
  }

  /**
   * 更新留言
   */
  async update(userId: string, id: string, dto: UpdateAssetCommentDto): Promise<OutputAssetCommentDto> {
    const comment = await this.commentRepo.findByUserIdAndId(userId, id);
    if (!comment) {
      throw new NotFoundException('留言不存在');
    }

    // 只能更新自己的留言
    if (comment.userId !== userId) {
      throw new ForbiddenException('无权修改此留言');
    }

    // 更新内容
    if (dto.content) {
      comment.content = dto.content;
      await this.commentRepo.save(comment);
    }

    this.logger.log(`留言已更新: commentId=${id}, userId=${userId}`);

    const updatedComment = await this.commentRepo.findById(id);

    return plainToInstance(OutputAssetCommentDto, updatedComment, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 删除留言
   */
  async delete(userId: string, id: string): Promise<void> {
    const comment = await this.commentRepo.findById(id);
    if (!comment) {
      throw new NotFoundException('留言不存在');
    }

    // 只能删除自己的留言，或者资产所有者可以删除自己资产下的留言
    const asset = await this.assetRepo.findOne({
      where: { id: comment.assetId },
    });

    if (!asset) {
      throw new NotFoundException('资产不存在');
    }

    if (comment.userId !== userId && asset.ownerId !== userId) {
      throw new ForbiddenException('无权删除此留言');
    }

    // 软删除
    await this.commentRepo.softDelete(id);

    this.logger.log(`留言已删除: commentId=${id}, userId=${userId}`);
  }

  /**
   * 获取资产的留言数量
   */
  async getCommentCountByAssetId(assetId: string): Promise<number> {
    return this.commentRepo.countByAssetId(assetId);
  }

  /**
   * 获取用户的留言数量
   */
  async getCommentCountByUserId(userId: string): Promise<number> {
    return this.commentRepo.countByUserId(userId);
  }
}
