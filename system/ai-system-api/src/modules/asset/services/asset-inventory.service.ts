import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { DataSource, EntityManager, FindOptionsWhere, Like } from 'typeorm';
import { AssetInventoryRepository } from '../repositories/asset-inventory.repository';
import { AssetRepository } from '../repositories/asset.repository';
import { AssetInventoryEntity } from '../entities/asset-inventory.entity';
import { AssetEntity } from '../entities/asset.entity';
import { AssetInventoryRentalRecordEntity } from '../entities/asset-inventory-rental-record.entity';
import { AssetInventoryRebindRecordEntity } from '../entities/asset-inventory-rebind-record.entity';
import { AssetInventoryStatus } from '../enums';
import {
  CreateAssetInventoryDto,
  UpdateAssetInventoryDto,
  QueryAssetInventoryDto,
  OutputAssetInventoryDto,
  SimpleOutputAssetInventoryDto,
} from '../dto';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';
import { plainToInstance } from 'class-transformer';
import { SequenceNumberService, SequenceNumberType } from '@/infrastructure/sequence-number';
import { OssService } from '@/modules/base/aliyun-oss/oss.service';
import { RentalOrderRepository } from '@/modules/rental-order/repositories';
import { OutputRentalOrderDto } from '@/modules/rental-order/dto';
import { RentalOrderEntity } from '@/modules/rental-order/entities';
import { RentalOrderStatus } from '@/modules/rental-order/enums';

/** 资产实例租赁记录状态：租赁中 */
const RENTAL_RECORD_STATUS_RENTING = 'renting';
/** 资产实例租赁记录状态：已取消（解绑） */
const RENTAL_RECORD_STATUS_CANCELED = 'canceled';
/** 用户累计可创建的资产实例上限 */
const MAX_INVENTORY_COUNT_PER_USER = 1000;

/**
 * 资产实例服务
 *
 * 提供资产实例的创建、管理、查询等业务逻辑
 */
@Injectable()
export class AssetInventoryService {
  private readonly logger = new Logger(AssetInventoryService.name);

  constructor(
    private readonly inventoryRepo: AssetInventoryRepository,
    private readonly assetRepo: AssetRepository,
    private readonly dataSource: DataSource,
    private readonly sequenceNumberService: SequenceNumberService,
    private readonly ossService: OssService,
    private readonly orderRepo: RentalOrderRepository,
  ) {}

  /**
   * 创建资产实例（支持批量）
   * - 单条：可传 instanceCode、instanceName；未传 instanceCode 时用前缀+序列号生成
   * - 批量：quantity > 1 或 isBatchCreate 时，用 codePrefix+唯一序列号、namePrefix+序号（设备1、设备2）
   * - 用户累计不能超过 1000 个资产实例
   */
  async create(dto: CreateAssetInventoryDto, ownerId: string): Promise<AssetInventoryEntity | AssetInventoryEntity[]> {
    // 1. 验证资产是否存在且属于当前用户
    const asset = await this.assetRepo.findMyById(dto.assetId, ownerId);
    if (!asset) {
      throw new NotFoundException('资产不存在或无权限');
    }

    const count = Math.min(Math.max(1, dto.quantity ?? 1), 100);
    const isBatch = count > 1 || !!dto.isBatchCreate;

    // 2. 用户累计实例数上限（含本次创建）
    const currentTotal = await this.inventoryRepo.countByOwnerId(ownerId);
    if (currentTotal + count > MAX_INVENTORY_COUNT_PER_USER) {
      throw new BadRequestException(
        `用户累计不能创建超过 ${MAX_INVENTORY_COUNT_PER_USER} 个资产实例，当前已有 ${currentTotal} 个，本次最多可创建 ${MAX_INVENTORY_COUNT_PER_USER - currentTotal} 个`,
      );
    }

    // 3. 批量创建
    if (isBatch) {
      // 3.. 批量创建：前缀 + 唯一序列号，名称为 namePrefix + 序号（设备1、设备2）
      const codePrefix = (dto.codePrefix || 'INV').trim();
      // const startSeq = await this.inventoryRepo.getNextSequenceForPrefix(dto.assetId, codePrefix);
      const startSeq = await this.sequenceNumberService.generate({
        businessType: SequenceNumberType.ASSET_INVENTORY,
        totalLength: 24,
      });

      return this.dataSource.transaction(async manager => {
        const list: AssetInventoryEntity[] = [];
        for (let i = 0; i < count; i++) {
          const seq = startSeq + i;
          const instanceCode = `${codePrefix}${seq}`;
          const instanceName = `${dto.instanceName || '设备'}${i + 1}`;
          const inventory = this.inventoryRepo.create({
            assetId: dto.assetId,
            lessorId: ownerId,
            instanceCode,
            instanceName,
            longitude: dto.longitude,
            latitude: dto.latitude,
            attributes: dto.attributes,
            images: dto.images,
            status: AssetInventoryStatus.AVAILABLE,
            isActive: true,
          });
          const saved = await manager.save(AssetInventoryEntity, inventory);
          list.push(saved);
        }

        // 更新资产的可用数量：+count
        await manager.increment(AssetEntity, { id: dto.assetId }, 'availableQuantity', count);

        this.logger.log(`批量创建资产实例成功: assetId=${dto.assetId}, count=${count}，资产可用数量+${count}`);
        return list;
      });
    }
    // 单条创建
    else {
      const prefix = dto.codePrefix || '';
      // const nextSeq = await this.inventoryRepo.getNextSequenceForPrefix(dto.assetId, prefix);
      const nextSeq = await this.sequenceNumberService.generate({
        businessType: SequenceNumberType.ASSET_INVENTORY,
        totalLength: 24,
      });
      const instanceCode = dto.instanceCode || `${prefix}${nextSeq}`;
      const existing = await this.inventoryRepo.findByAssetIdAndInstanceCode(dto.assetId, instanceCode);
      if (existing) {
        throw new ConflictException(`实例编号 ${instanceCode} 已存在`);
      }
      return this.dataSource.transaction(async manager => {
        const inventory = this.inventoryRepo.create({
          ...dto,
          lessorId: ownerId,
          instanceCode,
          instanceName: dto.instanceName || '设备',
          status: AssetInventoryStatus.AVAILABLE,
          isActive: true,
        });
        const saved = await manager.save(AssetInventoryEntity, inventory);

        // 更新资产的可用数量：+1
        await manager.increment(AssetEntity, { id: dto.assetId }, 'availableQuantity', 1);

        this.logger.log(`资产实例创建成功: ${saved.id}, assetId: ${dto.assetId}，资产可用数量+1`);
        return saved;
      });
    }
  }

  /**
   * 更新资产实例
   */
  async update(id: string, dto: UpdateAssetInventoryDto, ownerId: string): Promise<AssetInventoryEntity> {
    // 1. 查找实例并验证权限
    const inventory = await this.inventoryRepo.findByIdOrFail(id, { where: { lessorId: ownerId } });

    // 2. 如果更新实例编号，检查是否冲突
    if (dto.instanceCode && dto.instanceCode !== inventory.instanceCode) {
      const existing = await this.inventoryRepo.findByAssetIdAndInstanceCode(inventory.assetId, dto.instanceCode);
      if (existing) {
        throw new ConflictException(`实例编号 ${dto.instanceCode} 已存在`);
      }
    }

    // 3. 在事务内更新
    return this.dataSource.transaction(async manager => {
      manager.merge(AssetInventoryEntity, inventory, dto);
      const savedInventory = await manager.save(AssetInventoryEntity, inventory);

      this.logger.log(`资产实例更新成功: ${id}`);

      return savedInventory;
    });
  }

  /**
   * 删除资产实例（软删除）
   *
   * 删除流程：
   * 1. 权限校验：验证资产是否属于当前用户
   * 2. 状态校验：实例不能处于租赁中状态
   * 3. 删除关联资源：删除实例的图片文件（OSS）
   * 4. 删除数据库记录
   */
  async delete(id: string, ownerId: string): Promise<void> {
    // 1. 查找实例并验证权限
    const inventory = await this.inventoryRepo.findById(id);
    if (!inventory) {
      throw new NotFoundException('资产实例不存在');
    }

    // 2. 验证资产是否属于当前用户
    const asset = await this.assetRepo.findMyById(inventory.assetId, ownerId);
    if (!asset) {
      throw new ForbiddenException('无权操作此资产实例');
    }

    // 3. 检查是否有进行中的租赁（实例状态为租赁中则不可删除）
    if (inventory.status === AssetInventoryStatus.RENTED) {
      throw new BadRequestException('该实例正在租赁中，无法删除');
    }

    // 4. 删除关联的图片文件（如果有）
    if (inventory.images && inventory.images.length > 0) {
      try {
        await this.ossService.deleteMulti(inventory.images);
      } catch (error) {
        // 图片删除失败不影响实例删除，记录日志即可
        this.logger.warn(`删除资产实例 ${id} 的图片失败，但继续删除实例记录`, error);
      }
    }

    // 5. 在事务内删除实例记录并更新资产可用数量
    await this.dataSource.transaction(async manager => {
      // 删除实例记录
      await manager.delete(AssetInventoryEntity, id);

      // 更新资产的可用数量：-1
      await manager.decrement(AssetEntity, { id: inventory.assetId }, 'availableQuantity', 1);
    });

    this.logger.log(`资产实例删除成功: ${id}，资产可用数量-1`);
  }

  /**
   * 根据 ID 获取资产实例详情
   */
  async getById(id: string, ownerId?: string): Promise<OutputAssetInventoryDto> {
    const inventory = await this.inventoryRepo.findByIdOrFail(id, {
      where: {
        lessorId: ownerId,
      },
      relations: { asset: true },
    });
    const plain = this.transformToOutput(inventory);
    plain.images = inventory.images?.map(image => this.ossService.getSignatureUrl(image));
    if (inventory.orderId) {
      const order = await this.orderRepo.findOne({ where: { id: inventory.orderId } });
      if (order) {
        plain.order = plainToInstance(OutputRentalOrderDto, order, {
          excludeExtraneousValues: true,
          exposeDefaultValues: true,
        });
      }
    }
    return plain;
  }

  /**
   * 获取资产实例列表
   */
  async getList(
    dto: QueryAssetInventoryDto,
    ownerId?: string,
  ): Promise<{ data: OutputAssetInventoryDto[]; meta: PaginationMetaDto }> {
    const where: FindOptionsWhere<AssetInventoryEntity> = {};
    const whereList: FindOptionsWhere<AssetInventoryEntity>[] = [];

    if (dto.assetId) {
      where.assetId = dto.assetId;
      // 如果提供了 assetId 和 ownerId，验证资产属于当前用户
      if (ownerId) {
        const asset = await this.assetRepo.findMyById(dto.assetId, ownerId);
        if (!asset) {
          throw new ForbiddenException('无权查看此资产的实例');
        }
      }
    }

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.instanceCode) {
      where.instanceCode = dto.instanceCode;
    }

    // 按出租人过滤，仅返回当前用户的实例
    if (ownerId) {
      where.lessorId = ownerId;
    }

    if (dto.keyword) {
      whereList.push({
        ...where,
        instanceCode: Like(`%${dto.keyword.trim()}%`),
      });
      whereList.push({
        ...where,
        instanceName: Like(`%${dto.keyword.trim()}%`),
      });
    } else {
      whereList.push(where);
    }

    const paginationDto = new PaginationMetaDto(dto.page, dto.pageSize);

    const [inventories, total] = await this.inventoryRepo.findWithPagination(where, {
      skip: paginationDto.skip,
      take: paginationDto.pageSize,
      relations: ['asset'],
      keyword: dto.keyword,
      order: { createdAt: 'DESC' },
    });

    const listItems = inventories.map(inventory => this.transformToOutput(inventory));

    paginationDto.total = total;

    return { data: listItems, meta: paginationDto };
  }

  /**
   * 根据资产 ID 和实例编号获取资产实例（承租方展示用）
   *
   * 使用场景：承租方在订单中获取到 assetId 和 inventoryCode 后，调用此接口展示实例详情
   *（如图片、名称、状态、位置等）。需传入资产 ID 与实例编号才能唯一确定实例。
   *
   * @param assetId 资产 ID
   * @param instanceCode 实例编号（同一资产下唯一）
   * @returns 实例简要信息，含签名的图片 URL
   */
  async getByInventoryCode(assetId: string, instanceCode: string): Promise<SimpleOutputAssetInventoryDto> {
    if (!assetId?.trim() || !instanceCode?.trim()) {
      throw new BadRequestException('资产 ID 和实例编号不能为空');
    }
    const inventory = await this.inventoryRepo.findByAssetIdAndInstanceCode(assetId.trim(), instanceCode.trim());
    if (!inventory || !inventory.isActive) {
      throw new NotFoundException('资产实例不存在');
    }
    const plain = plainToInstance(SimpleOutputAssetInventoryDto, inventory, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
    plain.images = inventory.images?.map(img => this.ossService.getSignatureUrl(img)) || [];
    return plain;
  }

  /**
   * 根据资产 ID 获取所有实例列表
   */
  async getByAssetId(assetId: string, ownerId?: string): Promise<OutputAssetInventoryDto[]> {
    // 如果提供了 ownerId，验证权限
    if (ownerId) {
      const asset = await this.assetRepo.findMyById(assetId, ownerId);
      if (!asset) {
        throw new ForbiddenException('无权查看此资产的实例');
      }
    }

    const inventories = await this.inventoryRepo.findByAssetId(assetId);

    return inventories.map(inventory => this.transformToOutput(inventory));
  }

  /**
   * 订单绑定资产实例（出租方操作）
   *
   * 前置条件由调用方保证：订单状态为 PAID、订单归属当前出租方、订单 assetId 与实例所属资产一致。
   * 本方法负责：实例归属与状态校验、同一实例未被其他订单占用、可选先解绑该订单已有实例、创建租赁记录、更新实例状态。
   *
   * @param orderInfo 订单信息（orderId, orderNo, lesseeId, lessorId, assetId, startDate?, endDate?）
   * @param inventoryId 要绑定的资产实例 ID
   * @param lessorId 当前出租方 ID（用于校验实例归属）
   * @param manager 可选，传入时在已有事务内执行（用于换绑时与换绑记录同事务）
   */
  async bindToOrder(
    orderInfo: RentalOrderEntity,
    inventoryId: string,
    lessorId: string,
    manager?: EntityManager,
  ): Promise<AssetInventoryRentalRecordEntity> {
    const run = async (em: EntityManager) => {
      const inventoryRepository = em.getRepository(AssetInventoryEntity);
      const inventoryRecordRepo = em.getRepository(AssetInventoryRentalRecordEntity);

      // 1. 行锁目标实例，防止并发下双订单同时通过可用性检查并写入 renting 记录
      const inventory = await inventoryRepository.findOne({
        where: {
          id: inventoryId,
          lessorId,
          assetId: orderInfo.assetId,
        },
        lock: { mode: 'pessimistic_write' },
      });
      if (!inventory) {
        throw new NotFoundException('资产实例不存在或无权限');
      }
      if (inventory.status !== AssetInventoryStatus.AVAILABLE) {
        throw new ConflictException('该资产实例不可用，可能已被其他订单占用');
      }

      // 2. 锁后再次确认该实例未被其他订单占用（双重校验，应对锁前已写入的脏数据）
      const existingByInventory = await inventoryRecordRepo.findOne({
        where: { inventoryId, status: RENTAL_RECORD_STATUS_RENTING },
      });
      if (existingByInventory && existingByInventory.orderId !== orderInfo.id) {
        throw new ConflictException('该资产实例已被其他订单占用，请选择其他可用实例');
      }

      // 3. 若该订单已绑定其他实例，先解绑（重新绑定场景）
      const existingReocrdByOrder = await inventoryRecordRepo.findOne({
        where: { orderId: orderInfo.id, status: RENTAL_RECORD_STATUS_RENTING },
      });
      if (existingReocrdByOrder) {
        if (existingReocrdByOrder.inventoryId === inventoryId) {
          throw new BadRequestException('该订单已绑定此资产实例，无需重复绑定');
        }
        // 解绑原实例（一实例即一件，仅更新状态）
        await inventoryRecordRepo.update({ id: existingReocrdByOrder.id }, { status: RENTAL_RECORD_STATUS_CANCELED });
        await inventoryRepository.update(existingReocrdByOrder.inventoryId, {
          status: AssetInventoryStatus.AVAILABLE,
          lesseeId: null as unknown as string,
          orderId: null as unknown as string,
          orderNo: null as unknown as string,
          boundAt: null as unknown as Date,
          unboundAt: new Date(),
        });
        this.logger.log(
          `订单 ${orderInfo.orderNo} 已解绑原实例 ${existingReocrdByOrder.inventoryId}，正在绑定新实例 ${inventoryId}`,
        );
      }

      // 4. 创建租赁记录
      const startDate = orderInfo.startDate || new Date();
      const record = inventoryRecordRepo.create({
        inventoryId,
        orderId: orderInfo.id,
        orderNo: orderInfo.orderNo,
        lesseeId: orderInfo.lesseeId,
        lessorId: orderInfo.lessorId,
        assetId: orderInfo.assetId,
        startDate,
        endDate: orderInfo.endDate || undefined,
        quantity: 1,
        status: RENTAL_RECORD_STATUS_RENTING,
      });
      const savedRecord = await inventoryRecordRepo.save(record);

      // 5. 更新实例状态为租赁中，并记录承租人、承租订单信息及绑定时间；租赁次数+1
      await inventoryRepository.increment({ id: inventoryId }, 'rentalCount', 1);
      await inventoryRepository.update(inventoryId, {
        status: AssetInventoryStatus.RENTED,
        lesseeId: orderInfo.lesseeId,
        orderId: orderInfo.id,
        orderNo: orderInfo.orderNo,
        boundAt: new Date(),
        unboundAt: null as unknown as Date,
      });

      this.logger.log(`订单 ${orderInfo.orderNo} 已绑定资产实例 ${inventoryId}，租赁次数+1`);
      return savedRecord;
    };

    if (manager) {
      return run(manager);
    }
    return this.dataSource.transaction(run);
  }

  /**
   * 根据订单 ID 查询当前租赁中的绑定记录（若有）
   */
  async getCurrentRentalRecordByOrderId(orderId: string): Promise<AssetInventoryRentalRecordEntity | null> {
    const recordRepo = this.dataSource.getRepository(AssetInventoryRentalRecordEntity);
    return recordRepo.findOne({
      where: { orderId, status: RENTAL_RECORD_STATUS_RENTING },
    });
  }

  /**
   * 订单换绑资产实例（出租方操作）
   *
   * 前置条件：订单已绑定过资产实例；将当前绑定实例换绑为目标实例。
   * 会写入换绑记录表，再在事务内执行解绑原实例并绑定新实例。
   *
   * @param orderInfo 订单信息
   * @param toInventoryId 目标资产实例 ID
   * @param lessorId 当前出租方 ID
   * @param reason 可选换绑原因/备注
   * @param manager 可选，传入时在已有事务内执行（由调用方负责更新 rental_order.inventory_id）
   */
  async rebindOrder(
    orderInfo: RentalOrderEntity,
    toInventoryId: string,
    lessorId: string,
    reason?: string,
    manager?: EntityManager,
  ): Promise<AssetInventoryRentalRecordEntity> {
    const run = async (em: EntityManager) => {
      const recordRepo = em.getRepository(AssetInventoryRentalRecordEntity);
      const current = await recordRepo.findOne({
        where: { orderId: orderInfo.id, status: RENTAL_RECORD_STATUS_RENTING },
      });
      if (!current) {
        throw new BadRequestException('订单尚未绑定资产实例，请使用「绑定资产实例」接口');
      }
      if (current.inventoryId === toInventoryId) {
        throw new BadRequestException('订单已绑定该资产实例，无需换绑');
      }

      const rebindRepo = em.getRepository(AssetInventoryRebindRecordEntity);
      const rebindRecord = rebindRepo.create({
        orderId: orderInfo.id,
        orderNo: orderInfo.orderNo,
        fromInventoryId: current.inventoryId,
        toInventoryId,
        lessorId,
        lesseeId: orderInfo.lesseeId,
        assetId: orderInfo.assetId,
        reason: reason ?? undefined,
      });
      await rebindRepo.save(rebindRecord);

      // 原实例和新实例的换绑次数都+1
      const inventoryRepository = em.getRepository(AssetInventoryEntity);
      await inventoryRepository.increment({ id: current.inventoryId }, 'rebindCount', 1);
      await inventoryRepository.increment({ id: toInventoryId }, 'rebindCount', 1);

      this.logger.log(
        `换绑记录已写入: 订单 ${orderInfo.orderNo} 从实例 ${current.inventoryId} 换绑至 ${toInventoryId}，两个实例换绑次数+1`,
      );
      return this.bindToOrder(orderInfo, toInventoryId, lessorId, em);
    };

    if (manager) {
      return run(manager);
    }
    return this.dataSource.transaction(run);
  }

  /**
   * 解绑订单与资产实例（订单取消等场景）
   *
   * 若该订单存在「租赁中」的绑定记录，则将其置为已取消，并将实例状态回退为可用。
   *
   * @param orderId 订单 ID
   * @param manager 可选，传入时在已有事务内执行，否则新建事务
   * @returns 是否执行了解绑（存在并解绑了记录则为 true）
   */
  async unbindFromOrder(orderId: string, manager?: EntityManager): Promise<boolean> {
    const doUnbind = async (em: EntityManager) => {
      const recordRepository = em.getRepository(AssetInventoryRentalRecordEntity);
      const existing = await recordRepository.findOne({
        where: { orderId, status: RENTAL_RECORD_STATUS_RENTING },
      });
      if (!existing) {
        return false;
      }

      const inventoryRepository = em.getRepository(AssetInventoryEntity);

      // 查询实例以获取绑定时间（boundAt）
      const inventory = await inventoryRepository.findOne({
        where: { id: existing.inventoryId },
        select: ['id', 'boundAt', 'totalRentalDuration'],
      });

      // 计算本次租赁时长（秒）并累加到总时长
      let rentalDuration = 0;
      if (inventory?.boundAt) {
        const unbindTime = new Date();
        const boundTime = new Date(inventory.boundAt);
        rentalDuration = Math.floor((unbindTime.getTime() - boundTime.getTime()) / 1000); // 毫秒转秒

        if (rentalDuration > 0) {
          // 累加租赁时长
          await inventoryRepository.increment({ id: existing.inventoryId }, 'totalRentalDuration', rentalDuration);
          this.logger.log(`实例 ${existing.inventoryId} 本次租赁时长: ${rentalDuration} 秒，已累加到总时长`);
        }
      }

      await recordRepository.update({ id: existing.id }, { status: RENTAL_RECORD_STATUS_CANCELED });

      await inventoryRepository.update(existing.inventoryId, {
        status: AssetInventoryStatus.AVAILABLE,
        lesseeId: null as unknown as string,
        orderId: null as unknown as string,
        orderNo: null as unknown as string,
        boundAt: null as unknown as Date,
        unboundAt: new Date(),
      });

      this.logger.log(`订单 ${orderId} 已解绑资产实例 ${existing.inventoryId}`);
      return true;
    };

    if (manager) {
      return doUnbind(manager);
    }
    return this.dataSource.transaction(doUnbind);
  }

  /**
   * 强制解绑资产实例（出租方操作）
   *
   * 规则：
   * 1. 仅实例归属人（lessorId）可操作
   * 2. 若存在进行中的租赁（租赁记录 status=renting 且订单未终态），则不允许解绑
   * 3. 订单已终态（COMPLETED/CANCELED/CLOSED）或租赁记录异常时，允许解绑并清理实例绑定与租赁记录
   * 4. 解绑时累加本次租赁时长到 totalRentalDuration，并将租赁记录置为 canceled
   */
  async forceUnbind(inventoryId: string, userId: string): Promise<void> {
    // 1. 查找实例并校验归属
    const inventory = await this.inventoryRepo.findById(inventoryId);
    if (!inventory) {
      throw new NotFoundException('资产实例不存在');
    }
    if (inventory.lessorId !== userId) {
      throw new ForbiddenException('无权操作此资产实例');
    }

    // 2. 未绑定则直接成功（幂等）
    const isBound =
      inventory.status === AssetInventoryStatus.RENTED || inventory.orderId != null || inventory.lesseeId != null;
    if (!isBound) {
      this.logger.log(`资产实例 ${inventoryId} 未绑定订单，无需解绑`);
      return;
    }

    // 3. 查当前租赁中的绑定记录
    const recordRepo = this.dataSource.getRepository(AssetInventoryRentalRecordEntity);
    const rentingRecord = await recordRepo.findOne({
      where: { inventoryId, status: RENTAL_RECORD_STATUS_RENTING },
    });

    // 4. 若存在租赁中记录，校验关联订单是否已终态
    if (rentingRecord) {
      const order = await this.orderRepo.findOne({
        where: { id: rentingRecord.orderId },
        select: ['id', 'status'],
      });
      const orderEndStates = [RentalOrderStatus.COMPLETED, RentalOrderStatus.CANCELED, RentalOrderStatus.CLOSED];
      if (order && !orderEndStates.includes(order.status)) {
        throw new BadRequestException('存在进行中的租赁，无法解绑。请待订单完成、取消或关闭后再操作');
      }
    }

    // 5. 在事务内执行解绑：租赁记录置为 canceled、累加租赁时长、实例恢复可用
    await this.dataSource.transaction(async manager => {
      const emRecordRepo = manager.getRepository(AssetInventoryRentalRecordEntity);
      const emInventoryRepo = manager.getRepository(AssetInventoryEntity);

      if (rentingRecord) {
        await emRecordRepo.update({ id: rentingRecord.id }, { status: RENTAL_RECORD_STATUS_CANCELED });
      }

      const currentInventory = await emInventoryRepo.findOne({
        where: { id: inventoryId },
        select: ['id', 'boundAt', 'totalRentalDuration'],
      });
      if (currentInventory?.boundAt) {
        const unbindTime = new Date();
        const boundTime = new Date(currentInventory.boundAt);
        const rentalDuration = Math.floor((unbindTime.getTime() - boundTime.getTime()) / 1000);
        if (rentalDuration > 0) {
          await emInventoryRepo.increment({ id: inventoryId }, 'totalRentalDuration', rentalDuration);
          this.logger.log(`强制解绑：实例 ${inventoryId} 本次租赁时长 ${rentalDuration} 秒已累加到总时长`);
        }
      }

      await emInventoryRepo.update(inventoryId, {
        status: AssetInventoryStatus.AVAILABLE,
        lesseeId: null as unknown as string,
        orderId: null as unknown as string,
        orderNo: null as unknown as string,
        boundAt: null as unknown as Date,
        unboundAt: new Date(),
      });
    });

    this.logger.log(`强制解绑成功: 资产实例 ${inventoryId}`);
  }

  /**
   * 转换资产实例为输出DTO
   */
  public transformToOutput(inventory: AssetInventoryEntity): OutputAssetInventoryDto {
    const plain = plainToInstance(OutputAssetInventoryDto, inventory, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
    plain.images = inventory.images?.map(image => this.ossService.getSignatureUrl(image));
    if (plain.lessee) {
      plain.lessee.avatar = this.ossService.getSignatureUrl(plain.lessee.avatar);
    }
    return plain;
  }

  /**
   * 构建订单完结时的资产实例快照
   *
   * 用于订单完成后持久化保存，不包含 order 字段，避免循环引用。
   * 包含：实例编号、实例名称、实例图片、实例状态、实例状态标签、实例属性、资产简要信息等。
   *
   * @param inventory 资产实例实体（需加载 asset 关系以包含资产简要信息）
   */
  public buildSnapshotForOrderComplete(
    inventory: AssetInventoryEntity,
  ): Omit<OutputAssetInventoryDto, 'order'> & { order?: never } {
    const dto = this.transformToOutput(inventory);
    const { order: _order, ...snapshot } = dto;
    return snapshot;
  }
}
