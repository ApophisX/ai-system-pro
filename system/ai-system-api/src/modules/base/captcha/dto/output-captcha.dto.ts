/**
 * 图形验证码响应 DTO
 */

import { ApiProperty } from '@nestjs/swagger';

/**
 * 图形验证码响应
 */
export class OutputCaptchaDto {
  @ApiProperty({
    description: '验证码 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'SVG 图片数据（Base64 编码或 SVG 字符串）',
    example: '<svg>...</svg>',
  })
  svg: string;
}
