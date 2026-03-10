import { Injectable } from '@nestjs/common';
import { DataSource, Repository, FindOptionsWhere, FindOptionsRelations } from 'typeorm';
import { DepositDeductionEntity } from '../entities/deposit-deduction.entity';

/**
 * 押金扣款记录仓储
 */
@Injectable()
export class DepositDeductionRepository extends Repository<DepositDeductionEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(DepositDeductionEntity, dataSource.createEntityManager());
  }

  /**
   * 根据 ID 查找扣款记录（含押金关系，用于审核等）
   */
  async findByIdWithDeposit(id: string): Promise<DepositDeductionEntity | null> {
    return this.findOne({
      where: { id },
      relations: ['deposit'],
    });
  }

  /**
   * 根据押金 ID 查找扣款记录列表
   */
  async findByDepositId(depositId: string): Promise<DepositDeductionEntity[]> {
    return this.find({
      where: { depositId },
      order: { deductedAt: 'DESC' },
    });
  }

  /**
   * 根据订单 ID 查找扣款记录列表
   */
  async findByOrderId(orderId: string): Promise<DepositDeductionEntity[]> {
    return this.find({
      where: { orderId },
      order: { deductedAt: 'DESC' },
    });
  }

  /**
   * 根据条件查找扣款记录列表
   */
  async findMany(
    where: FindOptionsWhere<DepositDeductionEntity>,
    skip?: number,
    take?: number,
  ): Promise<[DepositDeductionEntity[], number]> {
    return this.findAndCount({
      where,
      order: { deductedAt: 'DESC' },
      skip,
      take,
    });
  }

  /**
   * 后台分页查询扣款记录（按申请时间倒序）
   */
  async findManyForAdmin(
    where: FindOptionsWhere<DepositDeductionEntity> | FindOptionsWhere<DepositDeductionEntity>[],
    skip: number,
    take: number,
    relations?: FindOptionsRelations<DepositDeductionEntity>,
  ): Promise<[DepositDeductionEntity[], number]> {
    return this.findAndCount({
      where,
      order: { appliedAt: 'DESC' },
      skip,
      take,
      relations,
    });
  }

  /**
   * 计算押金已扣除总金额
   */
  async getTotalDeductedAmount(depositId: string): Promise<number> {
    const result = await this.createQueryBuilder('deduction')
      .select('SUM(deduction.amount)', 'total')
      .where('deduction.depositId = :depositId', { depositId })
      .getRawOne();

    return result?.total ? Number(result.total) : 0;
  }
}
