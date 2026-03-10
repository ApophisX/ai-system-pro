import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReportHandleResult } from '../enums';

/**
 * 处理举报请求 DTO
 */
export class HandleReportDto {
  @ApiProperty({
    description: '处理动作',
    enum: ReportHandleResult,
    example: ReportHandleResult.APPROVE,
  })
  @IsEnum(ReportHandleResult, { message: '处理动作不合法' })
  action: ReportHandleResult;

  @ApiPropertyOptional({
    description: '处理备注',
    example: '核实后确认为虚假信息',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '备注不能超过 500 字' })
  remark?: string;
}
