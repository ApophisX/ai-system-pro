import { Injectable, Logger, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RentalOrderRepository } from '../repositories';
import { OutputRentalOrderDto, BindAssetInventoryDto, RebindAssetInventoryDto } from '../dto';
import { RentalOrderSupportService } from './rental-order-support.service';
import { AssetInventoryService } from '@/modules/asset/services/asset-inventory.service';
import { EvidenceAuditStatus, EvidenceSubmitterType, EvidenceType, RentalOrderStatus } from '../enums';
import { RentalOrderEntity, RentalOrderEvidenceEntity } from '../entities';
import { MessageNotificationService } from '@/modules/base/message/services';

/**
 * 租赁订单绑定资产实例服务
 *
 * 出租方在订单「待收货」状态下为订单绑定资产实例，便于发货与追溯
 * 绑定成功后订单进入「使用中」状态，开始租赁计时
 */
@Injectable()
export class RentalOrderBindInventoryService {
  private readonly logger = new Logger(RentalOrderBindInventoryService.name);

  constructor(
    private readonly orderRepo: RentalOrderRepository,
    private readonly support: RentalOrderSupportService,
    private readonly assetInventoryService: AssetInventoryService,
    private readonly dataSource: DataSource,
    private readonly messageNotificationService: MessageNotificationService,
  ) {}

  /**
   * 绑定资产实例
   *
   * 业务流程：
   * 1. 校验订单状态必须为 PAID（待收货）
   * 2. 校验用户权限（必须是出租方）
   * 3. 在事务中完成：
   *    - 绑定资产实例（资产状态变为租赁中）
   *    - 更新订单状态为 IN_USE（使用中）
   *    - 记录交付时间（deliveredAt）
   * 4. 返回更新后的订单
   *
   * 前置条件：
   * - 订单状态为 PAID（待收货）
   * - 当前用户为出租方
   * - 所选实例属于订单资产且状态为可用
   *
   * 后置状态：
   * - 订单状态变为 IN_USE（使用中）
   * - 资产实例状态变为 RENTED（租赁中）
   * - 记录交付时间，开始租赁计时
   */
  async bindAssetInventory(
    lessorId: string,
    orderId: string,
    dto: BindAssetInventoryDto,
  ): Promise<OutputRentalOrderDto> {
    // 1. 查询订单并校验基本信息
    const order = await this.orderRepo.findById(orderId);

    // 2. 权限校验：必须是出租方
    if (order.lessorId !== lessorId) {
      throw new ForbiddenException('只有出租方可以为订单绑定资产实例');
    }

    // 3. 状态校验：订单必须是待收货状态
    if (!order.isPendingReceipt) {
      throw new BadRequestException(`仅「待收货」状态的订单可绑定资产实例，当前订单状态为「${order.statusLabel}」`);
    }

    // 4. 业务逻辑校验：确保订单已支付
    if (!order.paidAt) {
      throw new BadRequestException('订单尚未支付，无法绑定资产实例');
    }

    // 5 校验订单是否已绑定资产实例
    if (order.inventoryId) {
      throw new BadRequestException('订单已绑定资产实例，无法重复绑定');
    }

    // 6. 在事务中完成：行锁订单 → 锁后重校验 → 绑定 → 更新订单
    await this.dataSource.transaction(async manager => {
      const orderRepository = manager.getRepository(RentalOrderEntity);

      // 6.1 行锁订单，防止同一订单并发绑定不同实例产生双 renting 记录
      const lockedOrder = await orderRepository.findOne({
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!lockedOrder) {
        throw new BadRequestException('订单不存在');
      }

      // 6.2 锁后基于 lockedOrder 重新校验，避免状态漂移
      if (!lockedOrder.isPendingReceipt) {
        throw new BadRequestException(
          `仅「待收货」状态的订单可绑定资产实例，当前订单状态为「${lockedOrder.statusLabel}」`,
        );
      }
      if (!lockedOrder.paidAt) {
        throw new BadRequestException('订单尚未支付，无法绑定资产实例');
      }
      if (lockedOrder.inventoryId) {
        throw new BadRequestException('订单已绑定资产实例，无法重复绑定');
      }

      // 6.3 绑定资产实例（资产状态变为租赁中，租赁次数+1）
      await this.assetInventoryService.bindToOrder(lockedOrder, dto.inventoryId, lessorId, manager);

      // 6.4 更新订单状态为使用中，并记录交付时间
      const now = new Date();
      await orderRepository.update(orderId, {
        deliveredAt: now,
        inventoryId: dto.inventoryId,
      });

      // 6.5 记录绑定证据
      const evidence = manager.getRepository(RentalOrderEvidenceEntity).create({
        rentalOrderId: lockedOrder.id,
        rentalOrderNo: lockedOrder.orderNo,
        submitterId: lessorId,
        auditStatus: EvidenceAuditStatus.PENDING,
        submitterType: EvidenceSubmitterType.LESSOR,
        evidenceType: EvidenceType.ASSET_DELIVERY,
        evidenceUrls: dto.evidenceUrls,
        description: dto.description,
        relatedOrderStatus: lockedOrder.useageStatus,
      });
      await manager.save(RentalOrderEvidenceEntity, evidence);
      this.logger.log(
        `订单 ${lockedOrder.orderNo} 绑定资产实例 ${dto.inventoryId} 成功，` +
          `订单状态: PAID → IN_USE，交付时间: ${now.toISOString()}`,
      );
    });

    // 7. 查询并返回更新后的订单
    const updated = await this.orderRepo.findById(orderId);

    // 8. 发送资产实例绑定消息通知承租方
    await this.messageNotificationService.notifyAssetInventoryBound(updated, dto.inventoryId);

    return this.support.toOutputRentalOrderDto(updated);
  }

  /**
   * 换绑资产实例
   *
   * 业务流程：
   * 1. 校验订单状态（已绑定且处于可换绑状态）
   * 2. 校验用户权限（必须是出租方）
   * 3. 在事务内：行锁订单 → 执行换绑 → 更新订单 inventoryId
   * 4. 发送换绑通知给承租方
   *
   * 注意事项：
   * - 换绑不改变订单状态
   * - 订单必须已绑定实例（inventoryId 存在）才能换绑
   * - 可换绑状态：订单未终态（非 COMPLETED/CANCELED/CLOSED）
   *
   * 前置条件：
   * - 订单已绑定过资产实例（inventoryId 存在）
   * - 订单处于可换绑状态（非已完成/已取消/已关闭）
   * - 当前用户为出租方
   * - 目标实例属于订单资产且状态为可用
   */
  async rebindAssetInventory(
    lessorId: string,
    orderId: string,
    dto: RebindAssetInventoryDto,
  ): Promise<OutputRentalOrderDto> {
    // 1. 查询订单并校验基本信息（非事务，仅做前置校验）
    const order = await this.orderRepo.findById(orderId);

    // 2. 权限校验：必须是出租方
    if (order.lessorId !== lessorId) {
      throw new ForbiddenException('只有出租方可以为订单换绑资产实例');
    }

    // 3. 校验：订单必须已绑定实例
    if (!order.inventoryId) {
      throw new BadRequestException('订单尚未绑定资产实例，请使用「绑定资产实例」接口');
    }

    // 4. 校验：订单处于可换绑状态（非终态）
    const validStatuses = [RentalOrderStatus.PENDING_RECEIPT, RentalOrderStatus.RECEIVED];
    if (!validStatuses.includes(order.status)) {
      throw new BadRequestException(
        `仅「待收货」或「使用中」等未终态订单可换绑资产实例，当前订单状态为「${order.statusLabel}」`,
      );
    }

    // 5. 在事务内完成：行锁订单 → 锁后重校验 → 换绑 → 更新订单 inventoryId
    await this.dataSource.transaction(async manager => {
      const orderRepo = manager.getRepository(RentalOrderEntity);

      // 5.1 行锁订单，防止并发换绑产生双 renting 记录
      const lockedOrder = await orderRepo.findOne({
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!lockedOrder) {
        throw new BadRequestException('订单不存在');
      }

      // 5.2 锁后基于 lockedOrder 重新校验，避免状态漂移窗口内被其他事务改为终态
      if (!lockedOrder.inventoryId) {
        throw new BadRequestException('订单尚未绑定资产实例，请使用「绑定资产实例」接口');
      }
      if (!validStatuses.includes(lockedOrder.status)) {
        throw new BadRequestException(`订单已处于终态「${lockedOrder.status}」，不可换绑`);
      }

      // 5.3 执行换绑（资产侧：解绑原实例、绑定新实例、写入换绑记录）
      await this.assetInventoryService.rebindOrder(lockedOrder, dto.inventoryId, lessorId, dto.reason, manager);

      // 5.4 同步更新订单的 inventoryId，避免数据漂移
      await orderRepo.update(orderId, { inventoryId: dto.inventoryId });

      // 5.5 若有换绑留痕图片，写入凭证记录用于追溯
      if (dto.evidenceUrls && dto.evidenceUrls.length > 0) {
        const evidence = manager.getRepository(RentalOrderEvidenceEntity).create({
          rentalOrderId: lockedOrder.id,
          rentalOrderNo: lockedOrder.orderNo,
          submitterId: lessorId,
          auditStatus: EvidenceAuditStatus.PENDING,
          submitterType: EvidenceSubmitterType.LESSOR,
          evidenceType: EvidenceType.ASSET_REBIND,
          evidenceUrls: dto.evidenceUrls,
          description: dto.description ?? dto.reason,
          relatedOrderStatus: lockedOrder.useageStatus,
        });
        await manager.save(RentalOrderEvidenceEntity, evidence);
      }

      this.logger.log(
        `订单 ${lockedOrder.orderNo} 换绑资产实例至 ${dto.inventoryId}，` +
          `订单状态保持: ${lockedOrder.status}，换绑原因: ${dto.reason || '无'}，留痕图片: ${dto.evidenceUrls?.length ?? 0} 张`,
      );
    });

    // 6. 查询并返回更新后的订单
    const updated = await this.orderRepo.findById(orderId);

    // 7. 发送换绑消息通知承租方
    await this.messageNotificationService.notifyAssetInventoryRebound(updated, dto.inventoryId);

    return this.support.toOutputRentalOrderDto(updated);
  }
}
