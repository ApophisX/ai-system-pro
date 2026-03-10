import { Injectable } from '@nestjs/common';
import { DataSource, Repository, Between } from 'typeorm';
import { MerchantInviteRewardEntity } from '../entities';
import { MerchantInviteRewardType, MerchantInviteRewardStatus } from '../enums';

@Injectable()
export class MerchantInviteRewardRepository extends Repository<MerchantInviteRewardEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(MerchantInviteRewardEntity, dataSource.createEntityManager());
  }

  async findByOrderIdAndType(
    orderId: string,
    type: MerchantInviteRewardType,
  ): Promise<MerchantInviteRewardEntity | null> {
    return this.findOne({ where: { relatedOrderId: orderId, type } });
  }

  async findByEmployeeId(
    employeeId: string,
    options?: { skip?: number; take?: number; type?: MerchantInviteRewardType; status?: MerchantInviteRewardStatus },
  ): Promise<[MerchantInviteRewardEntity[], number]> {
    const qb = this.createQueryBuilder('r')
      .where('r.employeeId = :employeeId', { employeeId })
      .orderBy('r.createdAt', 'DESC');
    if (options?.type) qb.andWhere('r.type = :type', { type: options.type });
    if (options?.status) qb.andWhere('r.status = :status', { status: options.status });
    if (options?.skip !== undefined) qb.skip(options.skip);
    if (options?.take !== undefined) qb.take(options.take);
    return qb.getManyAndCount();
  }

  /**
   * 统计员工某月已发放的 REBATE 总额（用于月度封顶校验）
   */
  async sumReleasedRebateByEmployeeAndMonth(employeeId: string, year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const result = await this.createQueryBuilder('r')
      .select('COALESCE(SUM(r.amount), 0)', 'total')
      .where('r.employeeId = :employeeId', { employeeId })
      .andWhere('r.type = :type', { type: MerchantInviteRewardType.REBATE })
      .andWhere('r.status = :status', { status: MerchantInviteRewardStatus.RELEASED })
      .andWhere('r.releasedAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .getRawOne();
    return Number(result?.total ?? 0);
  }

  /**
   * 查询待发放的 REBATE（7 天观察期后需处理）
   */
  async findPendingRebatesBefore(beforeDate: Date): Promise<MerchantInviteRewardEntity[]> {
    return this.find({
      where: {
        type: MerchantInviteRewardType.REBATE,
        status: MerchantInviteRewardStatus.PENDING,
        createdAt: Between(new Date(0), beforeDate),
      },
      order: { createdAt: 'ASC' },
    });
  }
}
