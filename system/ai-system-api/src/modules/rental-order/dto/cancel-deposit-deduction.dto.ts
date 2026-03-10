import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/**
 * 取消押金扣款申请 DTO
 *
 * 出租方取消押金扣款申请
 * 只有在扣款状态属于【待用户确认】、【待平台审核】时，才能取消扣款申请
 */
export class CancelDepositDeductionDto {
  @ApiProperty({
    description: '押金扣款申请 ID',
    example: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  deductionId: string;

  @ApiPropertyOptional({
    description: '取消原因',
    example: '取消原因',
  })
  @IsOptional()
  @MaxLength(200, { message: '取消原因不能超过200个字符' })
  cancelReason?: string;
}
