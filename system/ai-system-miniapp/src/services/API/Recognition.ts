// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 此处后端没有提供注释 POST /api/v1/recognition/ocr/id-card/back */
export async function RecognitionControllerOcrIdCardBackV1(body: MyApi.IdCardOcrDto, options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseOutputOcrIdCardBackDto>('/api/v1/recognition/ocr/id-card/back', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1/recognition/ocr/id-card/face */
export async function RecognitionControllerOcrIdCardFaceV1(body: MyApi.IdCardOcrDto, options?: { [key: string]: any }) {
  return request<MyApi.ApiResponseOutputOcrIdCardFaceDto>('/api/v1/recognition/ocr/id-card/face', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
