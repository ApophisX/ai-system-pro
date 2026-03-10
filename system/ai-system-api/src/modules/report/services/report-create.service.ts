import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReportRepository } from '../repositories';
import { AssetRepository } from '@/modules/asset/repositories';
import { CreateReportDto, OutputReportDto } from '../dto';
import { ReportSpecificationEntity } from '../entities';
import { ReportStatus } from '../enums';
import { REPORT_LIMIT_PER_USER_PER_ASSET_24H, REPORT_LIMIT_PER_ASSET_PER_HOUR } from '../constants/report.constant';
import { plainToInstance } from 'class-transformer';

/**
 * 举报创建服务
 *
 * 用户提交举报，校验限流规则后写入 PENDING 状态
 */
@Injectable()
export class ReportCreateService {
  private readonly logger = new Logger(ReportCreateService.name);

  constructor(
    private readonly reportRepo: ReportRepository,
    private readonly assetRepo: AssetRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 用户提交举报
   */
  async create(reporterId: string, dto: CreateReportDto): Promise<OutputReportDto> {
    // 1. 校验资产存在（资产已删除时仍可受理，但需能查到资产 ID 的有效性）
    const asset = await this.assetRepo.findOne({ where: { id: dto.assetId } });
    if (!asset) {
      throw new BadRequestException('资产不存在或已删除');
    }

    // 2. 限流：同一用户 24 小时内对同一资产最多举报 3 次
    const userCount = await this.reportRepo.countUserReportsForAssetIn24h(reporterId, dto.assetId);
    if (userCount >= REPORT_LIMIT_PER_USER_PER_ASSET_24H) {
      throw new BadRequestException(
        `您对该资产的举报次数已达上限（24 小时内最多 ${REPORT_LIMIT_PER_USER_PER_ASSET_24H} 次），请明日再试`,
      );
    }

    // 3. 限流：同一资产 1 小时内最多 100 条举报
    const assetCount = await this.reportRepo.countAssetReportsIn1h(dto.assetId);
    if (assetCount >= REPORT_LIMIT_PER_ASSET_PER_HOUR) {
      throw new BadRequestException('该资产举报量较多，请稍后再试');
    }

    // 4. 事务内创建举报记录
    const report = await this.dataSource.transaction(async manager => {
      const entity = manager.create(ReportSpecificationEntity, {
        reporterId,
        assetId: dto.assetId,
        reason: dto.reason,
        description: dto.description,
        images: dto.images ?? [],
        status: ReportStatus.PENDING,
      });
      return manager.save(ReportSpecificationEntity, entity);
    });

    this.logger.log(`举报已创建: reportId=${report.id}, assetId=${dto.assetId}, reporterId=${reporterId}`);

    return plainToInstance(OutputReportDto, {
      id: report.id,
      assetId: report.assetId,
      reason: report.reason,
      description: report.description,
      images: report.images ?? [],
      status: report.status,
      createdAt: report.createdAt,
    });
  }
}
