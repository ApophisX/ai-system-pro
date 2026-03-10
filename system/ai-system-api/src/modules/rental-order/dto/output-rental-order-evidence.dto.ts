import { ApiProperty, OmitType } from '@nestjs/swagger';
import { RentalOrderEvidenceEntity } from '../entities';
import { Expose, Type } from 'class-transformer';
import { OutputUserDto } from '@/modules/base/user/dto';
import { OutputRentalOrderDto } from './output-rental-order.dto';

/**
 * 租赁订单凭证响应 DTO
 *
 * 复用 Entity，排除关系属性以避免 Swagger 循环依赖
 */
export class OutputRentalOrderEvidenceDto extends OmitType(RentalOrderEvidenceEntity, [
  'rentalOrder',
  'submitter',
  'auditor',
  'submitterTypeLabel',
  'auditStatusLabel',
  'isAudited',
  'isApproved',
  'isRejected',
] as const) {
  @ApiProperty({ description: '租赁订单', type: OutputRentalOrderDto })
  @Type(() => OutputRentalOrderDto)
  @Expose()
  rentalOrder?: OutputRentalOrderDto;

  @ApiProperty({ description: '提交者', type: OutputUserDto })
  @Type(() => OutputUserDto)
  @Expose()
  submitter?: OutputUserDto;

  @ApiProperty({ description: '审核人', type: OutputUserDto })
  @Type(() => OutputUserDto)
  @Expose()
  auditor?: OutputUserDto;

  @ApiProperty({ description: '提交者类型标签' })
  @Expose()
  submitterTypeLabel: string;

  @ApiProperty({ description: '审核状态标签' })
  @Expose()
  auditStatusLabel: string;

  @ApiProperty({ description: '是否已审核' })
  @Expose()
  isAudited: boolean;

  @ApiProperty({ description: '是否审核通过' })
  @Expose()
  isApproved: boolean;

  @ApiProperty({ description: '是否审核拒绝' })
  @Expose()
  isRejected: boolean;
}

export class OutputRentalOrderEvidenceDtoWithRentalOrder extends OmitType(OutputRentalOrderEvidenceDto, [
  'rentalOrder',
] as const) {
  //
}
