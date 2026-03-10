/**
 * OSS 模块
 *
 * 提供阿里云 OSS 临时凭证生成功能
 * 前端使用临时凭证直接上传文件到 OSS
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OssController } from './oss.controller';
import { OssService } from './oss.service';
import { ossConfig } from '@/config';

@Module({
  imports: [ConfigModule.forFeature(ossConfig)],
  controllers: [OssController],
  providers: [OssService],
  exports: [OssService],
})
export class OssModule {}
