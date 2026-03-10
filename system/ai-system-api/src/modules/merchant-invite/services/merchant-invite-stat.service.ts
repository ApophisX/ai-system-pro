import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  MerchantInviteCodeRepository,
  MerchantInviteRelationRepository,
  MerchantInviteRewardRepository,
} from '../repositories';
import { MerchantInviteRelationStatus } from '../enums';
import { MerchantInviteRewardType, MerchantInviteRewardStatus } from '../enums';
import {
  OutputMyInviteCodeDto,
  OutputInviteRankItemDto,
  OutputMerchantInviteRelationDto,
  OutputMerchantInviteRewardDto,
} from '../dto/output-merchant-invite.dto';
import { MERCHANT_INVITE_CONFIG } from '../constants/merchant-invite.constant';
import { UserEntity } from '@/modules/base/user/entities/user.entity';
import { UserProfileEntity } from '@/modules/base/user/entities/user-profile.entity';
import { plainToInstance } from 'class-transformer';
import dayjs from 'dayjs';
import { PaginationMetaDto, PaginationQueryDto } from '@/common/dtos/base-query.dto';
import { QueryInviteRankDto, QueryMerchantInviteRewardDto } from '../dto/query-merchant-invite.dto';

/**
 * 商户邀请统计服务
 *
 * 负责：员工我的邀请码与统计、排行榜
 */
@Injectable()
export class MerchantInviteStatService {
  constructor(
    private readonly codeRepo: MerchantInviteCodeRepository,
    private readonly relationRepo: MerchantInviteRelationRepository,
    private readonly rewardRepo: MerchantInviteRewardRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 获取员工的邀请码与统计
   */
  async getMyInviteCode(employeeId: string): Promise<OutputMyInviteCodeDto> {
    const code = await this.codeRepo.findOrCreateByEmployeeId(employeeId);

    const [relations] = await this.relationRepo.findByEmployeeId(employeeId);

    const invitedCount = relations.length;
    const verifiedCount = relations.filter(r => r.status !== MerchantInviteRelationStatus.REGISTERED).length;
    const listedCount = relations.filter(
      r => r.status === MerchantInviteRelationStatus.LISTED || r.status === MerchantInviteRelationStatus.FIRST_ORDER,
    ).length;
    const firstOrderCount = relations.filter(r => r.status === MerchantInviteRelationStatus.FIRST_ORDER).length;

    const now = dayjs();
    const monthlyReleased = await this.rewardRepo.sumReleasedRebateByEmployeeAndMonth(
      employeeId,
      now.year(),
      now.month() + 1,
    );

    return {
      inviteCode: code.code,
      expireAt: code.expireAt,
      invitedCount,
      verifiedCount,
      listedCount,
      firstOrderCount,
      monthlyReleasedRebate: monthlyReleased,
      monthlyCap: MERCHANT_INVITE_CONFIG.REBATE_CAP_MONTHLY,
    };
  }

  /**
   * 员工：我的邀请列表
   */
  async getMyInvitations(
    employeeId: string,
    dto: PaginationQueryDto,
  ): Promise<{ data: OutputMerchantInviteRelationDto[]; meta: PaginationMetaDto }> {
    const meta = new PaginationMetaDto(dto.page, dto.pageSize);
    const [list, total] = await this.relationRepo.findByEmployeeId(employeeId, {
      skip: meta.skip,
      take: meta.pageSize,
    });
    meta.total = total;
    return {
      data: plainToInstance(OutputMerchantInviteRelationDto, list, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      }),
      meta,
    };
  }

  /**
   * 员工：我的奖励列表
   */
  async getMyRewards(
    employeeId: string,
    dto: QueryMerchantInviteRewardDto,
  ): Promise<{ data: OutputMerchantInviteRewardDto[]; meta: PaginationMetaDto }> {
    const meta = new PaginationMetaDto(dto.page, dto.pageSize);
    const [list, total] = await this.rewardRepo.findByEmployeeId(employeeId, {
      skip: meta.skip,
      take: meta.pageSize,
      type: dto.type,
      status: dto.status,
    });
    meta.total = total;
    return {
      data: plainToInstance(OutputMerchantInviteRewardDto, list, {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      }),
      meta,
    };
  }

  /**
   * 拓展排行榜
   */
  async getRankList(dto: QueryInviteRankDto): Promise<OutputInviteRankItemDto[]> {
    const year = dto.year ?? dayjs().year();
    const month = dto.month ?? dayjs().month() + 1;
    const limit = dto.limit ?? 20;

    let startDate: Date;
    let endDate: Date;

    switch (dto.period) {
      case 'monthly':
        startDate = dayjs()
          .year(year)
          .month(month - 1)
          .date(1)
          .toDate();
        endDate = dayjs()
          .year(year)
          .month(month - 1)
          .endOf('month')
          .toDate();
        break;
      case 'quarterly':
        {
          const q = Math.ceil(month / 3);
          startDate = dayjs()
            .year(year)
            .month((q - 1) * 3)
            .date(1)
            .toDate();
          endDate = dayjs()
            .year(year)
            .month(q * 3 - 1)
            .endOf('month')
            .toDate();
        }
        break;
      case 'yearly':
        startDate = dayjs().year(year).startOf('year').toDate();
        endDate = dayjs().year(year).endOf('year').toDate();
        break;
      default:
        startDate = dayjs()
          .year(year)
          .month(month - 1)
          .date(1)
          .toDate();
        endDate = dayjs()
          .year(year)
          .month(month - 1)
          .endOf('month')
          .toDate();
    }

    // 统计周期内：邀请数（created_at 在周期内）、首单数（first_order_at 在周期内）
    const qb = this.dataSource
      .createQueryBuilder()
      .select('r.employee_id', 'employeeId')
      .addSelect(
        `SUM(CASE WHEN r.created_at >= :startDate AND r.created_at <= :endDate THEN 1 ELSE 0 END)`,
        'invitedCount',
      )
      .addSelect(
        `SUM(CASE WHEN r.status = 'first_order' AND r.first_order_at >= :startDate AND r.first_order_at <= :endDate THEN 1 ELSE 0 END)`,
        'firstOrderCount',
      )
      .from('merchant_invite_relation', 'r')
      .where('r.deleted_at IS NULL')
      .setParameters({ startDate, endDate })
      .groupBy('r.employee_id')
      .orderBy('firstOrderCount', 'DESC')
      .addOrderBy('invitedCount', 'DESC')
      .limit(limit);

    const raw = await qb.getRawMany();

    const rewardSums = await this.dataSource
      .createQueryBuilder()
      .select('rw.employee_id', 'employeeId')
      .addSelect('COALESCE(SUM(rw.amount), 0)', 'totalReleasedRebate')
      .from('merchant_invite_reward', 'rw')
      .where('rw.type = :type', { type: MerchantInviteRewardType.REBATE })
      .andWhere('rw.status = :status', { status: MerchantInviteRewardStatus.RELEASED })
      .andWhere('rw.released_at >= :startDate', { startDate })
      .andWhere('rw.released_at <= :endDate', { endDate })
      .andWhere('rw.deleted_at IS NULL')
      .groupBy('rw.employee_id')
      .getRawMany();

    const rewardMap = new Map(rewardSums.map(r => [r.employeeId, Number(r.totalReleasedRebate)]));

    const employeeIds = raw.map(r => r.employeeId);
    const users =
      employeeIds.length > 0
        ? await this.dataSource.manager.find(UserEntity, {
            where: { id: employeeIds as any },
            relations: { profile: true },
          })
        : [];
    const userMap = new Map(users.map(u => [u.id, u]));

    return raw.map((r, i) => ({
      employeeId: r.employeeId,
      employeeName:
        (userMap.get(r.employeeId)?.profile as UserProfileEntity)?.nickname ||
        userMap.get(r.employeeId)?.username ||
        '未知',
      invitedCount: Number(r.invitedCount),
      firstOrderCount: Number(r.firstOrderCount),
      totalReleasedRebate: rewardMap.get(r.employeeId) ?? 0,
      rank: i + 1,
    }));
  }
}
