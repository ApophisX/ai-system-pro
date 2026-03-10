import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { BASE_ENTITY_OMIT_FIELDS } from '@/infrastructure/database/entities/base.entity';
import { RentalReviewEntity } from '../entities';
import { OutputUserBriefDto } from '@/modules/base/user/dto';

/**
 * 后台租赁评价列表项 DTO（管理员审核/查看）
 *
 * 包含完整审核信息：状态、拒绝原因、审核时间等；承租方/出租方信息不脱敏
 */
export class OutputRentalReviewAdminDto extends OmitType(RentalReviewEntity, [
  'order',
  'lessee',
  'lessor',
  ...BASE_ENTITY_OMIT_FIELDS,
] as const) {
  /** 状态标签（中文） */
  @ApiProperty({ description: '状态标签', example: '待审核' })
  @Expose()
  statusLabel: string;

  /** 承租方昵称（后台展示完整，用于审核） */
  @ApiPropertyOptional({ description: '承租方昵称' })
  @Expose()
  lesseeNickname: string;

  /** 承租方信息 */
  @ApiProperty({ description: '承租方', type: () => OutputUserBriefDto })
  @Expose()
  @Type(() => OutputUserBriefDto)
  lessee: OutputUserBriefDto;

  /** 出租方信息 */
  @ApiProperty({ description: '出租方', type: () => OutputUserBriefDto })
  @Expose()
  @Type(() => OutputUserBriefDto)
  lessor: OutputUserBriefDto;
}
