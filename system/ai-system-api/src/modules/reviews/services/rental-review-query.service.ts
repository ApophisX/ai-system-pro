import { Injectable } from '@nestjs/common';
import { RentalReviewRepository } from '../repositories';
import {
  QueryRentalReviewDto,
  QueryRentalReviewAdminDto,
  OutputRentalReviewDto,
  OutputRentalReviewAdminDto,
  OutputRentalReviewSummaryDto,
} from '../dto';
import { plainToInstance } from 'class-transformer';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';
import { RentalReviewStatus, RentalReviewStatusLabel } from '../enums';
import { OssService } from '@/modules/base/aliyun-oss/oss.service';

/**
 * 对称昵称：保留首位，其余用 * 替代
 * 如：张三 -> 张*，李四五 -> 李**
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
 * 租赁评价查询服务
 *
 * 资产评价列表、评价汇总、公开展示
 */
@Injectable()
export class RentalReviewQueryService {
  constructor(
    private readonly reviewRepo: RentalReviewRepository,
    private readonly ossService: OssService,
  ) {}

  /**
   * 分页查询资产评价列表（公开，仅 APPROVED）
   */
  async getList(dto: QueryRentalReviewDto): Promise<{
    data: OutputRentalReviewDto[];
    meta: PaginationMetaDto;
  }> {
    const meta = new PaginationMetaDto(dto.page, dto.pageSize);

    const status = dto.status ?? RentalReviewStatus.APPROVED;
    const [reviews, total] = await this.reviewRepo.findApprovedByAssetId({
      assetId: dto.assetId,
      status,
      scoreRange: dto.scoreRange,
      skip: meta.skip,
      take: meta.pageSize,
    });

    const data = reviews.map(r => {
      const nickname = r.lessee?.username ? maskNickname(r.lessee?.profile?.nickname) : null;
      const masked = maskNickname(nickname);
      const plain = plainToInstance(OutputRentalReviewDto, r, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      });
      plain.lesseeNickname = masked;
      plain.lessee.avatar = this.ossService.getSignatureUrl(r.lessee.avatar);
      plain.images = r.images?.map(url => this.ossService.getSignatureUrl(url));
      return plain;
    });

    meta.total = total;

    return { data, meta };
  }

  /**
   * 后台分页查询评价列表（支持全状态、多条件筛选，用于审核与查看）
   */
  async getAdminList(dto: QueryRentalReviewAdminDto): Promise<{
    data: OutputRentalReviewAdminDto[];
    meta: PaginationMetaDto;
  }> {
    const meta = new PaginationMetaDto(dto.page, dto.pageSize);

    const [reviews, total] = await this.reviewRepo.findAdminList({
      status: dto.status,
      assetId: dto.assetId,
      lessorId: dto.lessorId,
      scoreRange: dto.scoreRange,
      keyword: dto.keyword,
      skip: meta.skip,
      take: meta.pageSize,
    });

    const data = reviews.map(r => {
      const lesseeNickname = r.lessee?.profile?.nickname?.trim() || r.lessee?.username || '匿**';
      const plain = plainToInstance(OutputRentalReviewAdminDto, r, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      });
      plain.statusLabel = RentalReviewStatusLabel[r.status] ?? r.status;
      plain.lesseeNickname = lesseeNickname;
      plain.images = r.images?.map(url => this.ossService.getSignatureUrl(url)) ?? [];
      if (plain.lessee && r.lessee?.avatar) {
        plain.lessee.avatar = this.ossService.getSignatureUrl(r.lessee.avatar);
      }
      if (plain.lessor && r.lessor?.avatar) {
        plain.lessor.avatar = this.ossService.getSignatureUrl(r.lessor.avatar);
      }
      return plain;
    });

    meta.total = total;

    return { data, meta };
  }

  /**
   * 获取资产评价汇总（已通过审核的统计）
   */
  async getSummary(assetId: string): Promise<OutputRentalReviewSummaryDto> {
    const stats = await this.reviewRepo.getAssetReviewStats(assetId);

    return plainToInstance(OutputRentalReviewSummaryDto, {
      reviewCount: stats.reviewCount,
      avgScore: stats.avgScore,
      scoreDistribution: {
        1: stats.score1Count,
        2: stats.score2Count,
        3: stats.score3Count,
        4: stats.score4Count,
        5: stats.score5Count,
      },
    });
  }
}
