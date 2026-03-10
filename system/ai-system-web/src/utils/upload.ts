import { ossUploader, type OssUploadResult } from 'src/lib/oss-uploader';

import { isUrl } from '.';

export function splitFiles(files: (File | string)[]) {
  const existingFiles = files.filter((file: File | string) => typeof file === 'string') as string[];
  const newFiles = files.filter((file: File | string) => file instanceof File) as File[];
  return {
    existingFiles,
    newFiles,
  };
}

export function combineImageUrls(urls: string[], uploadFiles: OssUploadResult[]) {
  const uploadPaths = uploadFiles.map((item) => item.path);
  const imagePaths = [...urls, ...uploadPaths].map((item) => {
    if (isUrl(item)) {
      return new URL(item).pathname;
    }
    return item;
  });
  const uploadUrls = uploadPaths.map((path) => ossUploader.getSignatureUrl(path));
  const imageUrls = [...urls, ...uploadUrls];

  return {
    imagePaths,
    imageUrls,
  };
}
