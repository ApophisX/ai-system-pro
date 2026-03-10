import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * 身份证OCR识别响应 - 正面
 */
export class OutputOcrIdCardFaceDto {
  @ApiProperty({ description: '是否成功', example: true })
  @Expose()
  success: boolean;

  @ApiProperty({ description: '住址', example: '江苏省宿迁市宿城区洋河镇马元村七组25号' })
  @Expose()
  address: string;

  @ApiProperty({ description: '旋转角度', example: 0 })
  @Expose()
  angle: number;

  @ApiProperty({ description: '出生日期', example: '19961108' })
  @Expose()
  birth: string;

  @ApiProperty({ description: '配置字符串', example: '{"side":"face","quality_info":false}' })
  @Expose()
  config_str: string;

  @ApiProperty({ description: '是否伪造', example: false })
  @Expose()
  is_fake: boolean;

  @ApiProperty({ description: '姓名', example: '孙钊' })
  @Expose()
  name: string;

  @ApiProperty({ description: '民族', example: '汉' })
  @Expose()
  nationality: string;

  @ApiProperty({ description: '身份证号码', example: '321321199611087235' })
  @Expose()
  num: string;

  @ApiProperty({ description: '请求ID', example: 'D1D719F4-B243-49BB-BDB7-2BE8E6E1C7D2' })
  @Expose()
  request_id: string;

  @ApiProperty({ description: '性别', example: '男' })
  @Expose()
  sex: string;
}

/**
 * 身份证OCR识别响应 - 反面
 */
export class OutputOcrIdCardBackDto {
  @ApiProperty({ description: '旋转角度', example: 0 })
  @Expose()
  angle: number;

  @ApiProperty({ description: '配置字符串', example: '{"side":"back","quality_info":false}' })
  @Expose()
  config_str: string;

  @ApiProperty({ description: '有效期截止日期', example: '20320525' })
  @Expose()
  end_date: string;

  @ApiProperty({ description: '是否伪造', example: false })
  @Expose()
  is_fake: boolean;

  @ApiProperty({ description: '签发机关', example: '宿迁市公安局宿城分局' })
  @Expose()
  issue: string;

  @ApiProperty({ description: '请求ID', example: '183793A8-85A4-4D73-8377-C6E1C5877615' })
  @Expose()
  request_id: string;

  @ApiProperty({ description: '有效期开始日期', example: '20220525' })
  @Expose()
  start_date: string;

  @ApiProperty({ description: '是否成功', example: true })
  @Expose()
  success: boolean;
}
