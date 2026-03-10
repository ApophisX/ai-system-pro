import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * OSS 临时凭证输出 DTO
 *
 * 用于前端使用 ali-oss SDK 上传文件到 OSS
 */
export class OutputOssCredentialsDto {
  @Expose()
  @ApiProperty({
    description: '临时访问密钥 ID',
    example: 'STS.xxx',
  })
  accessKeyId: string;

  @Expose()
  @ApiProperty({
    description: '临时访问密钥 Secret',
    example: 'xxx',
  })
  accessKeySecret: string;

  @Expose()
  @ApiProperty({
    description: '安全令牌',
    example: 'xxx',
  })
  securityToken: string;

  @Expose()
  @ApiProperty({
    description: '凭证过期时间（ISO 8601 格式）',
    example: '2024-01-01T12:00:00Z',
  })
  expiration: string;

  @Expose()
  @ApiProperty({
    description: 'OSS 区域',
    example: 'oss-cn-hangzhou',
  })
  region: string;

  @Expose()
  @ApiProperty({
    description: 'OSS Bucket 名称',
    example: 'my-bucket',
  })
  bucket: string;

  @Expose()
  @ApiProperty({
    description: 'OSS Endpoint',
    example: 'https://oss-cn-hangzhou.aliyuncs.com',
  })
  endpoint: string;
}
