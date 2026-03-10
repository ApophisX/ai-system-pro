import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BASE_ENTITY_OMIT_FIELDS } from '@/infrastructure/database/entities/base.entity';
import { ReportSpecificationEntity } from '../entities';

/**
 * 举报响应 DTO
 */
export class OutputReportDto extends OmitType(ReportSpecificationEntity, [
  'reporter',
  'asset',
  ...BASE_ENTITY_OMIT_FIELDS,
] as const) {
  @ApiPropertyOptional({ description: '举报人昵称（脱敏）' })
  @Expose()
  reporterNickname?: string;

  @ApiPropertyOptional({ description: '资产名称' })
  @Expose()
  assetName?: string;
}
