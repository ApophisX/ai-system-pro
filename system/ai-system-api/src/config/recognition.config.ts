/**
 * 识别服务配置（三方）
 *
 * 人脸识别、身份证 OCR 等能力依赖的第三方服务配置
 * 支持阿里云、腾讯云等厂商
 */

import { registerAs } from '@nestjs/config';

export const RECOGNITION_CONFIG_KEY = 'recognition';

export const recognitionConfig = registerAs(RECOGNITION_CONFIG_KEY, () => ({
  /** 当前使用的厂商 */
  provider: process.env.RECOGNITION_PROVIDER || 'alicloud',
  appCode: process.env.ALIYUN_APP_CODE || '',
  /** 人脸识别配置 */
  face: {
    enabled: process.env.RECOGNITION_FACE_ENABLED !== 'false',
    /** 人脸比对/核身接口地址（若与默认 endpoint 不同可单独指定） */
    endpoint: process.env.RECOGNITION_FACE_ENDPOINT || '',
    /** 实人认证 / 人脸核身场景 ID（厂商侧配置） */
    sceneId: process.env.RECOGNITION_FACE_SCENE_ID || '',
  },

  /** 身份证 OCR 配置 */
  idCardOcr: {
    enabled: process.env.RECOGNITION_ID_CARD_OCR_ENABLED !== 'false',
    /** 身份证 OCR 接口地址（兼容现有 ocrServiceUrl 逻辑时可由此读取） */
    endpoint: process.env.RECOGNITION_ID_CARD_OCR_ENDPOINT || '',
  },
}));

export type RecognitionConfig = ReturnType<typeof recognitionConfig>;
