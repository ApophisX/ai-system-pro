import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 微信支付基础参数 DTO
 *
 * 包含所有支付方式共用的基础参数
 */
export class WeChatPayBaseDto {
  @ApiProperty({ description: '应用ID', example: 'wx1234567890abcdef' })
  @IsNotEmpty()
  @IsString()
  appid: string;

  @ApiProperty({ description: '商户号', example: '1234567890' })
  @IsNotEmpty()
  @IsString()
  mchid: string;

  @ApiProperty({ description: '支付回调通知地址', example: 'https://example.com/api/payment/wx-pay/notify' })
  @IsNotEmpty()
  @IsString()
  notify_url: string;
}

/**
 * 订单金额 DTO
 */
export class WeChatPayAmountDto {
  @ApiProperty({ description: '订单总金额，单位为分', example: 10000 })
  @IsNotEmpty()
  @IsNumber()
  total: number;

  @ApiPropertyOptional({ description: '货币类型，默认CNY', example: 'CNY', default: 'CNY' })
  @IsOptional()
  @IsString()
  currency?: string;
}

/**
 * 商户门店信息 DTO
 */
export class WeChatPayStoreInfoDto {
  @ApiProperty({ description: '门店编号', example: '0001' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiPropertyOptional({ description: '门店名称', example: '测试门店' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '地区编码', example: '440305' })
  @IsOptional()
  @IsString()
  area_code?: string;

  @ApiPropertyOptional({ description: '详细地址', example: '深圳市南山区科技园' })
  @IsOptional()
  @IsString()
  address?: string;
}

/**
 * H5支付场景信息 DTO
 */
export class WeChatPayH5InfoDto {
  @ApiProperty({
    description: '场景类型',
    example: 'Wap',
    enum: ['iOS', 'Android', 'Wap'],
  })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: '应用名称', example: '王者荣耀' })
  @IsOptional()
  @IsString()
  app_name?: string;

  @ApiPropertyOptional({ description: '网站URL', example: 'https://pay.qq.com' })
  @IsOptional()
  @IsString()
  app_url?: string;

  @ApiPropertyOptional({ description: 'iOS平台BundleID', example: 'com.tencent.wzryiOS' })
  @IsOptional()
  @IsString()
  bundle_id?: string;

  @ApiPropertyOptional({ description: 'Android平台PackageName', example: 'com.tencent.tmgp.sgame' })
  @IsOptional()
  @IsString()
  package_name?: string;
}

/**
 * 支付场景信息 DTO
 */
export class WeChatPaySceneInfoDto {
  @ApiProperty({ description: '用户终端IP', example: '127.0.0.1' })
  @IsNotEmpty()
  @IsString()
  payer_client_ip: string;

  @ApiPropertyOptional({ description: '商户端设备号', example: '013467007045764' })
  @IsOptional()
  @IsString()
  device_id?: string;

  @ApiPropertyOptional({ description: '商户门店信息' })
  @IsOptional()
  @ValidateNested()
  @Type(() => WeChatPayStoreInfoDto)
  store_info?: WeChatPayStoreInfoDto;

  @ApiProperty({ description: 'H5支付场景信息' })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => WeChatPayH5InfoDto)
  h5_info: WeChatPayH5InfoDto;
}

/**
 * 创建微信支付请求 DTO
 *
 * 用于创建微信支付订单
 * 文档：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_3_1.shtml
 */
export class CreateWxPayDto {
  @ApiProperty({ description: '商品描述', example: '商品描述信息' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: '商户订单号，只能是数字、大小写字母_-*且在同一个商户号下唯一',
    example: '202312011234567890',
  })
  @IsNotEmpty()
  @IsString()
  out_trade_no: string;

  @ApiProperty({ description: '订单金额' })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => WeChatPayAmountDto)
  amount: WeChatPayAmountDto;

  @ApiPropertyOptional({ description: '支付场景信息，H5支付时必填' })
  @IsOptional()
  @ValidateNested()
  @Type(() => WeChatPaySceneInfoDto)
  scene_info?: WeChatPaySceneInfoDto;

  @ApiPropertyOptional({ description: '附加数据，在查询API和支付通知中原样返回', example: '附加数据' })
  @IsOptional()
  @IsString()
  attach?: string;

  @ApiPropertyOptional({ description: '电子发票入口开放标识', example: false })
  @IsOptional()
  support_fapiao?: boolean;
}

class WeChatPayPayerDto {
  @ApiProperty({ description: '用户标识', example: 'oGbiC1--KMKlkaaJ9OtB_JbVLl-g' })
  @IsNotEmpty()
  @IsString()
  openid: string;
}

export class CreateWxMiniProgramPayDto extends CreateWxPayDto {
  @ApiProperty({ description: '用户标识', example: 'oGbiC1--KMKlkaaJ9OtB_JbVLl-g' })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => WeChatPayPayerDto)
  payer: WeChatPayPayerDto;
}

/**
 * 微信支付请求 DTO（内部使用）
 *
 * 包含基础参数和支付参数的完整请求体
 */
export class WeChatPayRequestDto extends WeChatPayBaseDto {
  description: string;
  out_trade_no: string;
  amount: WeChatPayAmountDto;
  scene_info?: WeChatPaySceneInfoDto;
  attach?: string;
  support_fapiao?: boolean;
  [key: string]: any;
}
