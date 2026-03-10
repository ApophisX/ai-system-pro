import OSS from 'ali-oss';

import { OssControllerGetUploadCredentialsV1 } from 'src/services/API/OSS';

// ----------------------------------------------------------------------

/**
 * OSS 上传配置选项
 */
export interface OssUploadOptions {
  /** 上传路径前缀（可选），用于限制上传路径 */
  uploadPath?: string;
  /** 是否自动生成文件名（默认：true） */
  autoGenerateFileName?: boolean;
  /** 文件上传进度回调 */
  onProgress?: (progress: number) => void;
}

/**
 * OSS 上传结果
 */
export interface OssUploadResult {
  /** 文件 URL */
  url: string;
  /** 文件路径（OSS 中的路径） */
  path: string;
  /** 文件名 */
  name: string;
}

/**
 * OSS 上传辅助类
 *
 * 用于上传图片到阿里云 OSS，支持：
 * - 自动获取临时凭证
 * - 文件上传
 * - 上传进度回调
 * - 自动生成文件名
 */
class OssUploader {
  private client: OSS | null = null;
  private credentials: MyApi.OutputOssCredentialsDto | null = null;
  private credentialsExpiration: number = 0;

  /**
   * 获取 OSS 客户端实例
   * 如果凭证过期或不存在，会自动获取新凭证
   */
  private async getClient(uploadPath?: string): Promise<OSS> {
    const now = Date.now();

    // 如果凭证存在且未过期，直接使用
    if (this.client && this.credentials && this.credentialsExpiration > now) {
      return this.client;
    }

    // 获取新的凭证
    const response = await OssControllerGetUploadCredentialsV1({ uploadPath }, { showError: true });

    if (!response.data) {
      throw new Error('获取 OSS 凭证失败');
    }

    this.credentials = response.data.data;

    // 解析过期时间（ISO 8601 格式）
    const expirationDate = new Date(this.credentials.expiration);
    this.credentialsExpiration = expirationDate.getTime();

    // 创建 OSS 客户端
    this.client = new OSS({
      accessKeyId: this.credentials.accessKeyId,
      accessKeySecret: this.credentials.accessKeySecret,
      stsToken: this.credentials.securityToken,
      region: this.credentials.region,
      bucket: this.credentials.bucket,
      endpoint: this.credentials.endpoint,
      cname: true,
    });

    return this.client;
  }

  /**
   * 生成文件名
   * 格式：{timestamp}-{random}.{ext}
   */
  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = originalName.split('.').pop() || 'jpg';
    return `${timestamp}-${random}.${ext}`;
  }

  /**
   * 上传文件到 OSS
   *
   * @param file 要上传的文件
   * @param options 上传选项
   * @returns 上传结果
   *
   * @example
   * ```ts
   * const uploader = new OssUploader();
   * const result = await uploader.uploadFile(file, {
   *   uploadPath: 'images/',
   *   onProgress: (progress) => console.log(`上传进度: ${progress}%`)
   * });
   * console.log(result.url); // 文件访问 URL
   * ```
   */
  async uploadFile(file: File, options: OssUploadOptions = {}): Promise<OssUploadResult> {
    const { uploadPath = '', autoGenerateFileName = true, onProgress } = options;

    // 获取 OSS 客户端
    const client = await this.getClient(uploadPath);

    // 生成文件路径
    const fileName = autoGenerateFileName ? this.generateFileName(file.name) : file.name;
    const objectKey = uploadPath ? `${uploadPath.replace(/\/$/, '')}/${fileName}` : fileName;

    // 上传文件
    try {
      // 如果需要进度回调，使用 multipartUpload（支持进度）
      // 否则使用 put 方法（更简单快速，但不支持进度）
      if (onProgress) {
        // 使用 multipartUpload 支持进度回调
        await client.multipartUpload(objectKey, file, {
          progress: (...args: any[]) => {
            // multipartUpload 的 progress 回调参数: (percentage, checkpoint)
            // percentage 是 0-1 之间的数字
            const percentage = args[0] as number;
            if (typeof percentage === 'number' && onProgress) {
              onProgress(Math.round(percentage * 100));
            }
          },
        });

        // 获取文件 URL
        const url = client.generateObjectUrl(objectKey);

        return {
          url,
          path: objectKey,
          name: fileName,
        };
      }

      // 使用 put 方法上传（不支持进度回调，但更简单快速）
      const result = await client.put(objectKey, file);

      return {
        url: result.url,
        path: objectKey,
        name: fileName,
      };
    } catch (error) {
      console.error('OSS 上传失败:', error);
      throw new Error(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 批量上传文件到 OSS
   *
   * @param files 要上传的文件数组
   * @param options 上传选项
   * @returns 上传结果数组
   *
   * @example
   * ```ts
   * const uploader = new OssUploader();
   * const results = await uploader.uploadFiles([file1, file2], {
   *   uploadPath: 'images/',
   *   onProgress: (progress) => console.log(`总进度: ${progress}%`)
   * });
   * ```
   */
  async uploadFiles(files: File[], options: OssUploadOptions = {}): Promise<OssUploadResult[]> {
    const { onProgress } = options;
    const results: OssUploadResult[] = [];
    const total = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 单个文件的上传进度回调
      const fileProgress = onProgress
        ? (progress: number) => {
          // 计算总进度
          const totalProgress = Math.round((i * 100 + progress) / total);
          onProgress(totalProgress);
        }
        : undefined;

      const result = await this.uploadFile(file, {
        ...options,
        onProgress: fileProgress,
      });

      results.push(result);
    }

    return results;
  }

  /**
   * 删除 OSS 中的文件
   *
   * @param objectKey 文件路径（OSS 中的路径）
   * @returns 删除结果
   */
  async deleteFile(objectKey: string): Promise<void> {
    const client = await this.getClient();

    try {
      await client.delete(objectKey);
    } catch (error) {
      console.error('OSS 删除失败:', error);
      throw new Error(`文件删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 批量删除 OSS 中的文件
   *
   * @param objectKeys 文件路径数组
   * @returns 删除结果
   */
  async deleteFiles(objectKeys: string[]): Promise<void> {
    const client = await this.getClient();

    try {
      await client.deleteMulti(objectKeys);
    } catch (error) {
      console.error('OSS 批量删除失败:', error);
      throw new Error(`文件批量删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 获取签名url
  getSignatureUrl(
    url: string | undefined | null,
    options?: { options?: OSS.SignatureUrlOptions; realname?: string }
  ): string {
    if (!url) {
      return '';
    }

    if (url.startsWith('http')) {
      return url;
    }

    return this.client?.signatureUrl(url, {
      expires: 1800,
      subResource: options?.realname ? { realname: options.realname } : undefined,
      ...options?.options,
    }) || '';
  }

  /**
   * 清除缓存的凭证和客户端
   * 用于在凭证过期或需要重新获取时手动清除
   */
  clearCache(): void {
    this.client = null;
    this.credentials = null;
    this.credentialsExpiration = 0;
  }
}

// 导出单例实例
export const ossUploader = new OssUploader();

// 导出类，以便需要时可以创建新实例
export default OssUploader;
