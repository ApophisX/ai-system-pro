import { Transform } from 'class-transformer';
import dayjs from 'dayjs';
import Decimal from 'decimal.js';

export function TransformBoolean() {
  return Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  });
}

export function TransformDateString() {
  return Transform(({ value }) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : value));
}

export function TransformDecimalToNumber() {
  return Transform(({ value }) => (value ? new Decimal(value).toNumber() : value));
}
