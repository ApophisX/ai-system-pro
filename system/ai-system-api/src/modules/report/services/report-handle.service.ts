import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReportRepository } from '../repositories';
import { ReportSpecificationEntity } from '../entities';
import { AssetRepository } from '@/modules/asset/repositories';
import { AssetEntity } from '@/modules/asset/entities';
import { HandleReportDto } from '../dto';
import { ReportStatus, ReportHandleResult } from '../enums';
import { AssetAuditStatus, AssetStatus } from '@/modules/asset/enums';

/**
 * 举报处理服务
 *
 * 后台审核：通过/驳回/标记恶意举报
 * 举报成立时可选择下架资产
 */
@Injectable()
export class ReportHandleService {
  private readonly logger = new Logger(ReportHandleService.name);

  constructor(
    private readonly reportRepo: ReportRepository,
    private readonly assetRepo: AssetRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 处理举报
   */
  async handle(reportId: number, handlerId: string, dto: HandleReportDto): Promise<void> {
    const report = await this.reportRepo.findByIdSimple(reportId);

    if (report.status !== ReportStatus.PENDING) {
      throw new BadRequestException('仅待处理的举报可操作');
    }

    switch (dto.action) {
      case ReportHandleResult.APPROVE:
        await this.approve(reportId, handlerId, dto.remark);
        break;
      case ReportHandleResult.REJECT:
        await this.reject(reportId, handlerId, dto.remark);
        break;
      case ReportHandleResult.MARK_MALICIOUS:
        await this.markMalicious(reportId, handlerId, dto.remark);
        break;
      default:
        throw new BadRequestException('未知的处理动作');
    }
  }

  /**
   * 举报成立
   * 更新举报状态并下架资产，在同一事务内完成
   */
  private async approve(reportId: number, handlerId: string, remark?: string): Promise<void> {
    await this.approveAndOfflineAsset(reportId, handlerId, remark);
    this.logger.log(`举报成立: reportId=${reportId}`);
  }

  /**
   * 举报驳回
   */
  private async reject(reportId: number, handlerId: string, remark?: string): Promise<void> {
    await this.reportRepo.update(reportId, {
      status: ReportStatus.REJECTED,
      handleResult: ReportHandleResult.REJECT,
      handlerId,
      handledAt: new Date(),
      remark,
    });

    this.logger.log(`举报驳回: reportId=${reportId}`);
  }

  /**
   * 标记恶意举报
   */
  private async markMalicious(reportId: number, handlerId: string, remark?: string): Promise<void> {
    await this.reportRepo.update(reportId, {
      status: ReportStatus.REJECTED,
      handleResult: ReportHandleResult.MARK_MALICIOUS,
      handlerId,
      handledAt: new Date(),
      remark,
    });

    this.logger.log(`标记恶意举报: reportId=${reportId}`);
  }

  /**
   * 举报成立并下架资产（管理端可选操作）
   */
  async approveAndOfflineAsset(reportId: number, handlerId: string, remark?: string): Promise<void> {
    const report = await this.reportRepo.findByIdSimple(reportId);

    if (report.status !== ReportStatus.PENDING) {
      throw new BadRequestException('仅待处理的举报可操作');
    }

    await this.dataSource.transaction(async manager => {
      // 1. 更新举报状态
      await manager.update(ReportSpecificationEntity, reportId, {
        status: ReportStatus.APPROVED,
        handleResult: ReportHandleResult.APPROVE,
        handlerId,
        handledAt: new Date(),
        remark,
      });

      // 2. 下架资产
      const asset = await manager.findOne(AssetEntity, { where: { id: report.assetId } });
      if (asset && asset.status === AssetStatus.AVAILABLE) {
        await manager.update(AssetEntity, report.assetId, {
          status: AssetStatus.OFFLINE,
          auditStatus: AssetAuditStatus.PENDING,
        });
      }
    });

    this.logger.log(`举报成立并下架资产: reportId=${reportId}, assetId=${report.assetId}`);
  }
}
