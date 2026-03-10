import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsEnum, IsIn, IsDateString } from 'class-validator';
import { BaseQueryDto } from '@/common/dtos/base-query.dto';
import { ReportStatus, REPORT_REASON_VALUES } from '../enums';

/**
 * 用户端查询举报列表 DTO（仅查自己的）
 */
export class AppQueryReportDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: '资产 ID 筛选', example: 'uuid-of-asset' })
  @IsOptional()
  @IsUUID()
  assetId?: string;

  @ApiPropertyOptional({ description: '举报原因筛选', example: 'fraud' })
  @IsOptional()
  @IsIn(REPORT_REASON_VALUES)
  reason?: string;

  @ApiPropertyOptional({ description: '状态筛选', enum: ReportStatus })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;
}

/**
 * 管理端查询举报列表 DTO
 */
export class AdminQueryReportDto extends AppQueryReportDto {
  @ApiPropertyOptional({ description: '举报人 ID 筛选', example: 'uuid-of-reporter' })
  @IsOptional()
  @IsUUID()
  reporterId?: string;

  @ApiPropertyOptional({ description: '开始日期 (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期 (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
