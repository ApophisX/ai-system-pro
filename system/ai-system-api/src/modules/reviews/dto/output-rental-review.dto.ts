import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { BASE_ENTITY_OMIT_FIELDS } from '@/infrastructure/database/entities/base.entity';
import { RentalReviewEntity } from '../entities';
import { OutputUserBriefDto } from '@/modules/base/user/dto';

/**
 * 租赁评价响应 DTO（公开列表）
 *
 * 基于实体 OmitType，避免重复定义；虚拟字段 lesseeNickname 单独定义
 */
export class OutputRentalReviewDto extends OmitType(RentalReviewEntity, [
  'orderId',
  'assetId',
  'lesseeId',
  'lessorId',
  'status',
  'rejectReason',
  'approvedAt',
  'approvedById',
  'order',
  'lessee',
  'lessor',
  ...BASE_ENTITY_OMIT_FIELDS,
] as const) {
  /** 承租方昵称（脱敏，如 张**） */
  @ApiPropertyOptional({ description: '承租方昵称（脱敏，如 张**）' })
  @Expose()
  lesseeNickname: string;

  @ApiProperty()
  @Expose()
  @Type(() => OutputUserBriefDto)
  lessee: OutputUserBriefDto;
}

/**
 * 资产评价汇总 DTO（虚拟/聚合数据，单独定义）
 */
export class OutputRentalReviewSummaryDto {
  @ApiProperty({ description: '已通过审核的评价数量' })
  @Expose()
  reviewCount: number;

  @ApiProperty({ description: '平均评分' })
  @Expose()
  avgScore: number;

  @ApiProperty({
    description: '星级分布',
    example: { 1: 2, 2: 3, 3: 10, 4: 35, 5: 50 },
  })
  @Expose()
  scoreDistribution: Record<number, number>;
}
