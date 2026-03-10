/**
 * OSS 服务
 *
 * 提供阿里云 OSS 临时凭证生成服务
 * 前端使用临时凭证直接上传文件到 OSS，减轻服务器压力
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import STS from 'ali-oss';
import OSS from 'ali-oss';
import { OssConfig, OSS_CONFIG_KEY } from '@/config';
import { OutputOssCredentialsDto } from './dto/output-oss-credentials.dto';

@Injectable()
export class OssService {
  private readonly logger = new Logger(OssService.name);
  private readonly ossConfig: OssConfig;

  constructor(private readonly configService: ConfigService) {
    this.ossConfig = this.configService.get<OssConfig>(OSS_CONFIG_KEY)!;
    if (!this.ossConfig) {
      this.logger.warn('OSS config not found');
    }
  }

  /**
   * 获取 OSS 临时上传凭证
   *
   * @param userId 用户 ID，用于生成会话名称和策略
   * @param uploadPath 上传路径前缀（可选），用于限制上传路径
   * @returns OSS 临时凭证信息
   */
  async getUploadCredentials(userId: string, uploadPath?: string): Promise<OutputOssCredentialsDto> {
    const config = this.ossConfig.alicloud;

    if (!config.sts.accessKeyId || !config.sts.accessKeySecret || !config.sts.roleArn) {
      throw new BadRequestException('OSS STS 配置不完整');
    }

    try {
      // 构建 STS 策略，限制只能上传到指定路径
      const policy = this.buildPolicy(config.bucket, uploadPath);
      const policyString = JSON.stringify(policy);

      // 记录策略内容（用于调试）
      this.logger.debug(`OSS policy for user ${userId}, path: ${uploadPath || 'default'}`, policyString);

      // 调用 STS AssumeRole API
      const credentials = await this.assumeRole({
        roleArn: config.sts.roleArn,
        roleSessionName: `${config.sts.roleSessionName}-${userId}-${Date.now()}`,
        durationSeconds: config.sts.durationSeconds,
        policy: policyString,
      });

      // 构建 endpoint
      const endpoint = config.endpoint || `https://${config.region}.aliyuncs.com`;

      this.logger.log(`OSS credentials generated for user: ${userId}, path: ${uploadPath || 'default'}`);

      return {
        accessKeyId: credentials.accessKeyId,
        accessKeySecret: credentials.accessKeySecret,
        securityToken: credentials.securityToken,
        expiration: credentials.expiration,
        region: config.region,
        bucket: config.bucket,
        endpoint: endpoint,
        // endpoint: 'https://static.openworkai.com',
      };
    } catch (error) {
      this.logger.error('Failed to generate OSS credentials', error);
      throw new BadRequestException('获取上传凭证失败，请稍后重试');
    }
  }

  // 获取签名url
  getSignatureUrl(
    url: string | undefined | null,
    options?: { options?: OSS.SignatureUrlOptions; realname?: string },
  ): string {
    if (!url) {
      return '';
    }

    if (url.startsWith('http')) {
      return url;
    }

    const config = this.ossConfig.alicloud;

    const ossOptions = {
      region: config.region,
      accessKeyId: config.sts.accessKeyId,
      accessKeySecret: config.sts.accessKeySecret,
      secure: true,
      bucket: config.bucket,
      cname: true,
      endpoint: config.endpoint,
    };
    const client = new OSS(ossOptions);
    return client.signatureUrl(url, {
      expires: 1800,
      subResource: options?.realname ? { realname: options.realname } : undefined,
      ...options?.options,
    });
  }

  // 删除对象
  async deleteMulti(urls: string[]) {
    if (urls.length === 0) {
      return;
    }
    const client = this.getOssClient();
    try {
      await client.deleteMulti(urls);
      this.logger.log(`删除OSS对象: ${urls.join(', ')}`);
    } catch (error) {
      this.logger.error('删除OSS对象失败', error);
    }
  }

  // ------------------------------------------------------------

  getOssClient() {
    const config = this.ossConfig.alicloud;
    const ossOptions = {
      region: config.region,
      accessKeyId: config.sts.accessKeyId,
      accessKeySecret: config.sts.accessKeySecret,
      secure: true,
      bucket: config.bucket,
      cname: true,
      endpoint: config.endpoint,
    };
    const client = new OSS(ossOptions);
    return client;
  }

  /**
   * 调用 STS AssumeRole API
   */
  private async assumeRole(params: {
    roleArn: string;
    roleSessionName: string;
    durationSeconds?: number;
    policy?: string;
  }): Promise<{
    accessKeyId: string;
    accessKeySecret: string;
    securityToken: string;
    expiration: string;
  }> {
    const config = this.ossConfig.alicloud.sts;

    // 创建 STS 客户端
    const sts = new OSS.STS({
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
    });

    // 调用 AssumeRole
    const result = await sts.assumeRole(
      params.roleArn,
      params.policy || '',
      params.durationSeconds || 3600,
      params.roleSessionName,
    );

    if (!result.credentials) {
      throw new Error('STS AssumeRole response invalid: no credentials');
    }

    return {
      accessKeyId: result.credentials.AccessKeyId,
      accessKeySecret: result.credentials.AccessKeySecret,
      securityToken: result.credentials.SecurityToken,
      expiration: result.credentials.Expiration,
    };
  }

  /**
   * 构建 STS 策略
   *
   * 限制临时凭证只能上传到指定路径
   *
   * @param bucket OSS Bucket 名称
   * @param uploadPath 上传路径前缀（可选），如果未提供则使用默认前缀
   * @returns STS 策略对象
   */
  private buildPolicy(bucket: string, uploadPath?: string): object {
    let prefix = this.ossConfig.uploadPrefix || uploadPath;

    // 如果 prefix 以 / 结尾，则去掉
    if (prefix && prefix.endsWith('/')) {
      prefix = prefix.slice(0, -1);
    }
    // 如果 prefix 开头是 /，则去掉
    if (prefix && prefix.startsWith('/')) {
      prefix = prefix.slice(1);
    }

    return {
      Version: '1',
      Statement: [
        {
          Effect: 'Allow',
          Action: ['oss:PutObject', 'oss:PutObjectAcl', 'oss:GetObject', 'oss:GetObjectAcl'],
          // Resource 格式：acs:oss:*:*:bucket-name/path/*
          Resource: [`acs:oss:*:*:${bucket}/${prefix}/*`],
        },
        {
          Effect: 'Allow',
          Action: ['oss:ListObjects'],
          Resource: [`acs:oss:*:*:${bucket}`],
          Condition: {
            StringLike: {
              // 限制只能列出指定前缀的对象
              'oss:Prefix': [`${prefix}/*`],
            },
          },
        },
      ],
    };
  }
}
