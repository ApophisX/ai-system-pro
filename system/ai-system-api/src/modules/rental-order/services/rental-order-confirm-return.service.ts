import { Injectable, Logger, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource, QueryDeepPartialEntity } from 'typeorm';
import { RentalOrderRepository } from '../repositories';
import { OutputRentalOrderDto, ConfirmReturnAssetDto } from '../dto';
import { RentalOrderSupportService } from './rental-order-support.service';
import {
  EvidenceAuditStatus,
  EvidenceSubmitterType,
  EvidenceType,
  RentalOrderUsageStatus,
  RentalOrderUsageStatusLabel,
  RentalOrderStatus,
} from '../enums';
import { RentalOrderEntity, RentalOrderEvidenceEntity } from '../entities';
import { RentalOrderJobService } from '../jobs/services';
import { AssetInventoryService } from '@/modules/asset/services/asset-inventory.service';
import { MessageNotificationService } from '@/modules/base/message/services';
import { CreditEvents } from '@/modules/credit/events/credit.events';
import { CreditActorRole } from '@/modules/credit/enums';
import dayjs from 'dayjs';

/**
 * 出租方确认归还资产服务
 *
 * 业务流程：
 * 1. 校验用户必须是出租方
 * 2. 校验订单使用状态必须为「已归还待确认」（RETURNED_PENDING）
 * 3. 确认归还：
 *    - 更新订单使用状态为「已归还」（RETURNED）
 *    - 记录归还确认时间（returnedConfirmedAt）
 *    - 创建出租方确认归还证据（凭证图片和说明）
 *    - 取消24小时自动确认归还的超时任务
 *    - 解绑资产实例
 * 4. 拒绝归还：
 *    - 更新订单主状态为「争议中」（DISPUTE）
 *    - 更新订单使用状态为「拒绝归还」（REJECTED）
 *    - 创建出租方拒绝归还证据（必须提供拒绝原因和凭证）
 *    - 取消24小时自动确认归还的超时任务
 *
 * 前置条件：
 * - 订单使用状态为 RETURNED_PENDING（已归还待确认）
 * - 当前用户为出租方
 *
 * 后置状态：
 * - 确认归还：订单使用状态变为 RETURNED（已归还）
 * - 拒绝归还：订单主状态变为 DISPUTE（争议中），使用状态变为 REJECTED
 */
@Injectable()
export class RentalOrderConfirmReturnService {
  private readonly logger = new Logger(RentalOrderConfirmReturnService.name);

  constructor(
    private readonly orderRepo: RentalOrderRepository,
    private readonly support: RentalOrderSupportService,
    private readonly dataSource: DataSource,
    private readonly rentalOrderJobService: RentalOrderJobService,
    private readonly assetInventoryService: AssetInventoryService,
    private readonly messageNotificationService: MessageNotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * 出租方确认归还资产
   *
   * @param lessorId 出租方用户ID
   * @param orderId 订单ID
   * @param dto 确认归还资产请求DTO
   * @returns 更新后的订单信息
   */
  async confirmReturn(lessorId: string, orderId: string, dto: ConfirmReturnAssetDto): Promise<OutputRentalOrderDto> {
    // 1. 查询订单（需包含 payments、assetSnapshot、rentalPlanSnapshot）
    const order = await this.orderRepo.findById(orderId, {
      relations: { payments: true, assetSnapshot: true, rentalPlanSnapshot: true },
    });

    // 2. 权限校验：必须是出租方
    if (order.lessorId !== lessorId) {
      throw new ForbiddenException('只有出租方可以确认归还资产');
    }

    // 3. 幂等性校验：尚未确认归还
    if (order.useageStatus === RentalOrderUsageStatus.RETURNED) {
      throw new ConflictException('订单已确认归还，请勿重复操作');
    }

    // 4. 状态校验：订单使用状态必须是已归还待确认
    if (order.useageStatus !== RentalOrderUsageStatus.RETURNED_PENDING) {
      throw new BadRequestException(
        `仅「已归还待确认」状态的订单可确认归还，当前订单使用状态为「${RentalOrderUsageStatusLabel[order.useageStatus] || order.useageStatus}」`,
      );
    }

    // 5. 根据确认/拒绝分别处理
    if (dto.confirmed) {
      return this.handleConfirmReturn(order, lessorId, dto);
    } else {
      return this.handleRejectReturn(order, lessorId, dto);
    }
  }

  /**
   * 处理确认归还
   */
  private async handleConfirmReturn(
    order: RentalOrderEntity,
    lessorId: string,
    dto: ConfirmReturnAssetDto,
  ): Promise<OutputRentalOrderDto> {
    // 在事务中完成：更新订单状态、归还确认时间、创建证据
    await this.dataSource.transaction(async manager => {
      const now = new Date();

      // 更新订单：使用状态、归还确认时间、逾期状态清零（见 RentalOrderOverdueStatus 注释）
      const updateData: QueryDeepPartialEntity<RentalOrderEntity> = {
        useageStatus: RentalOrderUsageStatus.RETURNED, // 使用状态：已归还
        returnedConfirmedAt: now, // 归还完成时间记录为确认时间（用于流程审计）
        actualReturnedAt: dayjs(dto.actualReturnedAt).toDate(), // 实际归还时间
        inventoryUnboundAt: now, // 资产实例解绑时间
      };

      await manager.update(RentalOrderEntity, order.id, updateData);

      // 创建出租方确认归还证据（凭证图片和说明）
      const evidence = manager.getRepository(RentalOrderEvidenceEntity).create({
        rentalOrderId: order.id,
        rentalOrderNo: order.orderNo,
        submitterId: lessorId,
        submitterType: EvidenceSubmitterType.LESSOR,
        evidenceType: EvidenceType.ASSET_RETURN_CONFIRM,
        evidenceUrls: dto.evidenceUrls,
        description: dto.description || '出租方确认归还资产',
        relatedOrderStatus: RentalOrderUsageStatus.RETURNED, // 变更后的状态：IN_USE -> RETURNED
        auditStatus: EvidenceAuditStatus.APPROVED, // 确认归还证据自动通过
      });
      await manager.save(RentalOrderEvidenceEntity, evidence);
      this.logger.log(
        `订单 ${order.orderNo} 出租方已确认归还，凭证已保存: evidenceUrlsCount=${dto.evidenceUrls?.length || 0}`,
      );

      // 解绑资产实例（若已绑定）
      await this.assetInventoryService.unbindFromOrder(order.id, manager);

      this.logger.log(
        `订单 ${order.orderNo} 出租方已确认归还，归还确认时间: ${dto.actualReturnedAt}，状态更新为 RETURNED`,
      );
    });

    // 取消24小时自动确认归还的超时任务和订单相关任务
    setImmediate(() => {
      this.rentalOrderJobService.cancelReturnConfirmTimeoutJob(order.id).catch(err => {
        this.logger.error(
          `取消归还确认超时任务失败: orderId=${order.id}, orderNo=${order.orderNo}, error=${err instanceof Error ? err.message : '未知错误'}`,
        );
      });
      // 取消订单相关任务（如逾期任务等）
      this.support.cancelOrderRelatedJobs(order.id);
    });

    // 发送归还确认消息通知出租方和承租方
    setImmediate(() => {
      this.messageNotificationService.notifyOrderReturnConfirmed(order).catch(err => {
        this.logger.error(`发送归还确认消息失败: orderNo=${order.orderNo}`, err);
      });
    });

    // 查询并返回更新后的订单
    const result = await this.orderRepo.findById(order.id, {
      relations: { payments: true, assetSnapshot: true, rentalPlanSnapshot: true },
    });
    return this.support.toOutputRentalOrderDto(result);
  }

  /**
   * 处理拒绝归还
   */
  private async handleRejectReturn(
    order: RentalOrderEntity,
    lessorId: string,
    dto: ConfirmReturnAssetDto,
  ): Promise<OutputRentalOrderDto> {
    // 校验拒绝时必须提供拒绝原因和凭证
    if (!dto.description || dto.description.trim().length === 0) {
      throw new BadRequestException('拒绝归还时必须填写拒绝原因');
    }

    // 在事务中完成：更新订单状态、创建证据
    await this.dataSource.transaction(async manager => {
      // 更新订单主状态为「争议中」，使用状态为「拒绝归还」
      await manager.update(RentalOrderEntity, order.id, {
        status: RentalOrderStatus.DISPUTE, // 订单主状态：争议中
        useageStatus: RentalOrderUsageStatus.REJECTED, // 使用状态：拒绝归还
      });

      // 创建出租方拒绝归还证据（必须提供拒绝原因和凭证）
      const evidence = manager.getRepository(RentalOrderEvidenceEntity).create({
        rentalOrderId: order.id,
        rentalOrderNo: order.orderNo,
        submitterId: lessorId,
        submitterType: EvidenceSubmitterType.LESSOR,
        evidenceUrls: dto.evidenceUrls,
        description: `出租方拒绝归还申请：${dto.description}`,
        evidenceType: EvidenceType.ASSET_RETURN_REJECT,
        relatedOrderStatus: RentalOrderUsageStatus.REJECTED, // 变更后的状态：IN_USE -> REJECTED
        auditStatus: EvidenceAuditStatus.PENDING, // 拒绝归还证据待平台审核
      });
      await manager.save(RentalOrderEvidenceEntity, evidence);

      this.logger.log(
        `订单 ${order.orderNo} 出租方已拒绝归还申请，订单进入争议状态，等待平台仲裁处理。拒绝原因: ${dto.description}, 凭证数量: ${dto.evidenceUrls?.length || 0}`,
      );
    });

    // 发射信用事件：进入争议（出租方为发起方，承租方同样记录）
    setImmediate(() => {
      this.eventEmitter.emit(CreditEvents.DISPUTE_OPENED, {
        userId: order.lessorId,
        actorRole: CreditActorRole.LESSOR,
        orderId: order.id,
        initiatorRole: CreditActorRole.LESSOR,
        operatorType: 'system',
      });
      this.eventEmitter.emit(CreditEvents.DISPUTE_OPENED, {
        userId: order.lesseeId,
        actorRole: CreditActorRole.LESSEE,
        orderId: order.id,
        initiatorRole: CreditActorRole.LESSOR,
        operatorType: 'system',
      });
    });

    // 取消24小时自动确认归还的超时任务和订单相关任务
    setImmediate(() => {
      this.rentalOrderJobService.cancelReturnConfirmTimeoutJob(order.id).catch(err => {
        this.logger.error(
          `取消归还确认超时任务失败: orderId=${order.id}, orderNo=${order.orderNo}, error=${err instanceof Error ? err.message : '未知错误'}`,
        );
      });
      // 取消订单相关任务（如逾期任务等）
      this.support.cancelOrderRelatedJobs(order.id);
    });

    // 发送归还申请被拒绝消息通知承租方
    setImmediate(() => {
      this.messageNotificationService.notifyOrderReturnRejected(order, dto.description ?? '无').catch(err => {
        this.logger.error(`发送归还拒绝消息失败: orderNo=${order.orderNo}`, err);
      });
    });

    // 查询并返回更新后的订单
    const result = await this.orderRepo.findById(order.id, {
      relations: { payments: true, assetSnapshot: true, rentalPlanSnapshot: true },
    });
    return this.support.toOutputRentalOrderDto(result);
  }
}
