import { Injectable } from '@nestjs/common';
import { DataSource, Repository, FindOptionsWhere } from 'typeorm';
import { RefundRecordEntity } from '../entities/refund-record.entity';

/**
 * 退款记录仓储
 */
@Injectable()
export class RefundRecordRepository extends Repository<RefundRecordEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(RefundRecordEntity, dataSource.createEntityManager());
  }

  /**
   * 根据 ID 查找退款记录
   */
  async findById(id: string): Promise<RefundRecordEntity | null> {
    return this.findOne({
      where: { id },
      relations: ['payment'],
    });
  }

  /**
   * 根据退款单号查找退款记录
   */
  async findByRefundNo(refundNo: string): Promise<RefundRecordEntity | null> {
    return this.findOne({
      where: { refundNo },
      relations: { payment: true },
    });
  }

  /**
   * 根据支付 ID 查找所有退款记录
   */
  async findByPaymentId(paymentId: string): Promise<RefundRecordEntity[]> {
    return this.find({
      where: { paymentId },
      relations: ['payment'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据订单 ID 查找退款记录
   */
  async findByOrderId(orderId: string): Promise<RefundRecordEntity[]> {
    return this.find({
      where: { orderId },
      relations: ['payment'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据条件查询退款记录
   */
  async findMany(
    where: FindOptionsWhere<RefundRecordEntity>,
    skip?: number,
    take?: number,
  ): Promise<[RefundRecordEntity[], number]> {
    return this.findAndCount({
      where,
      relations: ['payment'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }
}
