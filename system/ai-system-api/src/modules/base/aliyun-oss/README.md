# 阿里云 OSS 模块

提供阿里云 OSS 临时凭证生成服务，前端使用临时凭证直接上传文件到 OSS，减轻服务器压力。

## 功能特性

- ✅ 使用 STS（Security Token Service）生成临时访问凭证
- ✅ 支持路径限制策略，限制上传路径范围
- ✅ 自动过期管理，默认 1 小时有效期
- ✅ 基于用户身份生成会话名称
- ✅ 完整的 Swagger API 文档

## 环境变量配置

在 `.env` 文件中添加以下配置：

```bash
# OSS 基础配置
OSS_PROVIDER=alicloud
ALICLOUD_OSS_REGION=oss-cn-hangzhou
ALICLOUD_OSS_BUCKET=your-bucket-name
ALICLOUD_OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com

# STS 配置（用于生成临时凭证）
ALICLOUD_STS_ACCESS_KEY_ID=your-access-key-id
ALICLOUD_STS_ACCESS_KEY_SECRET=your-access-key-secret
ALICLOUD_STS_ROLE_ARN=acs:ram::123456789012:role/oss-upload-role
ALICLOUD_STS_ROLE_SESSION_NAME=oss-upload-session
ALICLOUD_STS_ENDPOINT=sts.cn-hangzhou.aliyuncs.com
ALICLOUD_STS_DURATION_SECONDS=3600

# 上传配置（可选）
OSS_UPLOAD_PREFIX=uploads
OSS_ALLOWED_MIME_TYPES=image/*,video/*,application/pdf
OSS_MAX_FILE_SIZE=10485760
```

## 阿里云 RAM 配置

### 1. 创建 RAM 角色

1. 登录阿里云控制台，进入 **RAM 访问控制**
2. 创建角色，选择 **阿里云账号** 类型
3. 配置角色信任策略（允许当前账号扮演该角色）

### 2. 配置角色权限策略

为角色添加 OSS 访问权限策略：

```json
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "oss:PutObject",
        "oss:PutObjectAcl",
        "oss:GetObject",
        "oss:GetObjectAcl",
        "oss:ListObjects"
      ],
      "Resource": ["acs:oss:*:*:your-bucket-name/*"]
    }
  ]
}
```

### 3. 获取角色 ARN

角色创建后，复制角色的 ARN，格式如：`acs:ram::123456789012:role/oss-upload-role`

## API 接口

### 获取 OSS 临时上传凭证

**接口地址：** `GET /oss/credentials`

**请求头：**

```
Authorization: Bearer <JWT_TOKEN>
```

**查询参数：**

- `uploadPath` (可选): 上传路径前缀，用于限制上传路径，例如：`user/avatar`
  - 如果提供：上传路径将被限制为 `{uploadPrefix}/{uploadPath}/*`
  - 如果未提供：上传路径将被限制为 `{uploadPrefix}/*`
  - **重要**：前端上传文件时，必须使用与策略匹配的路径前缀

**响应示例：**

```json
{
  "code": 0,
  "message": "获取上传凭证成功",
  "data": {
    "accessKeyId": "STS.xxx",
    "accessKeySecret": "xxx",
    "securityToken": "xxx",
    "expiration": "2024-01-01T12:00:00Z",
    "region": "oss-cn-hangzhou",
    "bucket": "your-bucket-name",
    "endpoint": "https://oss-cn-hangzhou.aliyuncs.com"
  }
}
```

## 前端使用示例

### 1. 安装依赖

```bash
npm install ali-oss
# 或
yarn add ali-oss
```

### 2. 获取临时凭证并上传文件

**重要提示**：

- 前端上传文件时，文件路径必须与获取凭证时使用的 `uploadPath` 参数匹配
- 如果获取凭证时使用了 `uploadPath=user/avatar`，那么上传的文件路径必须是 `common/user/avatar/xxx` 格式
- 路径前缀 `common` 来自配置中的 `OSS_UPLOAD_PREFIX`

```typescript
import OSS from 'ali-oss';

/**
 * 上传文件到 OSS
 * @param file 要上传的文件
 * @param uploadPath 上传路径（必须与获取凭证时使用的路径一致）
 */
async function uploadFile(file: File, uploadPath?: string) {
  try {
    // 1. 从后端获取临时凭证
    // 注意：uploadPath 参数必须与后续上传时使用的路径前缀匹配
    const queryParam = uploadPath ? `?uploadPath=${uploadPath}` : '';
    const response = await fetch(`/api/oss/credentials${queryParam}`, {
      headers: {
        Authorization: `Bearer ${yourJwtToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('获取上传凭证失败');
    }

    const { data: credentials } = await response.json();

    // 2. 使用临时凭证初始化 OSS 客户端
    const client = new OSS({
      region: credentials.region,
      accessKeyId: credentials.accessKeyId,
      accessKeySecret: credentials.accessKeySecret,
      stsToken: credentials.securityToken,
      bucket: credentials.bucket,
    });

    // 3. 构建文件路径
    // 重要：路径必须与策略匹配
    // 如果 uploadPath = 'user/avatar'，则文件路径应该是 'common/user/avatar/xxx'
    // 如果 uploadPath 未提供，则文件路径应该是 'common/xxx'
    const pathPrefix = uploadPath ? `common/${uploadPath}` : 'common';
    const fileName = `${pathPrefix}/${Date.now()}-${file.name}`;

    // 4. 上传文件
    const result = await client.put(fileName, file);

    console.log('文件上传成功：', result.url);
    return result;
  } catch (error) {
    console.error('文件上传失败：', error);
    if (error.code === 'AccessDenied') {
      console.error('权限被拒绝：请检查文件路径是否与策略匹配');
    }
    throw error;
  }
}

// 使用示例
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    try {
      const result = await uploadFile(file, 'user/avatar');
      console.log('上传成功，文件 URL:', result.url);
    } catch (error) {
      console.error('上传失败:', error);
    }
  }
});
```

### 3. React 组件示例

```tsx
import React, { useState } from 'react';
import OSS from 'ali-oss';

const FileUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>('');

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      // 获取临时凭证
      const credentialsResponse = await fetch(
        '/api/oss/credentials?uploadPath=user/avatar',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      const { data: credentials } = await credentialsResponse.json();

      // 初始化 OSS 客户端
      const client = new OSS({
        region: credentials.region,
        accessKeyId: credentials.accessKeyId,
        accessKeySecret: credentials.accessKeySecret,
        stsToken: credentials.securityToken,
        bucket: credentials.bucket,
      });

      // 上传文件
      // 重要：路径必须包含 'common' 前缀（来自配置），且与获取凭证时的 uploadPath 匹配
      const fileName = `common/user/avatar/${Date.now()}-${file.name}`;
      const result = await client.put(fileName, file);

      setFileUrl(result.url);
      console.log('上传成功:', result.url);
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleUpload(file);
          }
        }}
        disabled={uploading}
      />
      {uploading && <p>上传中...</p>}
      {fileUrl && <img src={fileUrl} alt="上传的文件" />}
    </div>
  );
};

export default FileUpload;
```

## OSS Bucket CORS 配置

为了支持前端直接上传，需要在 OSS Bucket 中配置 CORS：

1. 登录阿里云控制台，进入 **对象存储 OSS**
2. 选择对应的 Bucket，进入 **数据安全** > **跨域设置**
3. 添加 CORS 规则：

```
来源：https://your-domain.com
允许 Methods：POST, PUT, GET, HEAD
允许 Headers：*
暴露 Headers：ETag, x-oss-request-id
最大缓存时间：3600
```

## 安全说明

1. **临时凭证有效期**：默认 1 小时，可根据需要调整 `ALICLOUD_STS_DURATION_SECONDS`
2. **路径限制**：通过 `uploadPath` 参数限制上传路径，防止越权上传
3. **权限最小化**：RAM 角色只授予必要的 OSS 操作权限
4. **用户身份验证**：接口需要 JWT 认证，确保只有登录用户才能获取凭证

## 常见问题

### 1. AccessDenied 错误

如果遇到 `AccessDenied` 错误，请检查：

1. **路径不匹配**：前端上传的文件路径必须与获取凭证时使用的 `uploadPath` 参数匹配
   - 获取凭证：`/api/oss/credentials?uploadPath=user/avatar`
   - 上传路径：`common/user/avatar/xxx.jpg` ✅
   - 上传路径：`user/avatar/xxx.jpg` ❌（缺少 `common` 前缀）
   - 上传路径：`common/other/xxx.jpg` ❌（路径不匹配）

2. **策略配置错误**：检查 RAM 角色的权限策略是否正确配置

3. **路径格式**：确保路径使用正斜杠 `/`，不要使用反斜杠 `\`

### 2. 调试建议

1. 查看后端日志，确认生成的策略内容
2. 检查前端上传时使用的完整文件路径
3. 确保路径前缀与配置中的 `OSS_UPLOAD_PREFIX` 一致

## 注意事项

1. 临时凭证会在过期后失效，前端需要重新获取
2. 建议在上传前检查文件大小和类型
3. 生产环境建议配置 HTTPS
4. 定期检查 RAM 角色的权限策略，确保符合最小权限原则
5. **路径一致性**：获取凭证时使用的 `uploadPath` 必须与上传时使用的路径前缀完全匹配
