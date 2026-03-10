import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Between, In, LessThan } from 'typeorm';
import { WithdrawOrderEntity } from '../entities/withdraw-order.entity';
import { WithdrawOrderStatus, WithdrawChannel } from '../enums';

@Injectable()
export class WithdrawOrderRepository extends Repository<WithdrawOrderEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(WithdrawOrderEntity, dataSource.createEntityManager());
  }

  /**
   * 根据提现单号查询
   */
  async findByWithdrawNo(withdrawNo: string): Promise<WithdrawOrderEntity | null> {
    return this.findOne({ where: { withdrawNo } });
  }

  /**
   * 根据幂等键查询
   */
  async findByIdempotencyKey(idempotencyKey: string): Promise<WithdrawOrderEntity | null> {
    return this.findOne({ where: { idempotencyKey } });
  }

  /**
   * 根据商家 ID 查询提现订单列表
   */
  async findByMerchantId(
    merchantId: string,
    options?: { status?: WithdrawOrderStatus; withdrawChannel?: WithdrawChannel; skip?: number; take?: number },
  ): Promise<[WithdrawOrderEntity[], number]> {
    const where: { merchantId: string; status?: WithdrawOrderStatus; withdrawChannel?: WithdrawChannel } = {
      merchantId,
    };
    if (options?.status) {
      where.status = options.status;
    }
    if (options?.withdrawChannel) {
      where.withdrawChannel = options.withdrawChannel;
    }
    return this.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * 统计商家当日提现次数（PENDING/REVIEWING/APPROVED/PROCESSING/COMPLETED 计入）
   */
  async countTodayByMerchantId(merchantId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return this.count({
      where: {
        merchantId,
        createdAt: Between(startOfDay, new Date()),
        status: In([
          WithdrawOrderStatus.PENDING,
          WithdrawOrderStatus.REVIEWING,
          WithdrawOrderStatus.APPROVED,
          WithdrawOrderStatus.PROCESSING,
          WithdrawOrderStatus.COMPLETED,
        ]),
      },
    });
  }

  /**
   * 统计商家当日提现总金额（COMPLETED + 进行中）
   */
  async sumTodayAmountByMerchantId(merchantId: string): Promise<string> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const result = await this.createQueryBuilder('order')
      .select('COALESCE(SUM(order.amount), 0)', 'total')
      .where('order.merchantId = :merchantId', { merchantId })
      .andWhere('order.createdAt >= :startOfDay', { startOfDay })
      .andWhere('order.status IN (:...statuses)', {
        statuses: [
          WithdrawOrderStatus.PENDING,
          WithdrawOrderStatus.REVIEWING,
          WithdrawOrderStatus.APPROVED,
          WithdrawOrderStatus.PROCESSING,
          WithdrawOrderStatus.COMPLETED,
        ],
      })
      .getRawOne<{ total: string }>();
    return result?.total || '0';
  }

  /**
   * 查找待打款的提现订单（APPROVED 状态）
   */
  async findApprovedOrders(): Promise<WithdrawOrderEntity[]> {
    return this.find({
      where: { status: WithdrawOrderStatus.APPROVED },
      order: { requestedAt: 'ASC' },
    });
  }

  /**
   * 查找打款中超时的订单（PROCESSING 超过 N 分钟）
   */
  async findProcessingTimeoutOrders(timeoutMinutes: number): Promise<WithdrawOrderEntity[]> {
    const threshold = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    return this.find({
      where: {
        status: WithdrawOrderStatus.PROCESSING,
        processedAt: LessThan(threshold),
      },
    });
  }

  /**
   * CAS 更新：仅当 status=APPROVED 时更新为 PROCESSING（防多 Worker 重复处理）
   */
  async casApprovedToProcessing(id: string): Promise<boolean> {
    const result = await this.createQueryBuilder()
      .update(WithdrawOrderEntity)
      .set({
        status: WithdrawOrderStatus.PROCESSING,
        processedAt: new Date(),
      })
      .where('id = :id', { id })
      .andWhere('status = :status', { status: WithdrawOrderStatus.APPROVED })
      .execute();
    return (result.affected ?? 0) > 0;
  }
}
