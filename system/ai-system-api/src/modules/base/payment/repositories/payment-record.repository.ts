import { Injectable } from '@nestjs/common';
import { DataSource, Repository, FindOptionsWhere } from 'typeorm';
import { PaymentRecordEntity } from '../entities/payment-record.entity';

/**
 * 支付记录仓储
 */
@Injectable()
export class PaymentRecordRepository extends Repository<PaymentRecordEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(PaymentRecordEntity, dataSource.createEntityManager());
  }
  /**
   * 根据记录号查找支付记录
   */
  async findByRecordNo(recordNo: string): Promise<PaymentRecordEntity | null> {
    return this.findOne({
      where: { recordNo },
      relations: ['payment'],
    });
  }

  /**
   * 根据 ID 查找支付记录
   */
  async findById(id: string): Promise<PaymentRecordEntity | null> {
    return this.findOne({
      where: { id },
      relations: ['payment'],
    });
  }

  /**
   * 根据支付 ID 查找所有支付记录
   */
  async findByPaymentId(paymentId: string): Promise<PaymentRecordEntity[]> {
    return this.find({
      where: { paymentId },
      relations: ['payment'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据订单 ID 查找支付记录
   */
  async findByOrderId(orderId: string): Promise<PaymentRecordEntity[]> {
    return this.find({
      where: { orderId },
      relations: ['payment'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据条件查询支付记录
   */
  async findMany(
    where: FindOptionsWhere<PaymentRecordEntity>,
    skip?: number,
    take?: number,
  ): Promise<[PaymentRecordEntity[], number]> {
    return this.findAndCount({
      where,
      relations: ['payment'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }
}
