import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { RentalOrderEntity } from '../entities';
import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';
import { Trim } from '@/common/decorators/trim.decorator';

/**
 * 创建租赁订单请求 DTO
 */
export class CreateRentalOrderDto extends PickType(RentalOrderEntity, [
  'userRemark',
  'needDelivery',
  'contactName',
  'contactPhone',
  'startDate',
  'endDate',
  'rentalPlanId',
  'assetId',
  'contactId',
  'duration',
] as const) {
  @ApiProperty({
    description: '开始时间（默认当前时间）',
    example: '2024-01-01 00:00:00',
  })
  @IsNotEmpty()
  @IsDateString()
  startAt: string;

  @ApiPropertyOptional({
    description: '资产实例编号',
    example: 'INV1234567890',
  })
  @IsOptional()
  @Trim()
  inventoryCode?: string;
}
