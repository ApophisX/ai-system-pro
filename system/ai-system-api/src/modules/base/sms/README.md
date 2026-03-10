# SMS 模块

## 概述

SMS 模块提供短信验证码发送和验证功能，支持以下场景：

- **注册** (`register`) - 用户注册时发送验证码
- **找回密码** (`reset_password`) - 找回密码时发送验证码
- **修改密码** (`change_password`) - 修改密码时发送验证码
- **登录** (`login`) - 登录时发送验证码

## 功能特性

1. **图形验证码保护** - 发送短信验证码前必须先通过图形验证码验证
2. **验证码有效期** - 验证码 5 分钟有效（可配置）
3. **发送频率限制** - 60 秒内只能发送一次（可配置）
4. **一次性使用** - 验证码验证后自动删除
5. **阿里云短信集成** - 使用阿里云短信服务发送验证码

## API 接口

### 1. 发送短信验证码

**接口**: `POST /sms/send`

**请求参数**:

```json
{
  "phone": "13800138000",
  "scene": "register",
  "captchaId": "123e4567-e89b-12d3-a456-426614174000",
  "captchaCode": "ABCD"
}
```

**响应**:

```json
{
  "data": {
    "success": true,
    "message": "验证码已发送"
  }
}
```

### 2. 验证短信验证码

**接口**: `POST /sms/verify`

**请求参数**:

```json
{
  "phone": "13800138000",
  "scene": "register",
  "code": "123456"
}
```

**响应**:

```json
{
  "data": {
    "success": true,
    "message": "验证码验证成功"
  }
}
```

## 使用流程

1. **获取图形验证码**
   ```
   GET /captcha
   ```
   返回图形验证码 ID 和 SVG 图片

2. **发送短信验证码**
   ```
   POST /sms/send
   ```
   需要提供图形验证码 ID 和验证码

3. **验证短信验证码**
   ```
   POST /sms/verify
   ```
   验证用户输入的短信验证码

## 配置说明

### 环境变量

在 `.env` 文件中配置以下变量：

```env
# 阿里云短信配置
ALICLOUD_SMS_ACCESS_KEY_ID=your_access_key_id
ALICLOUD_SMS_ACCESS_KEY_SECRET=your_access_key_secret
ALICLOUD_SMS_ENDPOINT=dysmsapi.aliyuncs.com
ALICLOUD_SMS_SIGN_NAME=your_sign_name

# 短信模板代码（根据场景配置）
ALICLOUD_SMS_TEMPLATE_REGISTER=SMS_123456789
ALICLOUD_SMS_TEMPLATE_RESET_PASSWORD=SMS_123456790
ALICLOUD_SMS_TEMPLATE_CHANGE_PASSWORD=SMS_123456791
ALICLOUD_SMS_TEMPLATE_LOGIN=SMS_123456792

# 验证码配置（可选）
SMS_CODE_LENGTH=6
SMS_CODE_EXPIRE_SECONDS=300
SMS_SEND_INTERVAL_SECONDS=60
```

### Redis 配置

SMS 模块依赖 Redis 存储验证码，确保 Redis 服务正常运行。

## 短信模板

阿里云短信模板需要包含 `code` 参数，例如：

```
您的验证码是：${code}，5分钟内有效，请勿泄露给他人。
```

## 错误处理

### 常见错误

1. **图形验证码错误** - `400 Bad Request`
   ```json
   {
     "statusCode": 400,
     "message": "图形验证码错误或已过期"
   }
   ```

2. **发送过于频繁** - `429 Too Many Requests`
   ```json
   {
     "statusCode": 429,
     "message": "发送过于频繁，请 30 秒后再试"
   }
   ```

3. **验证码错误或已过期** - `200 OK` (但 success 为 false)
   ```json
   {
     "data": {
       "success": false,
       "message": "验证码错误或已过期"
     }
   }
   ```

## 依赖模块

- **RedisModule** - 用于存储验证码
- **CaptchaModule** - 用于图形验证码验证

## 注意事项

1. 验证码存储在 Redis 中，确保 Redis 服务稳定运行
2. 验证码验证后会自动删除，确保一次性使用
3. 发送频率限制基于手机号和场景，不同场景独立计数
4. 生产环境需要配置正确的阿里云短信服务参数


