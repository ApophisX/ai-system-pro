import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * 出租方回复评价请求 DTO
 */
export class ReplyRentalReviewDto {
  @ApiProperty({ description: '回复内容', example: '感谢支持' })
  @IsString()
  @IsNotEmpty({ message: '回复内容不能为空' })
  @MaxLength(1000, { message: '回复内容不能超过 1000 字' })
  replyContent: string;
}
