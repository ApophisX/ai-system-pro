import { ApiProperty } from '@nestjs/swagger';
import { CreditEventType, CreditActorRole } from '../enums';
import { CreditEventTypeLabelMap } from '../enums/credit-event-type.enum';

/**
 * 信用记录（单条事件）输出 DTO
 */
export class OutputCreditRecordDto {
  @ApiProperty({ description: '事件 ID' })
  id: string;

  @ApiProperty({ description: '事件类型', enum: CreditEventType })
  eventType: CreditEventType;

  @ApiProperty({ description: '事件类型标签' })
  eventTypeLabel: string;

  @ApiProperty({ description: '角色', enum: CreditActorRole })
  actorRole: CreditActorRole;

  @ApiProperty({ description: '影响分（正为加分，负为扣分）' })
  impactScore: number;

  @ApiProperty({ description: '关联订单 ID', nullable: true })
  relatedOrderId: string | null;

  @ApiProperty({ description: '创建时间' })
  createdAt: string;
}
