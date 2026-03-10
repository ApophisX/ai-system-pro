import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';
import * as forge from 'node-forge';
import { WeChatPayConfig } from '@/config/wechat.config';
import { CreateWxPayDto, WeChatPayRequestDto } from '../dto/wx/create-wx-pay.dto';
import {
  OutputWxMiniProgramPaymentDto,
  OutputWxPayCallbackResultDto,
  OutputWxPayCertificatesDto,
} from '../dto/wx/output-wx-pay.dto';
import { plainToInstance } from 'class-transformer';

/**
 * 微信支付服务
 *
 * 提供微信支付相关功能：
 * - H5支付
 * - Native支付
 * - 支付回调验证
 * - 证书管理
 *
 * 官方文档：
 * - https://pay.weixin.qq.com/wiki/doc/apiv3/index.shtml
 * - 签名生成：https://pay.weixin.qq.com/wiki/doc/apiv3/wechatpay/wechatpay4_0.shtml
 * - 证书相关：https://pay.weixin.qq.com/wiki/doc/apiv3/wechatpay/wechatpay7_0.shtml#part-5
 *
 * 如何查看证书序列号？
 * openssl x509 -in apiclient_cert.pem -noout -serial
 */
@Injectable()
export class WxPayService {
  private readonly logger = new Logger(WxPayService.name);
  private readonly config: WeChatPayConfig;
  private readonly axiosInstance: AxiosInstance;

  // 微信支付 API 端点
  private readonly AUTH_TYPE = 'WECHATPAY2-SHA256-RSA2048';
  private readonly PAY_URL_V3 = {
    H5: '/v3/pay/transactions/h5',
    NATIVE: '/v3/pay/transactions/native',
    JSAPI: '/v3/pay/transactions/jsapi',
    JSAPI_REFUND: '/v3/refund/domestic/refunds',
    JSAPI_ORDER: '/v3/pay/transactions/id/',
    JSAPI_REFUND_QUERY: '/v3/refund/domestic/refunds/',
  };
  private readonly QUERY_CERTIFICATES_URL = '/v3/certificates';

  // 平台证书缓存：key 是 serialNo, value 是 publicKey
  private certificates: Record<string, string> = {};

  constructor(private readonly configService: ConfigService) {
    const wechatConfig = this.configService.get<WeChatPayConfig>('wechat.pay');
    if (!wechatConfig) {
      throw new Error('微信支付配置未找到，请检查配置文件');
    }
    this.config = wechatConfig;

    // 初始化 HTTP 客户端
    this.axiosInstance = axios.create({
      baseURL: 'https://api.mch.weixin.qq.com',
      timeout: 10000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',

        // TODO，后面待删除，平台证书切换成微信支付公钥
        ...(this.config.publicKeyId
          ? {
              'Wechatpay-Serial': this.config.publicKeyId,
            }
          : {}),
      },
    });

    this.logger.log('微信支付服务初始化完成');
  }

  // ======================================  支付相关  ===========================================

  // 微信小程序支付
  /**
   * 微信小程序支付
   * 文档：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_1.shtml
   * @param weChatPayDto 支付参数
   * @returns 支付结果
   */
  async jsApiPay(payDto: WxPay.WxPayMiniProgramRequestParams): Promise<OutputWxMiniProgramPaymentDto> {
    try {
      // const order = await this.queryOrder(payDto.out_trade_no);
      // if (order && order?.trade_state === 'SUCCESS') {
      //   throw new BadRequestException('订单已支付，请勿重复支付');
      // }
      const params: WxPay.WxPayMiniProgramRequestParams & WxPay.WxPayBase = {
        ...payDto,
        appid: this.config.appId,
        mchid: this.config.mchId,
        notify_url: `${this.config.apiHost}${payDto.notify_url}`,
      };
      this.logger.log(`微信小程序支付请求: ${JSON.stringify(params)}`);
      const authorization = this.buildAuthorization('POST', this.PAY_URL_V3.JSAPI, params);
      const result = await this.axiosInstance.post<{ prepay_id: string }>(this.PAY_URL_V3.JSAPI, params, {
        headers: { Authorization: authorization },
      });
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const nonceStr = this.generateNonceStr();
      const prepayIdPackage = `prepay_id=${result.data.prepay_id}`;
      const plain = plainToInstance(OutputWxMiniProgramPaymentDto, {
        timeStamp: timestamp,
        nonceStr: nonceStr,
        package: prepayIdPackage,
        paySign: this.buildMiniProgramSignature(this.config.appId, timestamp, nonceStr, prepayIdPackage),
        signType: 'RSA',
      });
      this.logger.log(`微信小程序支付请求成功: out_trade_no=${params.out_trade_no}`);
      return plain;
    } catch (error: any) {
      this.logger.error(`微信小程序支付请求失败: ${error.message}`, error.stack);
      throw new BadRequestException(error.response?.data || error.message);
    }
  }

  // 微信H5支付
  /**
   * 微信H5支付
   *
   * 文档：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_3_1.shtml
   *
   * @param weChatPayDto 支付参数
   * @returns 支付结果
   */
  async wxH5Pay(weChatPayDto: CreateWxPayDto): Promise<any> {
    try {
      const params: WeChatPayRequestDto = {
        ...weChatPayDto,
        appid: this.config.appId,
        mchid: this.config.mchId,
        notify_url: this.config.notifyUrl,
      };

      const authorization = this.buildAuthorization('POST', this.PAY_URL_V3.H5, params);
      const result = await this.axiosInstance.post(this.PAY_URL_V3.H5, params, {
        headers: {
          Authorization: authorization,
        },
      });

      this.logger.log(`H5支付请求成功: out_trade_no=${weChatPayDto.out_trade_no}`);
      return result.data;
    } catch (error: any) {
      this.logger.error(`H5支付请求失败: ${error.message}`, error.stack);
      throw new BadRequestException(error.response?.data || error.message);
    }
  }

  // ======================================  查询相关  ===========================================
  // 商户订单号查询订单
  async queryOrder(outTradeNo: string): Promise<WxPay.Order.Result | null> {
    try {
      const url = `${this.PAY_URL_V3.JSAPI_ORDER}${outTradeNo}?mchid=${this.config.mchId}`;
      const authorization = this.buildAuthorization('GET', url);
      const result = await this.axiosInstance.get<WxPay.Order.Result>(url, {
        headers: { Authorization: authorization },
      });
      return result.data;
    } catch (error: any) {
      // this.logger.error(`微信订单查询请求失败: ${error.message}`, error.stack);
      // throw new BadRequestException(error.response?.data || error.message);
      return null;
    }
  }

  // 退款查询
  async queryRefund(outRefundNo: string): Promise<WxPay.Refund.Result | null> {
    try {
      const url = `${this.PAY_URL_V3.JSAPI_REFUND_QUERY}${outRefundNo}?mchid=${this.config.mchId}`;
      const authorization = this.buildAuthorization('GET', url);
      const result = await this.axiosInstance.get<WxPay.Refund.Result>(url, {
        headers: { Authorization: authorization },
      });
      return result.data;
    } catch (error: any) {
      // this.logger.error(`微信退款查询请求失败: ${error.message}`, error.stack);
      // throw new BadRequestException(error.response?.data || error.message);
      return null;
    }
  }

  // ======================================  退款相关  ===========================================
  // 微信退款
  /**
   * 微信退款
   * @param weChatPayDto 退款参数
   * @returns 退款结果
   */
  async jsApiRefund(params: WxPay.Refund.RequestParams): Promise<WxPay.Refund.Result> {
    try {
      const authorization = this.buildAuthorization('POST', this.PAY_URL_V3.JSAPI_REFUND, params);
      const result = await this.axiosInstance.post<WxPay.Refund.Result>(this.PAY_URL_V3.JSAPI_REFUND, params, {
        headers: {
          Authorization: authorization,
        },
      });
      return result.data;
    } catch (error: any) {
      this.logger.error(
        `微信退款请求失败: out_trade_no=${params.out_trade_no}, out_refund_no=${params.out_refund_no}，${error.message},`,
        error.stack,
      );
      throw new BadRequestException(error.response?.data || error.message);
    }
  }

  // ======================================  签名验证 相关  ===========================================

  /**
   * 验证微信回调签名
   */
  public verifySign(params: WxPay.WxPaySignParams): Promise<boolean> | boolean {
    const { serial } = params;
    if (serial.startsWith('PUB_KEY_ID_')) {
      return this.verifySignByPublicKey(params);
    }
    return this.verifySignByPlatform(params);
  }

  // 平台证书验证回调
  /**
   * @deprecated 已作废
   * 平台证书验证回调
   *
   * 验证微信支付回调的签名
   * 注意：node 取头部信息时需要用小写，例如：req.headers['wechatpay-timestamp']
   *
   * @param params.timestamp HTTP头Wechatpay-Timestamp 中的应答时间戳
   * @param params.nonce HTTP头Wechatpay-Nonce 中的应答随机串
   * @param params.body 应答主体（response Body），需要按照接口返回的顺序进行验签
   * @param params.serial HTTP头Wechatpay-Serial 证书序列号
   * @param params.signature HTTP头Wechatpay-Signature 签名
   * @returns 验证结果
   */
  private async verifySignByPlatform(params: WxPay.WxPaySignParams): Promise<boolean> {
    const { timestamp, nonce, body, signature, serial } = params;

    // 获取平台证书公钥
    let certPublicKey = this.certificates[serial];
    if (!certPublicKey) {
      this.logger.log(`证书缓存未命中，拉取平台证书: serial=${serial}`);
      await this.fetchCertificates();
      certPublicKey = this.certificates[serial];
    }

    if (!certPublicKey) {
      this.logger.error(`平台证书序列号不相符，未找到平台序列号: serial=${serial}`);
      throw new ForbiddenException('平台证书序列号不相符，未找到平台序列号');
    }

    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    const data = `${timestamp}\n${nonce}\n${bodyStr}\n`;
    const verify = crypto.createVerify('RSA-SHA256').update(data).verify(certPublicKey, signature, 'base64');

    if (verify) {
      this.logger.log(`签名验证成功: serial=${serial}`);
    } else {
      this.logger.warn(`签名验证失败: serial=${serial}`);
    }

    return verify;
  }

  // 支付公钥验证回调
  /**
   * 支付公钥验证签名
   *
   * 验证微信支付回调的签名
   * 注意：node 取头部信息时需要用小写，例如：req.headers['wechatpay-timestamp']
   *
   * @param params.timestamp HTTP头Wechatpay-Timestamp 中的应答时间戳
   * @param params.nonce HTTP头Wechatpay-Nonce 中的应答随机串
   * @param params.body 应答主体（response Body），需要按照接口返回的顺序进行验签
   * @param params.serial HTTP头Wechatpay-Serial 证书序列号
   * @param params.signature HTTP头Wechatpay-Signature 签名
   * @returns 验证结果
   */
  private verifySignByPublicKey(params: WxPay.WxPaySignParams): boolean {
    const { timestamp, nonce, body, signature, serial } = params;
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    const data = `${timestamp}\n${nonce}\n${bodyStr}\n`;
    const verify = crypto.createVerify('RSA-SHA256').update(data).verify(this.config.publicKey, signature, 'base64');

    if (verify) {
      this.logger.log(`签名验证成功: serial=${serial}`);
    } else {
      this.logger.warn(`签名验证失败: serial=${serial}`);
    }

    return verify;
  }

  // 解密微信回调数据
  /**
   * 验证支付结果
   *
   * 验证并解密支付回调数据
   *
   * @param data 支付回调请求体
   * @returns 解密后的支付结果
   */
  public decryptWxPayCallback<T extends { out_trade_no: string; transaction_id: string }>(
    data: WxPay.WxPayNotifyResponse['resource'],
  ): T {
    const { nonce, ciphertext, associated_data = '' } = data;
    const decryptData = this.decryptGcm<T>({ ciphertext, associated_data, nonce });

    this.logger.log(
      `微信回调数据解密成功: out_trade_no=${decryptData.out_trade_no}, transaction_id=${decryptData.transaction_id}`,
      data,
    );
    return decryptData;
  }

  // ======================================  Private Methods  ===========================================

  // 获取平台证书列表
  /**
   * @deprecated 已作废
   * 获取平台证书列表
   *
   * 获取商户当前可用的平台证书列表。微信支付提供该接口，帮助商户后台系统实现平台证书的平滑更换。
   * 文档：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/wechatpay5_1.shtml
   *
   * @returns 证书列表
   */
  private async getCertificates(): Promise<OutputWxPayCertificatesDto[]> {
    try {
      const authorization = this.buildAuthorization('GET', this.QUERY_CERTIFICATES_URL);
      const result = await this.axiosInstance.get<{ data: OutputWxPayCertificatesDto[] }>(this.QUERY_CERTIFICATES_URL, {
        headers: {
          Authorization: authorization,
        },
      });

      const data = plainToInstance(OutputWxPayCertificatesDto, result.data.data);
      // 解密证书并提取公钥
      for (const item of data) {
        const { ciphertext, associated_data, nonce } = item.encrypt_certificate;
        const decryptCertificate = this.decryptGcm<string>({ ciphertext, associated_data, nonce });
        const cert = forge.pki.certificateFromPem(decryptCertificate);
        item.publicKey = forge.pki.publicKeyToPem(cert.publicKey);
      }

      this.logger.log(`获取平台证书成功，共 ${data.length} 个证书`);
      return data;
    } catch (error: any) {
      this.logger.error(`获取平台证书失败: ${error.message}`, error.stack);
      throw new BadRequestException(error.response?.data || error.message);
    }
  }

  /**
   * 证书和回调报文解密（APIv3密钥）
   *
   * 使用 AEAD_AES_256_GCM 算法解密
   * 文档：https://pay.weixin.qq.com/wiki/doc/apiv3/wechatpay/wechatpay4_2.shtml
   *
   * @param params.ciphertext Base64编码后的开启/停用结果数据密文
   * @param params.associated_data 附加数据
   * @param params.nonce 加密使用的随机串
   * @returns 解密后的数据
   */
  private decryptGcm<T>(params: { ciphertext: string; associated_data: string; nonce: string }): T {
    const { ciphertext, associated_data, nonce } = params;
    const key = Buffer.from(this.config.apiV3Key, 'utf8');
    const _ciphertext = Buffer.from(ciphertext, 'base64');

    // AEAD_AES_256_GCM 解密
    const authTag: Buffer = _ciphertext.subarray(_ciphertext.length - 16);
    const data = _ciphertext.subarray(0, _ciphertext.length - 16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from(associated_data));

    const decoded = decipher.update(data, undefined, 'utf8');
    decipher.final();

    try {
      return JSON.parse(decoded) as T;
    } catch {
      return decoded as any;
    }
  }

  /**
   * 拉取平台证书到缓存中
   *
   * 文档：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/wechatpay5_1.shtml
   */
  private async fetchCertificates(): Promise<void> {
    try {
      const authorization = this.buildAuthorization('GET', this.QUERY_CERTIFICATES_URL);
      const result = await this.axiosInstance.get<{ data: OutputWxPayCertificatesDto[] }>(this.QUERY_CERTIFICATES_URL, {
        headers: {
          Authorization: authorization,
        },
      });

      if (result.status === 200) {
        // const data = result.data.data as OutputWxPayCertificatesDto[];
        const data = plainToInstance(OutputWxPayCertificatesDto, result.data.data);
        const newCertificates: Record<string, string> = {};

        for (const item of data) {
          const { ciphertext, associated_data, nonce } = item.encrypt_certificate;
          const decryptCertificate = this.decryptGcm<string>({ ciphertext, associated_data, nonce });
          const cert = forge.pki.certificateFromPem(decryptCertificate);
          newCertificates[item.serial_no] = forge.pki.publicKeyToPem(cert.publicKey);
        }

        this.certificates = {
          ...this.certificates,
          ...newCertificates,
        };

        this.logger.log(`平台证书拉取成功，共 ${Object.keys(newCertificates).length} 个证书`);
      } else {
        throw new Error(`拉取平台证书失败，状态码: ${result.status}`);
      }
    } catch (error: any) {
      this.logger.error(`拉取平台证书失败: ${error.message}`, error.stack);
      throw new Error(`拉取平台证书失败: ${error.message}`);
    }
  }

  /**
   * 构建授权信息
   *
   * @param method HTTP 方法
   * @param url 请求 URL
   * @param params 请求参数（可选）
   * @returns 授权字符串
   */
  private buildAuthorization(method: string, url: string, params?: Record<string, any>): string {
    const nonceStr = this.generateNonceStr();
    const timestamp = this.generateTimestamp();
    const signature = this.buildSignature(method, nonceStr, timestamp, url, params);

    const authorization = `mchid="${this.config.mchId}",nonce_str="${nonceStr}",timestamp="${timestamp}",serial_no="${this.config.serialNo}",signature="${signature}"`;
    return `${this.AUTH_TYPE} ${authorization}`;
  }

  /**
   * 构造小程序支付签名
   * 签名串一共有四行，每一行为一个参数。结尾以\n（换行符，ASCII编码值为0x0A）结束，包括最后一行。
   * 小程序appID\n
   * 时间戳\n
   * 随机字符串\n
   * prepay_id=\n
   */
  private buildMiniProgramSignature(
    appId: string,
    timestamp: string,
    nonceStr: string,
    prepayIdPackage: string,
  ): string {
    // 修复：签名串最后一行应该是 prepay_id=xxx 格式
    const str = `${appId}\n${timestamp}\n${nonceStr}\n${prepayIdPackage}\n`;
    return this.signWithRsaSha256(str);
  }

  /**
   * 构建请求签名
   *
   * @param method HTTP 请求方式
   * @param nonceStr 随机字符串
   * @param timestamp 时间戳
   * @param url 请求接口
   * @param body 请求报文主体（可选）
   * @returns 签名
   */
  private buildSignature(
    method: string,
    nonceStr: string,
    timestamp: string,
    url: string,
    body?: string | Record<string, any>,
  ): string {
    let str = `${method}\n${url}\n${timestamp}\n${nonceStr}\n`;

    if (body) {
      if (typeof body === 'object') {
        str += JSON.stringify(body);
      } else {
        str += body;
      }
      str += '\n';
    }

    if (method === 'GET') {
      str += '\n';
    }

    return this.signWithRsaSha256(str);
  }

  /**
   * SHA256withRSA 签名
   *
   * @param data 待签名数据
   * @returns Base64 编码的签名
   */
  private signWithRsaSha256(data: string): string {
    if (!this.config.certPrivateKey) {
      throw new Error('缺少私钥文件');
    }

    const privateKey = Buffer.isBuffer(this.config.certPrivateKey)
      ? this.config.certPrivateKey.toString('utf8')
      : this.config.certPrivateKey;

    return crypto.createSign('RSA-SHA256').update(data).sign(privateKey, 'base64');
  }

  /**
   * 生成时间戳（秒）
   */
  private generateTimestamp(): string {
    return Math.floor(Date.now() / 1000).toString();
  }

  /**
   * 生成随机字符串
   */
  private generateNonceStr(): string {
    return Math.random().toString(36).substring(2, 17);
  }
}
