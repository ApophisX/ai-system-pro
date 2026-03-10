/**
 * 微信配置
 *
 * 微信支付、小程序等微信相关配置
 */

import { registerAs } from '@nestjs/config';
import * as fs from 'fs-extra';
import * as path from 'path';

export const WECHAT_CONFIG_KEY = 'wechat';

export const wechatConfig = registerAs(WECHAT_CONFIG_KEY, () => {
  // 微信小程序配置
  const miniProgram = {
    appId: process.env.WECHAT_MINI_PROGRAM_APP_ID || '',
    appSecret: process.env.WECHAT_MINI_PROGRAM_APP_SECRET || '',
  };

  // 证书文件路径配置
  const certDir = process.env.WECHAT_PAY_CERT_DIR || path.join(process.cwd(), 'cert/wechat');
  const certPublicKeyPath = process.env.WECHAT_PAY_CERT_PUBLIC_KEY_PATH || path.join(certDir, 'apiclient_cert.pem');
  const certPrivateKeyPath = process.env.WECHAT_PAY_CERT_PRIVATE_KEY_PATH || path.join(certDir, 'apiclient_key.pem');
  const publicKeyPath = process.env.WECHAT_PAY_CERT_PUBLIC_KEY_PATH || path.join(certDir, 'pub_key.pem');

  // 微信支付配置
  const pay = {
    appId: process.env.WECHAT_MINI_PROGRAM_APP_ID || '',
    mchId: process.env.WECHAT_MCH_ID || '',
    apiV3Key: process.env.WECHAT_API_V3_KEY || '',
    apiV2Key: process.env.WECHAT_API_V2_KEY || '',
    serialNo: process.env.WECHAT_PAY_SERIAL_NO || process.env.WECHAT_SERIAL_NO || '',
    notifyUrl: `${process.env.API_HOST || ''}/api/payment/wx-pay/notify`,
    apiHost: process.env.WECHAT_API_HOST || '',
    // 读取证书文件内容
    certPublicKey: (() => {
      try {
        if (fs.existsSync(certPublicKeyPath)) {
          return fs.readFileSync(certPublicKeyPath);
        }
      } catch {
        console.warn(`警告：无法从 ${certPublicKeyPath} 读取微信支付公钥`);
      }
      return null;
    })(),
    certPrivateKey: (() => {
      try {
        if (fs.existsSync(certPrivateKeyPath)) {
          return fs.readFileSync(certPrivateKeyPath);
        }
      } catch {
        console.warn(`警告：无法从 ${certPrivateKeyPath} 读取微信支付私钥`);
      }
      return null;
    })(),
    publicKey: (() => {
      try {
        if (fs.existsSync(publicKeyPath)) {
          return fs.readFileSync(publicKeyPath);
        }
      } catch {
        console.warn(`警告：无法从 ${publicKeyPath} 读取微信支付公钥`);
      }
      return null;
    })(),
    // TODO，后面待删除，平台证书切换成微信支付公钥
    publicKeyId: process.env.WECHAT_PAY_PUBLIC_KEY_ID || '',
  };

  return {
    miniProgram,
    pay,
  };
});

export type WeChatConfig = ReturnType<typeof wechatConfig>;
export type WeChatMiniProgramConfig = WeChatConfig['miniProgram'];
export type WeChatPayConfig = WeChatConfig['pay'];
