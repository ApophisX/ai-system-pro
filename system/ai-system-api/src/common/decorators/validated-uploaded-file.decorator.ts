import {
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { fData } from '@/common/utils/file-utils';

/** 可传的 MIME 类型，如 'image/*'、'application/pdf'，多种用 | 连接如 'image/*|application/pdf' */
const DEFAULT_FILE_TYPE = 'image/*|application/*|video/*|audio/*';

/** 默认最大 30MB */
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;

/** 与 Multer 上传文件结构兼容的类型，用于 @ValidatedUploadedFile 装饰的参数 */
export interface UploadedFileRef {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

export interface ValidatedUploadedFileOptions {
  /** 是否必选，默认 false */
  required?: boolean;
  /** 允许的 MIME 类型，如 'image/*'、'application/pdf'，多种用 | 连接 */
  fileType?: string;
  /** 最大文件大小（字节），默认 30MB */
  maxSize?: number;
}

function createParseFilePipe(options: ValidatedUploadedFileOptions = {}): ParseFilePipe {
  const required = options.required ?? false;
  const maxSize = options.maxSize ?? DEFAULT_MAX_SIZE;
  const fileType = options.fileType ?? DEFAULT_FILE_TYPE;

  return new ParseFilePipe({
    fileIsRequired: required,
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    exceptionFactory: error => {
      return new BadRequestException(`文件上传失败: ${error}`);
    },
    validators: [
      new MaxFileSizeValidator({
        maxSize,
        message: `文件大小不能超过 ${fData(maxSize)}`,
      }),
      new FileTypeValidator({ fileType }),
    ],
  });
}

/**
 * 封装带校验的上传文件参数装饰器
 * @param options.required 是否必选
 * @param options.fileType 允许的 MIME 类型，如 'image/*'、'application/pdf'
 * @param options.maxSize 最大文件大小（字节）
 *
 * @example
 * @ValidatedUploadedFile({ required: true, fileType: 'image/*', maxSize: 10 * 1024 * 1024 })
 * file: UploadedFileRef
 */
export function ValidatedUploadedFile(options?: ValidatedUploadedFileOptions): ParameterDecorator {
  return UploadedFile(createParseFilePipe(options ?? {}));
}
