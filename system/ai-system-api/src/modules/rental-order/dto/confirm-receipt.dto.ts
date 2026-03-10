import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsArray, IsString, MaxLength, Equals, ArrayMaxSize } from 'class-validator';

/**
 * 承租方确认收货请求 DTO
 *
 * 当订单绑定资产实例后，承租方可以确认收货，确认后订单进入使用中状态并开始计算租金
 */
export class ConfirmReceiptDto {
  @ApiProperty({
    description: '我已确认收货（必填，用户需勾选确认）',
    example: true,
  })
  @IsBoolean({ message: '请输入「我已确认收货」' })
  @Equals(true, { message: '请输入「我已确认收货」' })
  @IsNotEmpty({ message: '请输入选「我已确认收货」' })
  confirmedReceipt: boolean;

  @ApiPropertyOptional({
    description: '收货凭证图片 URL 列表（选填，若提供则每项需为合法 URL）',
    type: [String],
    example: ['https://example.com/receipt1.jpg', 'https://example.com/receipt2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(9, { message: '最多上传9张图片' })
  evidenceUrls?: string[];

  @ApiPropertyOptional({
    description: '收货说明（选填）',
    example: '商品已收到，完好无损',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '收货说明不能超过500个字符' })
  description?: string;
}
