import { Request } from 'express';
import { FORWARDED_FOR_HEADER } from '../constants/request-header.constant';

export function generateRandomString(length, addSpec = true) {
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  if (addSpec) {
    characters += '~!@#$%^&*()_+-=';
  }

  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

export function generateRandomCode(length, addSpec = false) {
  let characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ';

  if (addSpec) {
    characters += '~!@#$%^&*()_+-=';
  }

  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

/**
 * 获取客户端ip 返回的是ipv6
 * @param req
 * @returns
 */
export function getClientIp(req: Request): string {
  if (req.header(FORWARDED_FOR_HEADER)) {
    return req.header(FORWARDED_FOR_HEADER) as string;
  }
  // natapp ip标识
  if (req.header('x-real-ip')) {
    return req.header('x-real-ip') as string;
  }
  return req.ips.length ? req.ips[0] : req.ip || '';
}
