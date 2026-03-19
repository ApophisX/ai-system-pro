import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentRecordRepository } from '../repositories';
import { PaymentProvider, PaymentStatus, PaymentType } from '../enums';
import { PaymentEntity } from '../entities';
import { plainToInstance } from 'class-transformer';
import { SequenceNumberPrefix, SequenceNumberService, SequenceNumberType } from '@/infrastructure/sequence-number';
import { WxPayService } from './wx-pay.service';
import { UserRepository } from '@/modules/base/user/repositories';
import { ConfigService } from '@nestjs/config';
import { SERVER_CONFIG_KEY, ServerConfig } from '@/config';
import Decimal from 'decimal.js';
import dayjs from 'dayjs';

/**
 * 支付创建服务
 *
 * 提供创建支付记录并调用第三方支付的功能
 */
@Injectable()
export class PaymentCreateService {
  private readonly logger = new Logger(PaymentCreateService.name);
  private readonly wxpayNotifyUrl: string;

  constructor(
    private readonly paymentRecordRepo: PaymentRecordRepository,
    private readonly sequenceNumberService: SequenceNumberService,
    private readonly wxPayService: WxPayService,
    private readonly userRepo: UserRepository,
    private readonly configService: ConfigService,
  ) {
    const serverConfig = this.configService.get<ServerConfig>(SERVER_CONFIG_KEY)!;
    this.wxpayNotifyUrl = `${serverConfig.apiHost}${serverConfig.apiPrefix}/payment/wx-pay/notify`;
  }
}
