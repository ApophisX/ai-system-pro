import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateRecognitionDto, IdCardOcrDto } from './dto/create-recognition.dto';
import { UpdateRecognitionDto } from './dto/update-recognition.dto';
import { ConfigService } from '@nestjs/config';
import { RECOGNITION_CONFIG_KEY, RecognitionConfig } from '@/config';
import axios from 'axios';
import { OutputOcrIdCardFaceDto, OutputOcrIdCardBackDto } from './dto/output-recognition.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class RecognitionService {
  private readonly logger = new Logger(RecognitionService.name);

  // 三方ocr服务接口地址
  private readonly ocrServiceUrl: string;
  private readonly appCode: string;

  constructor(private readonly configService: ConfigService) {
    const recognitionConfig = this.configService.get<RecognitionConfig>(RECOGNITION_CONFIG_KEY);
    if (recognitionConfig) {
      this.ocrServiceUrl = recognitionConfig.idCardOcr.endpoint;
      this.appCode = recognitionConfig.appCode;
    } else {
      this.logger.warn('OCR service URL not found');
    }
  }

  /**
   * 身份证OCR识别
   * @param dto 身份证OCR识别请求参数
   * @returns 身份证OCR识别响应
   */
  async ocrIdCard(dto: IdCardOcrDto) {
    const params = {
      image: dto.image,
      configure: {
        side: dto.side,
        quality_info: dto.quality_info,
      },
    };
    try {
      const { data } = await axios.post<OutputOcrIdCardFaceDto>(this.ocrServiceUrl, params, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `APPCODE ${this.appCode}`,
        },
        timeout: 15000,
      });
      if (!data.success) {
        throw new BadRequestException('身份证识别失败，请重新上传照片');
      }
      return data;
    } catch (error: any) {
      const msg = error.response?.data?.message ?? error.response?.data?.msg ?? error.message;
      this.logger.error(`身份证 OCR 识别失败: ${msg}`);
      throw new BadRequestException(`身份证识别失败，请重新上传照片`);
    }
  }
}
