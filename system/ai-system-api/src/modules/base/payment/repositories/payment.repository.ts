import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository, FindOptionsWhere, QueryDeepPartialEntity, FindOneOptions } from 'typeorm';
import { PaymentEntity } from '../entities/payment.entity';
import { InstallmentStatus } from '../enums';

/**
 * 支付仓储
 */
@Injectable()
export class PaymentRepository extends Repository<PaymentEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(PaymentEntity, dataSource.createEntityManager());
  }

  /**
   * 根据 ID 查找支付记录
   */
  async findById(id: string): Promise<PaymentEntity | null> {
    return this.findOne({
      where: { id },
      relations: ['user', 'paymentRecords', 'refundRecords'],
    });
  }

  /**
   * 根据支付单号查找支付记录
   */
  async findByPaymentNo(paymentNo: string, options?: FindOneOptions<PaymentEntity>): Promise<PaymentEntity> {
    const payment = await this.findOne({
      ...options,
      where: { ...options?.where, paymentNo },
      relations: ['user', 'paymentRecords', 'refundRecords'],
    });
    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }
    return payment;
  }

  /**
   * 根据订单 ID 查找支付记录
   */
  async findByOrderId(orderId: string): Promise<PaymentEntity[]> {
    return this.find({
      where: { orderId },
      relations: ['user', 'paymentRecords', 'refundRecords'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据订单号查找支付记录
   */
  async findByOrderNo(orderNo: string): Promise<PaymentEntity[]> {
    return this.find({
      where: { orderNo },
      relations: ['user', 'paymentRecords', 'refundRecords'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据用户 ID 查找支付记录
   */
  async findByUserId(userId: string, skip?: number, take?: number): Promise<[PaymentEntity[], number]> {
    return this.findAndCount({
      where: { userId },
      relations: ['user', 'paymentRecords', 'refundRecords'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  /**
   * 根据条件查询支付记录
   */
  async findMany(
    where: FindOptionsWhere<PaymentEntity>,
    skip?: number,
    take?: number,
  ): Promise<[PaymentEntity[], number]> {
    return this.findAndCount({
      where,
      relations: ['user', 'paymentRecords', 'refundRecords'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  /**
   * 更新支付状态
   */
  async updateStatus(
    id: string,
    status: InstallmentStatus,
    data?: QueryDeepPartialEntity<PaymentEntity>,
  ): Promise<void> {
    await this.update(id, {
      status,
      ...data,
    });
  }
}
