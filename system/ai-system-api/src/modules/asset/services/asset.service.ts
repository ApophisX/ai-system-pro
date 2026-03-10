import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource, EntityManager, In, Not } from 'typeorm';
import { AssetRepository, AssetCategoryRepository, AssetInventoryRepository } from '../repositories';
import { AssetEntity, AssetInventoryEntity } from '../entities';
import { AssetRentalPlanEntity } from '../entities/asset-rental-plan.entity';
import { AssetAuditStatus, AssetInventoryStatus, AssetStatus } from '../enums';
import {
  CreateAssetDto,
  UpdateAssetDto,
  AppQueryAssetDto,
  MyAssetQueryDto,
  OutputAssetListItemDto,
  OutputAssetDetailDto,
  OutputMyAssetListItemDto,
  CreateAssetRentalPlanDto,
  OutputAssetCreationStatsDto,
  UpdateAssetRentalPlanDto,
  QueryAssetAdminDto,
  AuditAssetDto,
  AssetAuditAction,
} from '../dto';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';
import { plainToInstance } from 'class-transformer';
import { ContactRepository } from '@/modules/contact/repositories';
import { UserRepository } from '@/modules/base/user/repositories';
import { OutputUserDto } from '@/modules/base/user/dto';
import { OssService } from '@/modules/base/aliyun-oss/oss.service';
import { isURL } from 'class-validator';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import { SequenceNumberService, SequenceNumberType } from '@/infrastructure/sequence-number';
import { RentalOrderRepository } from '@/modules/rental-order/repositories/rental-order.repository';
import { RentalOrderUsageStatus } from '@/modules/rental-order/enums';
import { MessageNotificationService } from '@/modules/base/message/services';
import { AssetEvents, AssetCreatedEventPayload } from '../events/asset.events';

/**
 * 资产服务
 *
 * 提供资产的发布、管理、查询等业务逻辑
 */
@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);

  constructor(
    private readonly assetRepo: AssetRepository,
    private readonly assetInventoryRepo: AssetInventoryRepository,
    private readonly categoryRepo: AssetCategoryRepository,
    private readonly contactRepo: ContactRepository,
    private readonly dataSource: DataSource,
    private readonly userRepo: UserRepository,
    private readonly ossService: OssService,
    private readonly sequenceNumberService: SequenceNumberService,
    private readonly rentalOrderRepo: RentalOrderRepository,
    private readonly messageNotificationService: MessageNotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    //
  }

  // ========== Admin 端接口 ==========

  /**
   * 获取资产列表（后台管理）
   * 支持查看所有商家的资产，按状态、审核状态、分类等筛选
   */
  async getAdminList(dto: QueryAssetAdminDto): Promise<{ data: OutputAssetDetailDto[]; meta: PaginationMetaDto }> {
    const paginationDto = plainToInstance(PaginationMetaDto, {
      page: dto.page,
      pageSize: dto.pageSize,
    });

    const [assets, total] = await this.assetRepo.findAdminWithPagination({
      ownerId: dto.ownerId,
      status: dto.status,
      auditStatus: dto.auditStatus,
      categoryId: dto.categoryId,
      keyword: dto.keyword,
      skip: paginationDto.skip,
      take: paginationDto.pageSize,
    });

    const listItems = plainToInstance(OutputAssetDetailDto, assets, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
    listItems.forEach(item => {
      item.images = item.images?.map(image => this.ossService.getSignatureUrl(image)) ?? [];
      item.detailImages = item.detailImages?.map(image => this.ossService.getSignatureUrl(image));
      item.coverImage = this.ossService.getSignatureUrl(item.coverImage);
      if (item.owner?.avatar) {
        item.owner.avatar = this.ossService.getSignatureUrl(item.owner.avatar);
      }
    });

    paginationDto.total = total;
    return { data: listItems, meta: paginationDto };
  }

  /**
   * 获取资产详情（后台管理）
   */
  async getAdminDetail(id: string): Promise<OutputAssetDetailDto> {
    const asset = await this.assetRepo.findByIdWithRelations(id);

    asset.images = asset.images?.map(image => this.ossService.getSignatureUrl(image)) ?? [];
    asset.detailImages = asset.detailImages?.map(image => this.ossService.getSignatureUrl(image));
    asset.coverImage = this.ossService.getSignatureUrl(asset.coverImage);
    if (asset.owner?.avatar) {
      asset.owner.avatar = this.ossService.getSignatureUrl(asset.owner.avatar);
    }

    return plainToInstance(OutputAssetDetailDto, asset, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 审核资产（后台管理）
   *
   * 业务规则：
   * 1. 仅待审核(pending)或审核中(auditing)状态的资产可审核
   * 2. 审核通过：auditStatus=approved，记录审核人、时间、意见
   * 3. 审核拒绝：auditStatus=rejected，记录审核人、时间、意见
   * 4. 审核后发送消息通知出租方
   */
  async auditByAdmin(id: string, dto: AuditAssetDto, auditorId: string): Promise<OutputAssetDetailDto> {
    const asset = await this.assetRepo.findById(id);

    if (asset.auditStatus !== AssetAuditStatus.PENDING && asset.auditStatus !== AssetAuditStatus.AUDITING) {
      throw new BadRequestException('仅待审核或审核中的资产可进行审核操作');
    }

    const approved = dto.action === AssetAuditAction.APPROVE;
    const newAuditStatus = approved ? AssetAuditStatus.APPROVED : AssetAuditStatus.REJECTED;

    asset.auditStatus = newAuditStatus;
    asset.auditById = auditorId;
    asset.auditAt = new Date();
    asset.auditRemark = dto.auditRemark;

    await this.assetRepo.save(asset);

    await this.messageNotificationService.notifyAssetAudit(
      asset.ownerId,
      asset.id,
      asset.name ?? '未命名资产',
      approved,
      dto.auditRemark,
    );

    this.logger.log(`资产审核完成: assetId=${id}, approved=${approved}, auditorId=${auditorId}`);
    return this.getAdminDetail(id);
  }

  /**
   * 强制下架资产（后台管理）
   *
   * 业务规则：
   * 1. 平台管理员可强制下架任意资产，不受出租方操作限制
   * 2. 将资产状态设为 offline，用户端不可见
   * 3. 发送消息通知出租方
   */
  async forceOfflineByAdmin(id: string, reason?: string): Promise<OutputAssetDetailDto> {
    const asset = await this.assetRepo.findById(id);

    if (asset.status === AssetStatus.OFFLINE) {
      throw new BadRequestException('资产已处于下架状态');
    }

    asset.status = AssetStatus.OFFLINE;
    asset.auditStatus = AssetAuditStatus.PENDING;
    await this.assetRepo.save(asset);

    await this.messageNotificationService.notifyAssetForceOffline(
      asset.ownerId,
      asset.id,
      asset.name ?? '未命名资产',
      reason,
    );

    this.logger.log(`资产强制下架: assetId=${id}, reason=${reason ?? '无'}`);
    return this.getAdminDetail(id);
  }

  // ========== App 端公开接口 ==========

  /**
   * 获取资产列表（App 端，公开）,不包含社区资产
   */
  async getPublicList(
    dto: AppQueryAssetDto,
    userId?: string,
  ): Promise<{ data: OutputAssetListItemDto[]; meta: PaginationMetaDto }> {
    if (dto.sortBy === 'nearby' && (dto.latitude == null || dto.longitude == null)) {
      throw new BadRequestException('按距离排序必须传入当前位置经纬度');
    }

    const [assets, total] = await this.assetRepo.findPublicWithPagination(
      {
        ...dto,
        take: dto.pageSize,
      },
      userId,
    );

    // 获取每个资产的最低价格
    const listItems = plainToInstance(OutputAssetListItemDto, assets, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
    listItems.forEach(item => {
      item.images = item.images.map(image => this.ossService.getSignatureUrl(image));
      item.coverImage = this.ossService.getSignatureUrl(item.coverImage);
      if (item.owner?.avatar) {
        item.owner.avatar = this.ossService.getSignatureUrl(item.owner.avatar);
      }
    });

    const meta = new PaginationMetaDto(dto.page, dto.pageSize);
    meta.total = total;

    return { data: listItems, meta };
  }

  /**
   * 根据资产 ID 列表获取资产列表（用于社区内资产展示）
   */
  async getAssetsByIdsForCommunity(
    assetIds: string[],
    total: number,
    page: number,
    pageSize: number,
    userId?: string,
  ): Promise<{ data: OutputAssetListItemDto[]; meta: PaginationMetaDto }> {
    if (assetIds.length === 0) {
      const meta = new PaginationMetaDto(page, pageSize);
      meta.total = total;
      return { data: [], meta };
    }

    const assets = await this.assetRepo.findByIdsWithRelationsOrdered(assetIds);

    const listItems = plainToInstance(OutputAssetListItemDto, assets, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
    listItems.forEach(item => {
      item.images = item.images?.map(image => this.ossService.getSignatureUrl(image)) ?? [];
      item.coverImage = this.ossService.getSignatureUrl(item.coverImage);
      if (item.owner?.avatar) {
        item.owner.avatar = this.ossService.getSignatureUrl(item.owner.avatar);
      }
    });

    if (userId && listItems.length > 0) {
      const favoriteAssetIds = await this.dataSource
        .createQueryBuilder()
        .select('favorite.asset_id', 'assetId')
        .from('favorite', 'favorite')
        .where('favorite.user_id = :userId', { userId })
        .andWhere('favorite.asset_id IN (:...assetIds)', { assetIds })
        .andWhere('favorite.deleted_at IS NULL')
        .getRawMany()
        .then(results => new Set(results.map(r => r.assetId)));

      listItems.forEach(item => {
        (item as OutputAssetListItemDto & { isFavorite: boolean }).isFavorite = favoriteAssetIds.has(item.id);
      });
    } else {
      listItems.forEach(item => {
        (item as OutputAssetListItemDto & { isFavorite: boolean }).isFavorite = false;
      });
    }

    const meta = new PaginationMetaDto(page, pageSize);
    meta.total = total;
    return { data: listItems, meta };
  }

  /**
   * 获取资产详情（App 端，公开）
   */
  async getPublicDetail(id: string, userId?: string): Promise<OutputAssetDetailDto> {
    const asset = await this.assetRepo.findByIdWithRelations(id);

    if (!asset) {
      throw new NotFoundException('资产不存在');
    }

    // 只有可租赁状态的资产才能查看详情
    if (asset.status !== AssetStatus.AVAILABLE || !asset.isActive) {
      throw new NotFoundException('资产不存在或已下架');
    }

    // 如果有 userId，查询收藏状态
    if (userId) {
      const isFavorite = await this.dataSource
        .createQueryBuilder()
        .select('1')
        .from('favorite', 'favorite')
        .where('favorite.asset_id = :assetId', { assetId: id })
        .andWhere('favorite.user_id = :userId', { userId })
        .andWhere('favorite.deleted_at IS NULL')
        .getRawOne()
        .then(result => !!result);

      (asset as AssetEntity & { isFavorite: boolean }).isFavorite = isFavorite;
    } else {
      (asset as AssetEntity & { isFavorite: boolean }).isFavorite = false;
    }

    // 增加浏览次数
    await this.assetRepo.incrementViewCount(id);

    if (asset.owner.avatar) {
      asset.owner.avatar = this.ossService.getSignatureUrl(asset.owner.avatar);
    }

    const result = plainToInstance(OutputAssetDetailDto, asset, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });

    result.images = result.images.map(image => this.ossService.getSignatureUrl(image));
    result.detailImages = result.detailImages?.map(image => this.ossService.getSignatureUrl(image));
    result.coverImage = this.ossService.getSignatureUrl(result.coverImage);

    return result;
  }

  /**
   * 检查资产是否属于指定用户（供 Community 等模块调用）
   */
  async isAssetOwnedBy(assetId: string, userId: string): Promise<boolean> {
    return this.assetRepo.isOwnedBy(assetId, userId);
  }

  /**
   * 检查资产是否存在（未删除）
   */
  async existsAsset(assetId: string): Promise<boolean> {
    return this.assetRepo.existsById(assetId);
  }

  // ========== 用户端接口（需要登录）==========

  /**
   * 发布资产（创建）
   * 根据用户配置的限制检查是否可以创建资产
   */
  async create(dto: CreateAssetDto, currentUser: OutputUserDto): Promise<AssetEntity> {
    // 获取用户信息，读取资产创建限制配置
    const { id: ownerId } = currentUser;

    const user = await this.userRepo.findById(ownerId);

    /**
     * 检查用户是否可以创建资产
     */
    await this.checkUserCanCreateAsset(user);
    const { categoryId, publish, tags, contactId, rentalPlans, communityId, ...rest } = dto;

    if (!user.isVerified && publish) {
      throw new BadRequestException('账户尚未通过实名认证，无法发布资产，可保存为草稿，待实名认证通过后发布。');
    }

    const savedAsset = await this.dataSource.transaction(async manager => {
      const category = await this.categoryRepo.findById(categoryId);

      // 创建资产实体
      const asset = this.assetRepo.create({
        ...rest,
        ownerId,
        customTags: tags,
        categoryCode: category.code,
        categoryName: category.name,
        categoryId: category.id,
        coverImage: dto.coverImage || dto.images?.[0],
        status: publish ? AssetStatus.AVAILABLE : AssetStatus.DRAFT,
        auditStatus: publish ? AssetAuditStatus.AUDITING : AssetAuditStatus.PENDING,
      });

      // 映射联系人
      await this.mapContactToEntity(contactId, ownerId, asset);

      // 保存资产
      const saved = await manager.save(AssetEntity, asset);

      // 创建租赁方案
      if (rentalPlans && rentalPlans.length > 0) {
        await this.createRentalPlans(manager, saved.id, ownerId, rentalPlans);
      }

      // 创建资产实例
      if (dto.availableQuantity && dto.availableQuantity > 0 && !dto.isMallProduct) {
        await this.createInventory(manager, saved, dto.availableQuantity, ownerId);
      }

      this.logger.log(`资产创建成功: ${saved.id} by ${ownerId}，待审核`);

      return saved;
    });

    if (communityId) {
      const payload: AssetCreatedEventPayload = {
        assetId: savedAsset.id,
        communityId,
        userId: ownerId,
      };
      await this.eventEmitter.emitAsync(AssetEvents.ASSET_CREATED, payload);
      const bindResult = payload.bindResult;
      return Object.assign(savedAsset, {
        communityBindStatus: bindResult?.status ?? 'failed',
        communityBindMessage: bindResult?.message,
      });
    }

    return savedAsset;
  }

  /**
   * 更新资产
   */
  async update(id: string, dto: UpdateAssetDto, ownerId: string): Promise<AssetEntity> {
    return this.dataSource.transaction(async manager => {
      const { categoryId, publish, tags, contactId, rentalPlans, images, detailImages, ...rest } = dto;

      // 在事务的 EntityManager 中获取 repository，确保实体被正确管理
      const assetRepo = manager.getRepository(AssetEntity);

      const asset = await assetRepo.findOne({
        where: {
          ownerId,
          id,
        },
        relations: {
          contact: true,
          rentalPlans: true,
          inventories: true,
          tags: true,
          category: true,
          owner: true,
        },
      });
      if (!asset) {
        throw new NotFoundException('资产不存在');
      }

      if (asset.isOnline) {
        throw new BadRequestException('资产已发布，无法编辑');
      }

      const newImages = images?.map(image => {
        // 是否是http链接
        if (isURL(image)) {
          return new URL(image).pathname;
        }
        return image;
      });
      const newDetailImages = detailImages?.map(image => {
        if (isURL(image)) {
          return new URL(image).pathname;
        }
        return image;
      });

      // 更新基本信息
      assetRepo.merge(asset, {
        ...rest,
        customTags: tags,
        status: publish ? AssetStatus.AVAILABLE : AssetStatus.DRAFT,
        auditStatus: publish ? AssetAuditStatus.AUDITING : AssetAuditStatus.PENDING,
        images: newImages || [],
        detailImages: newDetailImages || [],
        coverImage: dto.coverImage || newImages?.[0],
      });

      // 更新分类
      if (categoryId && categoryId !== asset.categoryId) {
        const category = await this.categoryRepo.findById(categoryId);
        assetRepo.merge(asset, {
          category,
          categoryCode: category.code,
          categoryName: category.name,
        });
      }

      // 映射联系人（必须在保存前完成，确保联系人信息被正确保存）
      if (contactId) {
        asset.contact = await this.mapContactToEntity(contactId, ownerId, asset);
      }

      // 保存资产（使用事务中的 manager.save 会保存实体的所有属性，包括联系人字段）
      const savedAsset = await manager.save(AssetEntity, asset);

      // 更新租赁方案
      if (rentalPlans !== undefined) {
        // 更新旧方案
        const updateRentalPlans = rentalPlans.filter(p => p.id);
        if (updateRentalPlans.length > 0) {
          await Promise.all(updateRentalPlans.map(plan => this.updateRentalPlans(manager, id, ownerId, plan)));
        }

        // 删除旧方案
        const updateRentalPlanIds = updateRentalPlans.map(p => p.id);
        const deleteRentalPlans = asset.rentalPlans?.filter(p => !updateRentalPlanIds.includes(p.id)) || [];
        if (deleteRentalPlans.length > 0) {
          await Promise.all(deleteRentalPlans.map(plan => this.deleteRentalPlan(manager, id, ownerId, plan.id)));
        }

        // 创建新方案
        const newRentalPlans = rentalPlans.filter(plan => !plan.id);
        if (newRentalPlans.length > 0) {
          await this.createRentalPlans(manager, id, ownerId, newRentalPlans);
        }
      }
      this.logger.log(`资产更新成功: ${id}`);
      return savedAsset;
    });
  }

  /**
   * 删除资产
   *
   * 业务规则：
   * 1. 只有资产所有者可以删除
   * 2. 不能删除有进行中订单的资产
   * 3. 不能删除有库存处于出租中状态的资产
   * 4. 使用软删除，保留数据用于历史记录和审计
   * 5. 级联软删除关联的库存和租赁方案
   */
  async delete(id: string, ownerId: string): Promise<void> {
    // 1. 权限检查：验证资产所有权
    const asset = await this.assetRepo.findMyById(id, ownerId);

    // 2. 检查是否有进行中的订单
    await this.checkActiveOrders(asset.id);

    // 3. 检查库存状态
    await this.checkInventoryStatus(asset.id);

    // 4. 在事务内执行软删除
    await this.dataSource.transaction(async manager => {
      // 4.1 软删除所有关联的库存
      // await this.softDeleteInventories(manager, asset.ownerId);

      // 4.2 软删除所有关联的租赁方案
      // await this.softDeleteRentalPlans(manager, asset.id);

      // 4.3 软删除资产本身
      await manager.remove(AssetEntity, asset);

      // 4.4 删除oss图片
      await this.ossService.deleteMulti(asset.images);
      await this.ossService.deleteMulti([asset.coverImage || '']);
      await this.ossService.deleteMulti(asset.detailImages || []);

      this.logger.log(`资产删除成功: ${id}, 所有者: ${ownerId}`);
    });
  }

  /**
   * 上架资产
   */
  async publish(id: string, ownerId: string): Promise<{ data: AssetEntity; message: string }> {
    const asset = await this.assetRepo.findMyById(id, ownerId);

    const user = await this.userRepo.findById(ownerId);
    if (!user.isVerified) {
      throw new BadRequestException('账户尚未通过实名认证，无法进行资产上架。请先完成实名认证。');
    }

    if (asset.auditStatus === AssetAuditStatus.APPROVED) {
      if (asset.status === AssetStatus.AVAILABLE) {
        throw new BadRequestException('资产已是发布状态');
      }
      if (asset.status === AssetStatus.OFFLINE) {
        asset.status = AssetStatus.AVAILABLE;
        const saved = await this.assetRepo.save(asset);
        this.logger.log(`资产重新发布: ${id}`);
        return { data: saved, message: '资产已重新发布' };
      }
    }
    // if (asset.auditStatus !== AssetAuditStatus.APPROVED) {
    //   throw new BadRequestException('资产审核未通过，无法上架');
    // }

    asset.status = AssetStatus.AVAILABLE;
    asset.auditStatus = AssetAuditStatus.AUDITING;
    asset.publishAt = new Date();
    const saved = await this.assetRepo.save(asset);
    this.logger.log(`资产上架成功: ${id}`);
    return { data: saved, message: '资产上架成功，等待审核' };
  }

  /**
   * 下架资产
   */
  async offline(id: string, ownerId: string): Promise<AssetEntity> {
    const asset = await this.assetRepo.findMyById(id, ownerId);
    if (asset.isOnline) {
      asset.status = AssetStatus.OFFLINE;
      const saved = await this.assetRepo.save(asset);
      this.logger.log(`资产下架成功: ${id}`);
      return saved;
    }
    throw new BadRequestException('资产未上架，无法下架！');
  }

  /**
   * 获取我的资产详情
   */
  async getMyAssetDetail(id: string, ownerId: string): Promise<OutputAssetDetailDto> {
    const asset = await this.assetRepo.findByIdWithRelations(id);

    if (asset.ownerId !== ownerId) {
      throw new ForbiddenException('无权查看此资产');
    }

    asset.images = asset.images.map(image => this.ossService.getSignatureUrl(image));
    asset.detailImages = asset.detailImages?.map(image => this.ossService.getSignatureUrl(image));

    asset.coverImage = this.ossService.getSignatureUrl(asset.coverImage);

    if (asset.owner.avatar) {
      asset.owner.avatar = this.ossService.getSignatureUrl(asset.owner.avatar);
    }

    return plainToInstance(OutputAssetDetailDto, asset, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 获取我的资产列表
   */
  async getMyAssets(
    ownerId: string,
    dto: MyAssetQueryDto,
  ): Promise<{ data: OutputMyAssetListItemDto[]; meta: PaginationMetaDto }> {
    const paginationDto = plainToInstance(PaginationMetaDto, {
      page: dto.page,
      pageSize: dto.pageSize,
    });

    const [assets, total] = await this.assetRepo.findMyAssetsWithPagination(ownerId, {
      status: dto.status,
      keyword: dto.keyword,
      auditStatus: dto.auditStatus,
      categoryId: dto.categoryId,
      skip: paginationDto.skip,
      take: paginationDto.pageSize,
    });

    const listItems = plainToInstance(OutputMyAssetListItemDto, assets, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
    listItems.forEach(item => {
      item.images = item.images.map(image => this.ossService.getSignatureUrl(image));
      item.detailImages = item.detailImages?.map(image => this.ossService.getSignatureUrl(image));
      item.coverImage = this.ossService.getSignatureUrl(item.coverImage);
    });

    paginationDto.total = total;
    return { data: listItems, meta: paginationDto };
  }

  /**
   * 获取资产创建统计信息
   */
  async getCreationStats(ownerId: string): Promise<OutputAssetCreationStatsDto> {
    // 获取用户信息，读取资产创建限制配置
    const { maxDailyAssetCreationCount: maxDailyCount, maxTotalAssetCount: maxTotalCount } =
      await this.userRepo.findById(ownerId);

    // 获取统计数据
    const todayCount = await this.assetRepo.countTodayCreatedByOwnerId(ownerId);
    const totalCount = await this.assetRepo.countTotalByOwnerId(ownerId);

    // 计算是否可以创建
    const canCreateToday = todayCount < maxDailyCount;
    const canCreateTotal = maxTotalCount === 0 || totalCount < maxTotalCount;
    const canCreate = canCreateToday && canCreateTotal;
    const remainingTodayCount = Math.max(0, maxDailyCount - todayCount);

    return plainToInstance(
      OutputAssetCreationStatsDto,
      {
        todayCount,
        totalCount,
        maxDailyCount,
        maxTotalCount,
        canCreateToday,
        canCreateTotal,
        canCreate,
        remainingTodayCount,
      },
      {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      },
    );
  }

  // ========== 私有方法 ==========

  /**
   * 检查用户是否可以创建资产
   */
  private async checkUserCanCreateAsset(user: UserEntity): Promise<void> {
    const {
      maxDailyAssetCreationCount: maxDailyCount,
      maxTotalAssetCount: maxTotalCount,
      id: ownerId,
      maxTotalAssetInventoryCount,
    } = user;

    const todayCount = await this.assetRepo.countTodayCreatedByOwnerId(ownerId);
    if (todayCount >= maxDailyCount) {
      throw new BadRequestException(`您今天已创建 ${todayCount} 个资产，已达到每日上限（${maxDailyCount} 个）`);
    }
    const inventoryCount = await this.assetInventoryRepo.countTotalByOwnerId(ownerId);
    if (inventoryCount >= maxTotalAssetInventoryCount) {
      throw new BadRequestException(`您已达到资产实例创建上限（${maxTotalAssetInventoryCount} 个），无法继续创建`);
    }
    if (maxTotalCount > 0) {
      const totalCount = await this.assetRepo.countTotalByOwnerId(ownerId);
      if (totalCount >= maxTotalCount) {
        throw new BadRequestException(`您已达到资产创建上限（${maxTotalCount} 个），无法继续创建`);
      }
    }
  }

  /**
   * 映射联系人信息到资产实体
   * @param contactId 联系人ID
   * @param ownerId 资产所有者ID
   * @param entity 资产实体
   */
  private async mapContactToEntity(contactId: string, ownerId: string, entity: AssetEntity) {
    // 获取获取联系地址
    const contact = await this.contactRepo.findById(contactId, {
      where: { userId: ownerId },
    });

    entity.contactId = contact.id;
    entity.contactName = contact.contactName;
    entity.contactPhone = contact.contactPhone;
    entity.contactWeChat = contact.wechat;
    entity.province = contact.province;
    entity.provinceCode = contact.provinceCode;
    entity.city = contact.city;
    entity.cityCode = contact.cityCode;
    entity.district = contact.district;
    entity.districtCode = contact.districtCode;
    entity.address = contact.address;
    entity.addressName = contact.addressName;
    entity.latitude = contact.latitude;
    entity.longitude = contact.longitude;

    return contact;
  }

  /**
   * 创建租赁方案
   */
  private async createRentalPlans(
    manager: EntityManager,
    assetId: string,
    ownerId: string,
    plans: Omit<CreateAssetRentalPlanDto, 'id'>[],
  ): Promise<void> {
    if (!plans || plans.length === 0) return;
    const planRepo = manager.getRepository(AssetRentalPlanEntity);
    const planEntities = plans.map(planDto => planRepo.create({ ...planDto, assetId, ownerId }));
    await manager.save(AssetRentalPlanEntity, planEntities);
  }

  /**
   * 删除租赁方案
   */
  private async deleteRentalPlan(
    manager: EntityManager,
    assetId: string,
    ownerId: string,
    planId: number,
  ): Promise<void> {
    const planRepo = manager.getRepository(AssetRentalPlanEntity);
    await planRepo.delete({
      assetId,
      ownerId,
      id: planId,
    });
  }

  /**
   * 更新租赁方案
   */
  /**
   * 更新租赁方案
   * @param manager EntityManager 实例
   * @param assetId 资产ID
   * @param ownerId 资产所有者ID
   * @param plans 新的租赁方案数组
   */
  private async updateRentalPlans(
    manager: EntityManager,
    assetId: string,
    ownerId: string,
    planDto: UpdateAssetRentalPlanDto,
  ): Promise<void> {
    const planRepo = manager.getRepository(AssetRentalPlanEntity);
    const plan = await planRepo.findOne({
      where: { id: planDto.id || 0, assetId, ownerId },
    });
    if (plan) {
      planRepo.merge(plan, planDto);
      await manager.save(AssetRentalPlanEntity, plan);
    }
  }

  /**
   * 创建库存记录（一实例即一件，可创建多条记录表示多件）
   * @param ownerId 出租人 ID，用于设置实例的 lessorId，便于按出租人查询
   */
  private async createInventory(
    manager: EntityManager,
    asset: AssetEntity,
    quantity: number,
    ownerId?: string,
  ): Promise<void> {
    const inventories: AssetInventoryEntity[] = [];

    const codes = await Promise.all(
      Array.from({ length: quantity > 50 ? 50 : quantity }, async () => {
        return this.sequenceNumberService.generate({
          businessType: SequenceNumberType.ASSET_INVENTORY,
        });
      }),
    );

    for (let i = 0; i < codes.length; i++) {
      const instanceCode = codes[i];
      const inventory = new AssetInventoryEntity();
      inventory.assetId = asset.id;
      inventory.asset = asset;
      inventory.lessorId = ownerId;
      inventory.instanceCode = instanceCode;
      inventory.instanceName = `${asset.name}-${i + 1}`;
      inventory.status = AssetInventoryStatus.AVAILABLE;
      inventory.isActive = true;
      inventories.push(inventory);
    }
    await manager.save(AssetInventoryEntity, inventories);
  }

  /**
   * 检查是否有进行中的订单
   *
   */
  private async checkActiveOrders(assetId: string): Promise<void> {
    const activeOrderCount = await this.rentalOrderRepo.count({
      where: {
        assetId,
        useageStatus: Not(In([RentalOrderUsageStatus.NONE, RentalOrderUsageStatus.RETURNED])),
      },
    });

    if (activeOrderCount > 0) {
      throw new BadRequestException(`该资产有 ${activeOrderCount} 个进行中的订单，无法删除`);
    }
  }

  /**
   * 检查库存状态
   *
   * 不能删除有库存处于以下状态的资产：
   * - RENTED: 已出租
   */
  private async checkInventoryStatus(assetId: string): Promise<void> {
    const rentedInventoryCount = await this.assetInventoryRepo.count({
      where: {
        assetId,
        status: AssetInventoryStatus.RENTED,
        isActive: true,
      },
    });

    if (rentedInventoryCount > 0) {
      throw new BadRequestException(`该资产有 ${rentedInventoryCount} 个库存正在出租中，无法删除`);
    }
  }

  /**
   * 软删除所有关联的库存
   */
  private async softDeleteInventories(manager: EntityManager, assetId: string): Promise<void> {
    const inventories = await manager.find(AssetInventoryEntity, {
      where: { assetId, isActive: true },
    });

    if (inventories.length > 0) {
      await manager.softRemove(AssetInventoryEntity, inventories);
      this.logger.log(`软删除资产库存: ${inventories.length} 个, 资产ID: ${assetId}`);
    }
  }

  /**
   * 软删除所有关联的租赁方案
   */
  private async softDeleteRentalPlans(manager: EntityManager, assetId: string): Promise<void> {
    const rentalPlans = await manager.find(AssetRentalPlanEntity, {
      where: { assetId },
    });

    if (rentalPlans.length > 0) {
      await manager.softRemove(AssetRentalPlanEntity, rentalPlans);
      this.logger.log(`软删除租赁方案: ${rentalPlans.length} 个, 资产ID: ${assetId}`);
    }
  }
}
