import { Injectable, Logger } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageType } from '../enums/message-type.enum';
import { CreateMessageDto } from '../dto/create-message.dto';
import { PaymentRecordEntity, RefundRecordEntity, PaymentEntity } from '@/modules/base/payment/entities';
import Decimal from 'decimal.js';

/**
 * 消息通知服务
 *
 * 提供订单、支付、退款、押金、资产实例绑定等场景的消息创建功能
 * 确保消息正确关联到出租方和承租方
 */
@Injectable()
export class MessageNotificationService {
  private readonly logger = new Logger(MessageNotificationService.name);

  constructor(private readonly messageService: MessageService) {}
}
