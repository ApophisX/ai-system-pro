import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { CommunityType } from '../enums';

/**
 * 创建社区请求 DTO
 */
export class CreateCommunityDto {
  @ApiProperty({ description: '社区名称', example: '摄影器材爱好者' })
  @IsNotEmpty({ message: '社区名称不能为空' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: '社区描述', example: '分享与租赁摄影器材' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: '封面图 URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImage?: string;

  @ApiProperty({ description: '社区类型', enum: CommunityType })
  @IsEnum(CommunityType)
  type: CommunityType;
}
