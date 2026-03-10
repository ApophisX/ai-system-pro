import { Transform } from 'class-transformer';

/**
 * 自动 trim 字符串字段
 */
export function Trim() {
  return Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
}
