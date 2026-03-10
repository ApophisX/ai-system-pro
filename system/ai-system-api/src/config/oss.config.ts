/**
 * OSS 配置
 *
 * 阿里云 OSS 对象存储服务相关配置
 */

import { registerAs } from '@nestjs/config';

export const OSS_CONFIG_KEY = 'aliyun-oss';

export const ossConfig = registerAs(OSS_CONFIG_KEY, () => ({
  provider: process.env.OSS_PROVIDER || 'alicloud',
  alicloud: {
    // OSS 配置
    region: process.env.ALICLOUD_OSS_REGION || 'oss-cn-shanghai',
    bucket: process.env.ALICLOUD_OSS_BUCKET || '',
    endpoint: process.env.ALICLOUD_OSS_ENDPOINT || '',
    // STS 配置（用于生成临时凭证）
    sts: {
      accessKeyId: process.env.ALICLOUD_STS_ACCESS_KEY_ID || '',
      accessKeySecret: process.env.ALICLOUD_STS_ACCESS_KEY_SECRET || '',
      roleArn: process.env.ALICLOUD_STS_ROLE_ARN || '',
      roleSessionName: process.env.ALICLOUD_STS_ROLE_SESSION_NAME || 'oss-upload-session',
      endpoint: process.env.ALICLOUD_STS_ENDPOINT || 'sts.cn-hangzhou.aliyuncs.com',
      // 临时凭证有效期（秒），默认 1 小时
      durationSeconds: parseInt(process.env.ALICLOUD_STS_DURATION_SECONDS || '3600', 10),
    },
  },
  // 上传路径前缀
  uploadPrefix: process.env.OSS_UPLOAD_PREFIX || 'common',
  // 允许的文件类型（MIME types）
  allowedMimeTypes: (process.env.OSS_ALLOWED_MIME_TYPES || 'image/*,video/*,application/pdf').split(','),
  // 单个文件最大大小（字节），默认 10MB
  maxFileSize: parseInt(process.env.OSS_MAX_FILE_SIZE || '10485760', 10),
}));

export type OssConfig = ReturnType<typeof ossConfig>;
