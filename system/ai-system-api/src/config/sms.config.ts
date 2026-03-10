/**
 * SMS 配置
 *
 * 短信服务相关配置（阿里云短信）
 */

import { registerAs } from '@nestjs/config';

export const SMS_CONFIG_KEY = 'sms';

export const smsConfig = registerAs(SMS_CONFIG_KEY, () => ({
  provider: process.env.SMS_PROVIDER || 'alicloud',
  alicloud: {
    accessKeyId: process.env.ALICLOUD_STS_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.ALICLOUD_STS_ACCESS_KEY_SECRET || '',
    endpoint: process.env.ALICLOUD_SMS_ENDPOINT || 'dysmsapi.aliyuncs.com',
    signName: process.env.ALICLOUD_SMS_SIGN_NAME || '',
    templateCode: {
      register: process.env.ALICLOUD_SMS_TEMPLATE_REGISTER || '',
      login: process.env.ALICLOUD_SMS_TEMPLATE_LOGIN || '',
      reset_password: process.env.ALICLOUD_SMS_TEMPLATE_RESET_PASSWORD || '',
      change_password: process.env.ALICLOUD_SMS_TEMPLATE_CHANGE_PASSWORD || '',
    },
  },
  testCode: process.env.SMS_TEST_CODE || '123456',
  codeLength: parseInt(process.env.SMS_CODE_LENGTH || '6', 10),
  codeExpireSeconds: parseInt(process.env.SMS_CODE_EXPIRE_SECONDS || '300', 10), // 5 分钟
  sendIntervalSeconds: parseInt(process.env.SMS_SEND_INTERVAL_SECONDS || '60', 10), // 60 秒内只能发送一次
}));

export type SmsConfig = ReturnType<typeof smsConfig>;
