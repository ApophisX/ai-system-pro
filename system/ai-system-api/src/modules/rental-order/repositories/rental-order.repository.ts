import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DataSource,
  Repository,
  FindOptionsWhere,
  QueryDeepPartialEntity,
  FindOneOptions,
  FindOptionsRelations,
  Not,
  In,
} from 'typeorm';
import { RentalOrderEntity } from '../entities/rental-order.entity';
import { RentalOrderStatus, RentalOrderRefundStatus, DepositStatus, RentalOrderUsageStatus } from '../enums';

/**
 * 租赁订单仓储
 */
@Injectable()
export class RentalOrderRepository extends Repository<RentalOrderEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(RentalOrderEntity, dataSource.createEntityManager());
  }

  /**
   * 根据 ID 查找订单
   */
  async findById(id: string, options?: FindOneOptions<RentalOrderEntity>): Promise<RentalOrderEntity> {
    const order = await this.findOne({
      ...options,
      where: { ...options?.where, id },
      relations: {
        lessor: { profile: true },
        lessee: { profile: true },
        assetSnapshot: true,
        deposits: {
          deductions: true,
        },
        rentalPlanSnapshot: true,
        payments: { paymentRecords: true, refundRecords: true },
        ...options?.relations,
      },
    });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }
    return order;
  }

  /**
   * 根据订单号查找订单
   */
  async findByOrderNo(orderNo: string): Promise<RentalOrderEntity> {
    const order = await this.findOne({
      where: { orderNo },
      relations: ['lessor', 'lessee', 'assetSnapshot', 'rentalPlanSnapshot', 'inventory'],
    });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }
    return order;
  }

  /**
   * 根据承租方 ID 查找订单
   */
  async findByLesseeId(lesseeId: string, skip?: number, take?: number): Promise<[RentalOrderEntity[], number]> {
    return this.findAndCount({
      where: { lesseeId },
      relations: ['lessor', 'lessee', 'assetSnapshot', 'rentalPlanSnapshot'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  /**
   * 根据出租方 ID 查找订单
   */
  async findByLessorId(lessorId: string, skip?: number, take?: number): Promise<[RentalOrderEntity[], number]> {
    return this.findAndCount({
      where: { lessorId },
      relations: ['lessor', 'lessee', 'assetSnapshot', 'rentalPlanSnapshot'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  /**
   * 根据条件查询订单
   */
  async findMany(
    where: FindOptionsWhere<RentalOrderEntity> | FindOptionsWhere<RentalOrderEntity>[],
    skip: number = 0,
    take: number = 0,
    relations?: FindOptionsRelations<RentalOrderEntity>,
  ): Promise<[RentalOrderEntity[], number]> {
    return this.findAndCount({
      where,
      relations: {
        lessor: true,
        lessee: true,
        assetSnapshot: true,
        rentalPlanSnapshot: true,
        deposits: { deductions: true },
        payments: true,
        ...relations,
      },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  /**
   * 更新订单状态
   */
  async updateStatus(
    id: string,
    status: RentalOrderStatus,
    data?: QueryDeepPartialEntity<RentalOrderEntity>,
  ): Promise<void> {
    await this.update(id, {
      status,
      ...data,
    });
  }

  /**
   * 更新支付状态
   */
  async updatePaymentStatus(id: string, data?: QueryDeepPartialEntity<RentalOrderEntity>): Promise<void> {
    await this.update(id, {
      ...data,
    });
  }

  /**
   * 更新押金支付状态
   */
  async updateDepositStatus(
    id: string,
    depositStatus: DepositStatus,
    data?: QueryDeepPartialEntity<RentalOrderEntity>,
  ): Promise<void> {
    await this.update(id, {
      depositStatus,
      ...data,
    });
  }

  /**
   * 更新退款状态
   */
  async updateRefundStatus(
    id: string,
    refundStatus: RentalOrderRefundStatus,
    data?: QueryDeepPartialEntity<RentalOrderEntity>,
  ): Promise<void> {
    await this.update(id, {
      refundStatus,
      ...data,
    });
  }

  /**
   * 查找正在使用的中的订单数量
   */
  async findInProgressOrderCount(lessorId: string): Promise<number> {
    return this.count({
      where: {
        lessorId,
        useageStatus: Not(In([RentalOrderUsageStatus.NONE, RentalOrderUsageStatus.RETURNED])),
      },
    });
  }
}
