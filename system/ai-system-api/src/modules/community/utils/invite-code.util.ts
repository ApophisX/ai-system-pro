/**
 * 邀请码生成工具
 *
 * 6-8 位 Base36 风格（排除易混淆字符 0/O、1/I）
 */
const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateInviteCode(length: number = 6): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
}
