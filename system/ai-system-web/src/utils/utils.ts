export function encryptPhone(phone?: string | null): string {
  if (!phone) return '';
  if (!/^1\d{10}$/.test(phone)) return phone; // 简单手机号校验
  return `${phone.substring(0, 3)}****${phone.substring(7)}`;
}

export function isUrl(url?: string): boolean {
  if (!url) return false;
  return /^https?:\/\//.test(url);
}
