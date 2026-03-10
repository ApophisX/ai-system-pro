import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * 审核拒绝社区请求 DTO
 */
export class RejectCommunityDto {
  @ApiProperty({ description: '审核意见（拒绝时必填）', example: '社区名称不符合规范' })
  @IsNotEmpty({ message: '审核意见不能为空' })
  @IsString()
  @MaxLength(500)
  auditRemark: string;
}
