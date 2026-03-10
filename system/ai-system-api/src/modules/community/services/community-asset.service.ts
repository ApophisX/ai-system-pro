import { Injectable, Logger, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CommunityRepository, CommunityMemberRepository, AssetCommunityRepository } from '../repositories';
import { CommunityEntity, AssetCommunityEntity } from '../entities';
import { CommunityStatus, CommunityMemberRole } from '../enums';
import { BindAssetDto, QueryCommunityAssetDto } from '../dto';
import { AssetService } from '@/modules/asset/services';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';
import { OutputAssetListItemDto } from '@/modules/asset/dto';

export interface BindAssetResult {
  status: 'bound' | 'failed';
  message?: string;
}

/**
 * 社区资产服务
 */
@Injectable()
export class CommunityAssetService {
  private readonly logger = new Logger(CommunityAssetService.name);

  constructor(
    private readonly communityRepo: CommunityRepository,
    private readonly memberRepo: CommunityMemberRepository,
    private readonly assetCommunityRepo: AssetCommunityRepository,
    private readonly assetService: AssetService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 社区内资产列表（需已加入）
   */
  async getCommunityAssets(
    communityId: string,
    userId: string,
    dto: QueryCommunityAssetDto,
  ): Promise<{ data: OutputAssetListItemDto[]; meta: PaginationMetaDto }> {
    const isMember = await this.memberRepo.isMember(communityId, userId);
    if (!isMember) {
      throw new ForbiddenException({ message: '请先加入社区', bizCode: 'COMMUNITY_MEMBER_REQUIRED' });
    }

    const community = await this.communityRepo.findByIdOrNull(communityId);
    if (!community || community.status !== CommunityStatus.APPROVED) {
      throw new NotFoundException('社区不存在或未开放');
    }

    const page = dto.page ?? 0;
    const pageSize = dto.pageSize ?? 20;
    const [assetIds, total] = await this.assetCommunityRepo.findAssetIdsByCommunityWithPagination(communityId, {
      assetType: dto.assetType,
      categoryCode: dto.categoryCode,
      keyword: dto.keyword,
      sortBy: dto.sortBy ?? 'createdAt',
      order: dto.order ?? 'desc',
      skip: page * pageSize,
      take: pageSize,
    });

    return this.assetService.getAssetsByIdsForCommunity(assetIds, total, page, pageSize, userId);
  }

  /**
   * 绑定资产到社区
   *
   * 权限：资产所有者 或 社区 creator/admin
   */
  async bindAsset(communityId: string, userId: string, dto: BindAssetDto): Promise<void> {
    const community = await this.communityRepo.findByIdOrNull(communityId);
    if (!community) {
      throw new NotFoundException({ message: '社区不存在', bizCode: 'COMMUNITY_NOT_FOUND' });
    }
    if (community.status !== CommunityStatus.APPROVED) {
      throw new ForbiddenException({ message: '社区未审核通过', bizCode: 'COMMUNITY_NOT_APPROVED' });
    }

    const assetExists = await this.assetService.existsAsset(dto.assetId);
    if (!assetExists) {
      throw new NotFoundException('资产不存在');
    }

    await this.checkBindPermission(communityId, userId, dto.assetId);

    const alreadyBound = await this.assetCommunityRepo.isBound(dto.assetId, communityId);
    if (alreadyBound) {
      throw new ConflictException({ message: '资产已绑定该社区', bizCode: 'COMMUNITY_ASSET_ALREADY_BOUND' });
    }

    await this.dataSource.transaction(async manager => {
      const assetCommunityRepo = manager.getRepository(AssetCommunityEntity);
      const existing = await assetCommunityRepo.findOne({
        where: { assetId: dto.assetId, communityId },
        withDeleted: true,
      });

      let changed = false;
      if (existing) {
        if (existing.deletedAt) {
          existing.deletedAt = undefined;
          existing.sortOrder = dto.sortOrder ?? 0;
          await assetCommunityRepo.save(existing);
          changed = true;
        }
      } else {
        const relation = assetCommunityRepo.create({
          assetId: dto.assetId,
          communityId,
          sortOrder: dto.sortOrder ?? 0,
        });
        await assetCommunityRepo.save(relation);
        changed = true;
      }

      if (changed) {
        await manager
          .createQueryBuilder()
          .update(CommunityEntity)
          .set({ assetCount: () => 'asset_count + 1' })
          .where('id = :id', { id: communityId })
          .execute();
      }
    });

    this.logger.log(`资产绑定社区: assetId=${dto.assetId}, communityId=${communityId}`);
  }

  /**
   * 解绑资产
   */
  async unbindAsset(communityId: string, assetId: string, userId: string): Promise<void> {
    const community = await this.communityRepo.findByIdOrNull(communityId);
    if (!community) {
      throw new NotFoundException({ message: '社区不存在', bizCode: 'COMMUNITY_NOT_FOUND' });
    }

    await this.checkBindPermission(communityId, userId, assetId);

    const bound = await this.assetCommunityRepo.isBound(assetId, communityId);
    if (!bound) {
      throw new NotFoundException('资产未绑定该社区');
    }

    await this.dataSource.transaction(async manager => {
      const deleteResult = await manager
        .createQueryBuilder()
        .softDelete()
        .from(AssetCommunityEntity)
        .where('asset_id = :assetId', { assetId })
        .andWhere('community_id = :communityId', { communityId })
        .andWhere('deleted_at IS NULL')
        .execute();

      if ((deleteResult.affected ?? 0) > 0) {
        await manager
          .createQueryBuilder()
          .update(CommunityEntity)
          .set({ assetCount: () => 'GREATEST(0, asset_count - 1)' })
          .where('id = :id', { id: communityId })
          .execute();
      }
    });

    this.logger.log(`资产解绑社区: assetId=${assetId}, communityId=${communityId}`);
  }

  /**
   * 处理资产创建事件：绑定到社区（供 Asset 模块 emitAsync 调用）
   *
   * 校验：用户已加入社区、社区 status=approved
   */
  async handleAssetCreated(payload: {
    assetId: string;
    communityId: string;
    userId: string;
  }): Promise<BindAssetResult> {
    try {
      const community = await this.communityRepo.findByIdOrNull(payload.communityId);
      if (!community || community.status !== CommunityStatus.APPROVED) {
        return { status: 'failed', message: '社区不存在或未审核通过' };
      }

      const isMember = await this.memberRepo.isMember(payload.communityId, payload.userId);
      if (!isMember) {
        return { status: 'failed', message: '用户未加入该社区' };
      }

      const alreadyBound = await this.assetCommunityRepo.isBound(payload.assetId, payload.communityId);
      if (alreadyBound) {
        return { status: 'bound' };
      }

      await this.dataSource.transaction(async manager => {
        const assetCommunityRepo = manager.getRepository(AssetCommunityEntity);
        const existing = await assetCommunityRepo.findOne({
          where: { assetId: payload.assetId, communityId: payload.communityId },
          withDeleted: true,
        });

        let changed = false;
        if (existing) {
          if (existing.deletedAt) {
            existing.deletedAt = undefined;
            existing.sortOrder = 0;
            await assetCommunityRepo.save(existing);
            changed = true;
          }
        } else {
          const relation = assetCommunityRepo.create({
            assetId: payload.assetId,
            communityId: payload.communityId,
            sortOrder: 0,
          });
          await assetCommunityRepo.save(relation);
          changed = true;
        }

        if (changed) {
          await manager
            .createQueryBuilder()
            .update(CommunityEntity)
            .set({ assetCount: () => 'asset_count + 1' })
            .where('id = :id', { id: payload.communityId })
            .execute();
        }
      });

      this.logger.log(`资产创建自动绑定社区: assetId=${payload.assetId}, communityId=${payload.communityId}`);
      return { status: 'bound' };
    } catch (err) {
      this.logger.error(`资产绑定社区失败: ${payload.assetId}`, err instanceof Error ? err.stack : err);
      return { status: 'failed', message: err instanceof Error ? err.message : '绑定失败' };
    }
  }

  private async checkBindPermission(communityId: string, userId: string, assetId: string): Promise<void> {
    const role = await this.memberRepo.getMemberRole(communityId, userId);
    const isCreatorOrAdmin = role === CommunityMemberRole.CREATOR || role === CommunityMemberRole.ADMIN;
    const isAssetOwner = await this.assetService.isAssetOwnedBy(assetId, userId);

    if (!isCreatorOrAdmin && !isAssetOwner) {
      throw new ForbiddenException({ message: '无权限绑定资产到该社区', bizCode: 'COMMUNITY_ASSET_BIND_FORBIDDEN' });
    }
  }
}
