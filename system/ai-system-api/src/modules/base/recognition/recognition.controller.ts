import { Body, Controller, Post } from '@nestjs/common';
import { RecognitionService } from './recognition.service';
import { IdCardOcrDto } from './dto/create-recognition.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';
import { OutputOcrIdCardFaceDto, OutputOcrIdCardBackDto } from './dto/output-recognition.dto';

@Controller('recognition')
export class RecognitionController {
  constructor(private readonly recognitionService: RecognitionService) {}

  /**
   * 身份证OCR识别
   * @param file 身份证图片
   * @returns 身份证信息
   * @description 身份证OCR识别
   */
  @Post('ocr/id-card/face')
  @SwaggerApiResponse(OutputOcrIdCardFaceDto, {
    description: '身份证OCR识别成功',
  })
  async ocrIdCardFace(@Body() dto: IdCardOcrDto) {
    dto.side = 'face';
    const result = await this.recognitionService.ocrIdCard(dto);
    return { data: result, message: '识别成功' };
  }

  /**
   * 身份证OCR识别背面
   * @param file 身份证图片
   * @returns 身份证信息
   * @description 身份证OCR识别
   */
  @Post('ocr/id-card/back')
  @SwaggerApiResponse(OutputOcrIdCardBackDto, {
    description: '身份证OCR识别成功',
  })
  async ocrIdCardBack(@Body() dto: IdCardOcrDto) {
    dto.side = 'back';
    const result = await this.recognitionService.ocrIdCard(dto);
    return { data: result, message: '识别成功' };
  }
}
