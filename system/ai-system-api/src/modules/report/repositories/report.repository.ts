import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DataSource, MoreThanOrEqual, SelectQueryBuilder } from 'typeorm';
import { ReportSpecificationEntity } from '../entities';
import { ReportStatus } from '../enums';

export interface ReportQueryOptions {
  reporterId?: string;
  assetId?: string;
  reason?: string;
  status?: ReportStatus;
  startDate?: Date;
  endDate?: Date;
  skip: number;
  take: number;
}

@Injectable()
export class ReportRepository extends Repository<ReportSpecificationEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(ReportSpecificationEntity, dataSource.createEntityManager());
  }

  /**
   * 根据 ID 查找举报（管理端）
   */
  async findById(id: number): Promise<ReportSpecificationEntity> {
    const report = await this.findOne({
      where: { id },
      relations: { reporter: { profile: true }, asset: true },
    });
    if (!report) {
      throw new NotFoundException('举报记录不存在');
    }
    return report;
  }

  /**
   * 根据 ID 查找举报（简单，无关联）
   */
  async findByIdSimple(id: number): Promise<ReportSpecificationEntity> {
    const report = await this.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException('举报记录不存在');
    }
    return report;
  }

  /**
   * 统计用户 24 小时内对同一资产的举报次数
   */
  async countUserReportsForAssetIn24h(reporterId: string, assetId: string): Promise<number> {
    const since = new Date();
    since.setHours(since.getHours() - 24);

    return this.count({
      where: {
        reporterId,
        assetId,
        createdAt: MoreThanOrEqual(since),
      },
    });
  }

  /**
   * 统计同一资产 1 小时内的举报数量
   */
  async countAssetReportsIn1h(assetId: string): Promise<number> {
    const since = new Date();
    since.setHours(since.getHours() - 1);

    return this.count({
      where: {
        assetId,
        createdAt: MoreThanOrEqual(since),
      },
    });
  }

  /**
   * 分页查询举报列表（用户端：仅自己的）
   */
  async findByReporterId(options: ReportQueryOptions): Promise<[ReportSpecificationEntity[], number]> {
    const qb = this.createQueryBuilder('report')
      .leftJoinAndSelect('report.asset', 'asset')
      .where('report.reporterId = :reporterId', { reporterId: options.reporterId! })

      .orderBy('report.createdAt', 'DESC')
      .skip(options.skip)
      .take(options.take);

    this.applyReportFilters(qb, options);

    return qb.getManyAndCount();
  }

  /**
   * 分页查询举报列表（管理端）
   */
  async findForAdmin(options: ReportQueryOptions): Promise<[ReportSpecificationEntity[], number]> {
    const qb = this.createQueryBuilder('report')
      .leftJoinAndSelect('report.reporter', 'reporter')
      .leftJoinAndSelect('reporter.profile', 'profile')
      .leftJoinAndSelect('report.asset', 'asset')
      .orderBy('report.createdAt', 'DESC')
      .skip(options.skip)
      .take(options.take);

    this.applyReportFilters(qb, options);

    return qb.getManyAndCount();
  }

  private applyReportFilters(qb: SelectQueryBuilder<ReportSpecificationEntity>, options: ReportQueryOptions): void {
    if (options.reporterId) {
      qb.andWhere('report.reporterId = :reporterId', { reporterId: options.reporterId });
    }
    if (options.assetId) {
      qb.andWhere('report.assetId = :assetId', { assetId: options.assetId });
    }
    if (options.reason) {
      qb.andWhere('report.reason = :reason', { reason: options.reason });
    }
    if (options.status !== undefined) {
      qb.andWhere('report.status = :status', { status: options.status });
    }
    if (options.startDate) {
      qb.andWhere('report.createdAt >= :startDate', { startDate: options.startDate });
    }
    if (options.endDate) {
      qb.andWhere('report.createdAt <= :endDate', { endDate: options.endDate });
    }
  }
}
