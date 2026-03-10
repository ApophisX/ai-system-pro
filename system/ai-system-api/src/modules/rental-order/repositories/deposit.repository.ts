import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository, FindOptionsWhere, FindOneOptions, QueryDeepPartialEntity } from 'typeorm';
import { DepositEntity } from '../entities/deposit.entity';
import { DepositStatus } from '../enums';
import { RentalOrderUsageStatus } from '../enums/rental-order-usage-status.enum';

export interface LesseeDepositSummaryRow {
  frozenDepositTotal: string;
  deductedTotal: string;
  refundedTotal: string;
  releasableAmount: string;
  orderCount: string; // 订单数量：已支付和已冻结的订单数量
}

/**
 * 押金仓储
 */
@Injectable()
export class DepositRepository extends Repository<DepositEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(DepositEntity, dataSource.createEntityManager());
  }

  /**
   * 根据 ID 查找押金
   */
  async findById(id: string, options?: FindOneOptions<DepositEntity>): Promise<DepositEntity> {
    const deposit = await this.findOne({
      ...options,
      where: { ...options?.where, id },
      relations: {
        rentalOrder: true,
        user: true,
        deductions: true,
        ...options?.relations,
      },
    });
    if (!deposit) {
      throw new NotFoundException('押金记录不存在');
    }
    return deposit;
  }

  /**
   * 根据押金单号查找押金
   */
  async findByDepositNo(depositNo: string, options?: FindOneOptions<DepositEntity>): Promise<DepositEntity> {
    const deposit = await this.findOne({
      ...options,
      where: { ...options?.where, depositNo },
      relations: {
        rentalOrder: true,
        user: true,
        deductions: true,
        ...options?.relations,
      },
    });
    if (!deposit) {
      throw new NotFoundException('押金记录不存在');
    }
    return deposit;
  }

  /**
   * 根据订单 ID 查找押金
   */
  async findByOrderId(orderId: string): Promise<DepositEntity | null> {
    return this.findOne({
      where: { orderId },
      relations: ['rentalOrder', 'user', 'deductions'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据用户 ID 查找押金列表
   */
  async findByUserId(userId: string, skip?: number, take?: number): Promise<[DepositEntity[], number]> {
    return this.findAndCount({
      where: { userId },
      relations: ['rentalOrder', 'user', 'deductions'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  /**
   * 根据用户 ID 查找押金列表（含订单关系，用于承租方押金汇总计算）
   * @deprecated 使用 findByUserIdSummary 在数据库层聚合，性能更优
   */
  async findByUserIdWithOrder(userId: string): Promise<DepositEntity[]> {
    return this.find({
      where: { userId },
      relations: ['rentalOrder'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 承租方押金汇总（SQL 聚合，一次查询返回全部汇总数据）
   *
   * 在数据库层完成聚合，减少内存占用与网络传输
   */
  async findByUserIdSummary(userId: string): Promise<LesseeDepositSummaryRow> {
    const frozenStatuses = [DepositStatus.FROZEN, DepositStatus.PAID, DepositStatus.PARTIAL_DEDUCTED];
    const refundedStatuses = [DepositStatus.RETURNED, DepositStatus.UNFROZEN];

    const result = await this.createQueryBuilder('d')
      .leftJoin('d.rentalOrder', 'ro')
      .where('d.userId = :userId', { userId })
      .select(
        `COALESCE(SUM(CASE WHEN d.status IN (:...frozenStatuses) THEN d.remaining_amount ELSE 0 END), 0)`,
        'frozenDepositTotal',
      )
      .addSelect(`COALESCE(SUM(d.deducted_amount), 0)`, 'deductedTotal')
      .addSelect(
        `COALESCE(SUM(CASE WHEN d.status IN (:...refundedStatuses) THEN d.remaining_amount ELSE 0 END), 0)`,
        'refundedTotal',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN d.status IN (:...frozenStatuses) AND ro.useage_status = :returnedStatus THEN d.remaining_amount ELSE 0 END), 0)`,
        'releasableAmount',
      )
      .addSelect(`COUNT(DISTINCT CASE WHEN d.status IN (:...frozenStatuses) THEN d.order_id END)`, 'orderCount')
      .setParameters({
        frozenStatuses,
        refundedStatuses,
        returnedStatus: RentalOrderUsageStatus.RETURNED,
      })
      .getRawOne<LesseeDepositSummaryRow>();

    return (
      result ?? {
        frozenDepositTotal: '0',
        deductedTotal: '0',
        refundedTotal: '0',
        releasableAmount: '0',
        orderCount: '0',
      }
    );
  }

  /**
   * 根据条件查找押金列表
   */
  async findMany(
    where: FindOptionsWhere<DepositEntity>,
    skip: number = 0,
    take: number = 0,
  ): Promise<[DepositEntity[], number]> {
    return this.findAndCount({
      where,
      relations: ['rentalOrder', 'user', 'deductions'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  /**
   * 更新押金状态
   */
  async updateStatus(id: string, status: DepositStatus, data?: QueryDeepPartialEntity<DepositEntity>): Promise<void> {
    await this.update(id, { status, ...data });
  }
}
