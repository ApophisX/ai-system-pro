import { Injectable } from '@nestjs/common';
import { ReportRepository } from '../repositories';
import { AppQueryReportDto, AdminQueryReportDto, OutputReportDto } from '../dto';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';
import { plainToInstance } from 'class-transformer';
import { OssService } from '@/modules/base/aliyun-oss/oss.service';

/**
 * 对称昵称：保留首位，其余用 * 替代
 */
function maskNickname(nickname: string | null | undefined): string {
  if (!nickname || typeof nickname !== 'string') {
    return '匿**';
  }
  const trimmed = nickname.trim();
  if (trimmed.length === 0) return '匿**';
  if (trimmed.length === 1) return trimmed + '*';
  return trimmed[0] + '*'.repeat(Math.min(trimmed.length - 1, 2));
}

/**
 * 举报查询服务
 *
 * 用户端：查询自己的举报列表
 * 管理端：分页查询举报列表
 */
@Injectable()
export class ReportQueryService {
  constructor(
    private readonly reportRepo: ReportRepository,
    private readonly ossService: OssService,
  ) {}

  /**
   * 用户端：查询自己的举报列表
   */
  async getMyList(
    reporterId: string,
    dto: AppQueryReportDto,
  ): Promise<{ data: OutputReportDto[]; meta: PaginationMetaDto }> {
    const meta = new PaginationMetaDto(dto.page ?? 0, dto.pageSize ?? 20);

    const [reports, total] = await this.reportRepo.findByReporterId({
      reporterId,
      assetId: dto.assetId,
      reason: dto.reason,
      status: dto.status,
      skip: meta.skip,
      take: meta.pageSize,
    });

    const data = reports.map(r =>
      plainToInstance(OutputReportDto, {
        ...r,
        assetName: r.asset?.name,
      }),
    );

    meta.total = total;
    return { data, meta };
  }

  /**
   * 管理端：分页查询举报列表
   */
  async getAdminList(dto: AdminQueryReportDto): Promise<{ data: OutputReportDto[]; meta: PaginationMetaDto }> {
    const meta = new PaginationMetaDto(dto.page ?? 0, dto.pageSize ?? 20);

    const [reports, total] = await this.reportRepo.findForAdmin({
      reporterId: dto.reporterId,
      assetId: dto.assetId,
      reason: dto.reason,
      status: dto.status,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      skip: meta.skip,
      take: meta.pageSize,
    });

    const data = reports.map(r => {
      const reporterNickname = r.reporter?.profile?.nickname
        ? maskNickname(r.reporter.profile.nickname)
        : maskNickname(r.reporter?.username);
      return plainToInstance(OutputReportDto, {
        ...r,
        reporterNickname,
        images: r.images?.map(url => this.ossService.getSignatureUrl(url)),
        assetName: r.asset?.name,
      });
    });

    meta.total = total;
    return { data, meta };
  }

  /**
   * 管理端：获取举报详情
   */
  async getById(id: number): Promise<OutputReportDto> {
    const report = await this.reportRepo.findById(id);
    const reporterNickname = report.reporter?.profile?.nickname
      ? maskNickname(report.reporter.profile.nickname)
      : maskNickname(report.reporter?.username);
    return plainToInstance(OutputReportDto, {
      ...report,
      reporterNickname,
      assetName: report.asset?.name,
    });
  }
}
