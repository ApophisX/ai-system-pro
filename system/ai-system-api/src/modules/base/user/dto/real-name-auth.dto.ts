import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsObject,
  MaxLength,
  Matches,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';
import { Gender } from '../enums';

/**
 * 实名认证请求 DTO
 *
 * 对应 UserProfileEntity 中个人实名相关字段，提交后写入 user_profile
 */
export class RealNameAuthDto {
  @ApiProperty({
    description: '真实姓名',
    example: '张三',
  })
  @IsString()
  @IsNotEmpty({ message: '真实姓名不能为空' })
  @MaxLength(50, { message: '真实姓名最长 50 个字符' })
  realName: string;

  @ApiPropertyOptional({
    description: '性别',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender, { message: '性别取值应为 unknown / male / female' })
  gender: Gender;

  @ApiPropertyOptional({
    description: '生日（YYYY-MM-DD）',
    example: '1990-01-01',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '生日格式应为 YYYY-MM-DD' })
  @IsOptional()
  birthday?: string;

  @ApiProperty({
    description: '身份证号',
    example: '440305199001011234',
  })
  @IsString()
  @IsNotEmpty({ message: '身份证号不能为空' })
  @Matches(/^\d{17}[\dXx]$/, { message: '身份证号格式不正确（18 位，末位可为 X）' })
  @MaxLength(32, { message: '身份证号最长 32 个字符' })
  idCard: string;

  @ApiProperty({
    description: '身份证照片地址（如正反面）',
    example: ['https://example.com/idcard-front.jpg', 'https://example.com/idcard-back.jpg'],
    type: [String],
    maxItems: 5,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5, { message: '身份证照片最多 5 张' })
  @ArrayMinSize(2, { message: '请上传身份证正反面照片' })
  idCardPhotoUrls: string[];

  @ApiPropertyOptional({
    description: '身份证地址',
    example: '广东省深圳市南山区某某街道',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '身份证地址最长 255 个字符' })
  idCardAddress?: string;

  @ApiPropertyOptional({
    description: '身份证有效期开始日期（YYYY-MM-DD）',
    example: '2010-01-01',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '有效期开始日期格式应为 YYYY-MM-DD' })
  idCardStartDate?: string;

  @ApiPropertyOptional({
    description: '身份证有效期结束日期（YYYY-MM-DD），长期可用 9999-12-31',
    example: '2030-12-31',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '有效期结束日期格式应为 YYYY-MM-DD' })
  idCardEndDate?: string;

  @ApiPropertyOptional({
    description: '身份证签发机关',
    example: '深圳市公安局南山分局',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '签发机关最长 255 个字符' })
  idCardIssue?: string;

  @ApiPropertyOptional({
    description: '身份证详细信息快照（如 OCR 或人工补充的扩展信息）',
    example: { name: '张三', nationality: '汉', idNumber: '440305199001011234' },
  })
  @IsOptional()
  @IsObject()
  idCardSnapshot?: Record<string, unknown>;
}
