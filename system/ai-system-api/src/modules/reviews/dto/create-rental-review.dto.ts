import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsInt, Min, Max, IsOptional, IsArray, MaxLength, IsString } from 'class-validator';

/**
 * 创建租赁评价请求 DTO
 */
export class CreateRentalReviewDto {
  @ApiProperty({ description: '租赁订单 ID', example: 'uuid-of-order' })
  @IsUUID()
  @IsNotEmpty({ message: '订单 ID 不能为空' })
  orderId: string;

  @ApiProperty({ description: '评分 1-5', example: 5 })
  @IsInt()
  @Min(1, { message: '评分最低为 1 星' })
  @Max(5, { message: '评分最高为 5 星' })
  score: number;

  @ApiPropertyOptional({ description: '评论内容', example: '设备很好用' })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: '评论内容不能超过 2000 字' })
  content?: string;

  @ApiPropertyOptional({
    description: '图片 URL 数组',
    example: ['https://oss.example.com/img1.jpg'],
  })
  @IsOptional()
  @IsArray()
  images?: string[];
}
