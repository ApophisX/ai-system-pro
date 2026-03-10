import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WxPayTradeType } from '../../enums/wx/wx-pay-trade-type.enum';
import { WxPayTradeState } from '../../enums/wx/wx-pay-trade-state.enum';
import { Expose } from 'class-transformer';

/**
 * 微信支付回调支付者信息 DTO
 */
export class OutputWxPayPayerDto {
  @ApiProperty({ description: '用户在直连商户appid下的唯一标识', example: 'oUpF8uMuAJO_M2pxb1Q9zNjWeS6o' })
  openid: string;
}

/**
 * 微信支付回调金额信息 DTO
 */
export class OutputWxPayAmountDto {
  @ApiProperty({ description: '订单总金额，单位为分', example: 10000 })
  total: number;

  @ApiProperty({ description: '用户支付金额，单位为分', example: 10000 })
  payer_total: number;

  @ApiProperty({ description: '货币类型', example: 'CNY' })
  currency: string;

  @ApiProperty({ description: '用户支付币种', example: 'CNY' })
  payer_currency: string;
}

/**
 * 微信支付回调场景信息 DTO
 */
export class OutputWxPaySceneInfoDto {
  @ApiPropertyOptional({ description: '商户端设备号', example: '013467007045764' })
  device_id?: string;
}

/**
 * 微信支付回调支付结果 DTO
 *
 * 支付回调解密后的支付结果数据
 * 文档：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_3_5.shtml
 */
export class OutputWxPayCallbackResultDto {
  @ApiProperty({ description: '商户号', example: '1234567890' })
  mchid: string;

  @ApiProperty({ description: '应用ID', example: 'wx1234567890abcdef' })
  appid: string;

  @ApiProperty({
    description: '商户订单号，只能是数字、大小写字母_-*且在同一个商户号下唯一',
    example: '202312011234567890',
  })
  out_trade_no: string;

  @ApiProperty({ description: '微信支付系统生成的订单号', example: '1217752501201407033233368018' })
  transaction_id: string;

  @ApiProperty({
    description: '交易类型',
    enum: WxPayTradeType,
    example: WxPayTradeType.MWEB,
  })
  trade_type: WxPayTradeType;

  @ApiProperty({
    description: '交易状态',
    enum: WxPayTradeState,
    example: WxPayTradeState.SUCCESS,
  })
  trade_state: WxPayTradeState;

  @ApiProperty({ description: '交易状态描述', example: '支付成功' })
  trade_state_desc: string;

  @ApiProperty({
    description: '银行类型，采用字符串类型的银行标识',
    example: 'CMC',
  })
  bank_type: string;

  @ApiPropertyOptional({
    description: '附加数据，在查询API和支付通知中原样返回',
    example: '附加数据',
  })
  attach?: string;

  @ApiProperty({
    description: '支付完成时间',
    example: '2023-06-18T07:28:56+08:00',
  })
  success_time: string;

  @ApiProperty({ description: '支付者信息', type: () => OutputWxPayPayerDto })
  payer: OutputWxPayPayerDto;

  @ApiProperty({ description: '订单金额信息', type: () => OutputWxPayAmountDto })
  amount: OutputWxPayAmountDto;

  @ApiPropertyOptional({ description: '场景信息', type: () => OutputWxPaySceneInfoDto })
  scene_info?: OutputWxPaySceneInfoDto;

  @ApiPropertyOptional({
    description: '优惠功能，享受优惠时返回该字段',
    example: null,
  })
  promotion_detail?: any;
}

/**
 * 微信平台证书加密信息 DTO
 */
export class OutputWxPayEncryptCertificateDto {
  @ApiProperty({ description: '加密算法', example: 'AEAD_AES_256_GCM' })
  algorithm: string;

  @ApiProperty({ description: '随机串', example: 'fdasflkja484w' })
  nonce: string;

  @ApiProperty({ description: '附加数据', example: 'fdasfwqewlkja484w' })
  associated_data: string;

  @ApiProperty({ description: '证书密文', example: 'base64_encoded_ciphertext' })
  ciphertext: string;
}

/**
 * 微信平台证书响应 DTO
 *
 * 获取平台证书列表的响应数据
 * 文档：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/wechatpay5_1.shtml
 */
export class OutputWxPayCertificatesDto {
  @ApiPropertyOptional({
    description: '证书公钥，通过解密获得，自定义属性，不是微信返回的',
    example: '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----',
  })
  publicKey?: string;

  @ApiProperty({ description: '证书序列号', example: '1DDE55AD98ED71D6EDD4A4A16996DE7B47773A8C' })
  serial_no: string;

  @ApiProperty({ description: '证书生效时间', example: '2018-06-08T10:34:56+08:00' })
  effective_time: string;

  @ApiProperty({ description: '证书过期时间', example: '2023-06-08T10:34:56+08:00' })
  expire_time: string;

  @ApiProperty({ description: '加密的证书信息', type: () => OutputWxPayEncryptCertificateDto })
  encrypt_certificate: OutputWxPayEncryptCertificateDto;
}

export class OutputWxMiniProgramPaymentDto {
  @ApiProperty({
    description: '时间戳，从 1970 年 1 月 1 日 00:00:00 至今的秒数，即当前的时间',
    example: '1622470420',
  })
  @Expose()
  timeStamp: string;

  @ApiProperty({
    description: '随机字符串，长度为32个字符以下',
    example: '5K8264ILTKCH16CQ2502SI8ZNMTM67VS',
  })
  @Expose()
  nonceStr: string;

  @ApiProperty({
    description: '统一下单接口返回的 prepay_id 参数值，提交格式如：prepay_id=***',
    example: 'prepay_id=wx201410272009395522657a690389285100',
  })
  @Expose()
  package: string;

  // /** 仅在微信支付 v2 版本接口适用 */
  // MD5
  // /** 仅在微信支付 v2 版本接口适用 */
  // 'HMAC-SHA256'
  // /** 仅在微信支付 v3 版本接口适用 */
  // RSA
  @ApiProperty({
    enum: ['MD5', 'HMAC-SHA256', 'RSA'],
    description: '签名算法，应与后台下单时的值一致，如 MD5 或 HMAC-SHA256,RSA',
    example: 'HMAC-SHA256',
  })
  @Expose()
  signType?: 'MD5' | 'HMAC-SHA256' | 'RSA';

  @ApiProperty({
    description: '签名，微信小程序调起支付使用的签名串',
    example: 'C380BEC2BFD727A4B6845133519F3AD6',
  })
  @Expose()
  paySign: string;
}

// 为了向后兼容，保留旧名称
export class WeChatPayCallbackPayResultDto extends OutputWxPayCallbackResultDto {}
export class WeChatCertificatesResponse extends OutputWxPayCertificatesDto {}
