import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 微信支付回调资源 DTO
 */
export class WeChatPayCallbackResourceDto {
  @ApiProperty({
    description: '加密算法，目前只支持AEAD_AES_256_GCM',
    example: 'AEAD_AES_256_GCM',
  })
  @IsNotEmpty()
  @IsString()
  algorithm: string;

  @ApiProperty({
    description: '数据密文，Base64编码后的开启/停用结果数据密文',
    example: 'base64_encoded_ciphertext',
  })
  @IsNotEmpty()
  @IsString()
  ciphertext: string;

  @ApiPropertyOptional({
    description: '附加数据',
    example: 'fdasfwqewlkja484w',
  })
  @IsOptional()
  @IsString()
  associated_data?: string;

  @ApiProperty({
    description: '原始回调类型，为transaction',
    example: 'transaction',
  })
  @IsNotEmpty()
  @IsString()
  original_type: string;

  @ApiProperty({
    description: '加密使用的随机串',
    example: 'fdasflkja484w',
  })
  @IsNotEmpty()
  @IsString()
  nonce: string;
}

/**
 * 微信支付回调请求体 DTO
 *
 * 用于接收微信支付回调通知
 * 文档：https://pay.weixin.qq.com/wiki/doc/apiv3/wechatpay/wechatpay4_2.shtml
 */
export class CreateWxPayCallbackDto {
  @ApiProperty({ description: '通知ID', example: 'EV-2018022511223320873' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ description: '通知创建时间', example: '20180225112233' })
  @IsNotEmpty()
  @IsString()
  create_time: string;

  @ApiProperty({
    description: '事件类型，支付成功为TRANSACTION.SUCCESS',
    example: 'TRANSACTION.SUCCESS',
    enum: ['TRANSACTION.SUCCESS'],
  })
  @IsNotEmpty()
  @IsString()
  event_type: 'TRANSACTION.SUCCESS';

  @ApiProperty({
    description: '通知的资源数据类型，支付成功通知为encrypt-resource',
    example: 'encrypt-resource',
  })
  @IsNotEmpty()
  @IsString()
  resource_type: string;

  @ApiProperty({ description: '回调摘要', example: '支付成功' })
  @IsNotEmpty()
  @IsString()
  summary: string;

  @ApiProperty({ description: '加密的资源数据' })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => WeChatPayCallbackResourceDto)
  resource: WeChatPayCallbackResourceDto;
}

// 为了向后兼容，保留旧名称
export class WeChatPayCallbackReqeustBodyDto extends CreateWxPayCallbackDto {}
