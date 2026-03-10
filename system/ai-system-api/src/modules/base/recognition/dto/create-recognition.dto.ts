import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsBoolean, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateRecognitionDto {}

export class IdCardOcrDto {
  @ApiPropertyOptional({
    description: '图片二进制数据的 base64 编码（不含 data:image/xxx;base64, 前缀也可）或图片 url',
    example: 'base64-encoded-image',
  })
  @IsString()
  @IsOptional()
  image: string;

  @ApiProperty({
    description: '身份证正反面类型：face-正面，back-反面',
    enum: ['face', 'back'],
    default: 'face',
  })
  @IsOptional()
  @IsIn(['face', 'back'])
  side?: 'face' | 'back';

  @ApiPropertyOptional({
    description: '是否输出身份证质量分信息（翻拍、复印件、完整度、整体质量、篡改分数）',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  quality_info: boolean = false;
}
