import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@/common/dtos/base-query.dto';
import { CreditActorRole } from '../enums';
import { Expose } from 'class-transformer';

/**
 * 信用记录分页查询 DTO
 */
export class QueryCreditRecordDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: '角色维度：lessee 承租方 / lessor 出租方',
    enum: CreditActorRole,
  })
  @IsEnum(CreditActorRole)
  @IsOptional()
  @Expose()
  actorRole?: CreditActorRole;
}
