import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PaymentRepository } from '../repositories';
import { QueryPaymentDto } from '../dto';
import { OutputPaymentDto } from '../dto/output-payment.dto';
import { plainToInstance } from 'class-transformer';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';

/**
 * 支付查询服务
 *
 * 提供支付记录的查询功能
 */
@Injectable()
export class PaymentQueryService {
  private readonly logger = new Logger(PaymentQueryService.name);

  constructor(private readonly paymentRepo: PaymentRepository) {}

  /**
   * 查询支付记录
   */
  async queryPayments(
    userId: string,
    dto: QueryPaymentDto,
  ): Promise<{ data: OutputPaymentDto[]; meta: PaginationMetaDto }> {
    const where: any = { userId };

    if (dto.orderId) {
      where.orderId = dto.orderId;
    }
    if (dto.orderNo) {
      where.orderNo = dto.orderNo;
    }
    if (dto.status) {
      where.status = dto.status;
    }
    if (dto.paymentType) {
      where.paymentType = dto.paymentType;
    }
    if (dto.provider) {
      where.provider = dto.provider;
    }

    const skip = (dto.page - 1) * dto.pageSize;
    const [payments, total] = await this.paymentRepo.findMany(where, skip, dto.pageSize);

    const data = plainToInstance(OutputPaymentDto, payments, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });

    const meta = new PaginationMetaDto(dto.page, dto.pageSize);
    meta.total = total;

    return { data, meta };
  }

  /**
   * 根据 ID 获取支付记录
   */
  async getPaymentById(id: string, userId?: string): Promise<OutputPaymentDto | null> {
    const payment = await this.paymentRepo.findById(id);
    if (!payment) {
      return null;
    }

    if (userId && payment.userId !== userId && payment.lessorId !== userId) {
      throw new BadRequestException('无权查看此支付记录');
    }

    return plainToInstance(OutputPaymentDto, payment, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  /**
   * 根据订单 ID 获取支付记录
   */
  async getPaymentsByOrderId(orderId: string): Promise<OutputPaymentDto[]> {
    const payments = await this.paymentRepo.findByOrderId(orderId);
    return plainToInstance(OutputPaymentDto, payments, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }
}
