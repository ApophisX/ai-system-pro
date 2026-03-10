import type { Dayjs, OpUnitType } from 'dayjs';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

// ----------------------------------------------------------------------

/**
 * Day.js format reference:
 * https://day.js.org/docs/en/display/format
 */

/**
 * Timezone reference:
 * https://day.js.org/docs/en/timezone/set-default-timezone
 */

/**
 * UTC usage:
 * https://day.js.org/docs/en/plugin/utc
 * Example:
 * import utc from 'dayjs/plugin/utc';
 * dayjs.extend(utc);
 * dayjs().utc().format()
 */

dayjs.extend(duration);
dayjs.extend(relativeTime);

// ----------------------------------------------------------------------

export type DateInput = Dayjs | Date | string | number | null | undefined;

export const FORMAT_PATTERNS = {
  dateTimeZh: 'YYYY-MM-DD HH:mm', // 2022-04-17 12:00:00
  dateTime: 'DD MMM YYYY h:mm a', // 17 Apr 2022 12:00 am
  // date: 'DD MMM YYYY', // 17 Apr 2022
  date: 'YYYY/MM/DD', // 2022-04-17
  time: 'h:mm a', // 12:00 am
  split: {
    dateTime: 'DD/MM/YYYY h:mm a', // 17/04/2022 12:00 am
    date: 'DD/MM/YYYY', // 17/04/2022
  },
  paramCase: {
    dateTime: 'DD-MM-YYYY h:mm a', // 17-04-2022 12:00 am
    date: 'DD-MM-YYYY', // 17-04-2022
  },
};

const INVALID_DATE = 'Invalid';

// ----------------------------------------------------------------------

export function today(template?: string): string {
  return dayjs(new Date()).startOf('day').format(template);
}

// ----------------------------------------------------------------------

/**
 * Formats a date-time string.
 * @returns Formatted date-time string or 'Invalid'.
 * @example
 * fDateTime('17-04-2022') // '17 Apr 2022 12:00 am'
 */
export function fDateTime(input: DateInput, template = FORMAT_PATTERNS.dateTimeZh): string {
  if (!input) return '';

  const date = dayjs(input);
  if (!date.isValid()) return INVALID_DATE;

  return date.format(template);
}

// ----------------------------------------------------------------------

/**
 * Formats a date string.
 * @returns Formatted date string or 'Invalid'.
 * @example
 * fDate('17-04-2022') // '17 Apr 2022'
 */
export function fDate(input: DateInput, template = FORMAT_PATTERNS.date): string {
  if (!input) return '';

  const date = dayjs(input);
  if (!date.isValid()) return INVALID_DATE;

  return date.format(template);
}

// ----------------------------------------------------------------------

/**
 * Formats a time string.
 * @returns Formatted time string or 'Invalid'.
 * @example
 * fTime('2022-04-17T00:00:00') // '12:00 am'
 */
export function fTime(input: DateInput, template = FORMAT_PATTERNS.time): string {
  if (!input) return '';

  const date = dayjs(input);
  if (!date.isValid()) return INVALID_DATE;

  return date.format(template);
}

// ----------------------------------------------------------------------

/**
 * Converts a date input to timestamp.
 * @returns Timestamp in milliseconds or 'Invalid'.
 * @example
 * fTimestamp('2022-04-17') // 1650153600000
 */
export function fTimestamp(input: DateInput): number | string {
  if (!input) return '';

  const date = dayjs(input);
  if (!date.isValid()) return INVALID_DATE;

  return date.valueOf();
}

// ----------------------------------------------------------------------

/**
 * Returns relative time from now to the input.
 * @returns A relative time string.
 * @example
 * fToNow(dayjs().subtract(2, 'days')) // '2 days'
 */
export function fToNow(input: DateInput): string {
  if (!input) return '';

  const date = dayjs(input);
  if (!date.isValid()) return INVALID_DATE;

  // 如果大于 3天
  if (dayjs().diff(date, 'day') > 3) {
    return fDateTime(date);
  }

  return date.toNow(true) + '前';
}

// ----------------------------------------------------------------------

/**
 * Checks if a date is between two dates (inclusive).
 * @returns `true` if input is between start and end.
 * @example
 * fIsBetween('2024-01-02', '2024-01-01', '2024-01-03') // true
 */
export function fIsBetween(input: DateInput, start: DateInput, end: DateInput): boolean {
  if (!input || !start || !end) return false;

  const inputDate = dayjs(input);
  const startDate = dayjs(start);
  const endDate = dayjs(end);

  if (!inputDate.isValid() || !startDate.isValid() || !endDate.isValid()) {
    return false;
  }

  const inputValue = inputDate.valueOf();
  const startValue = startDate.valueOf();
  const endValue = endDate.valueOf();

  return (
    inputValue >= Math.min(startValue, endValue) && inputValue <= Math.max(startValue, endValue)
  );
}

// ----------------------------------------------------------------------

/**
 * Checks if one date is after another.
 * @returns `true` if start is after end.
 * @example
 * fIsAfter('2024-05-01', '2024-04-01') // true
 */
export function fIsAfter(start: DateInput, end: DateInput): boolean {
  if (!start || !end) return false;

  const startDate = dayjs(start);
  const endDate = dayjs(end);

  if (!startDate.isValid() || !endDate.isValid()) {
    return false;
  }

  return startDate.isAfter(endDate);
}

// ----------------------------------------------------------------------

/**
 * Checks if two dates are the same by a given unit.
 * @returns `true` if equal by unit.
 * @example
 * fIsSame('2024-04-01', '2024-05-01', 'year') // true
 * fIsSame('2024-04-01', '2023-05-01', 'year') // false
 */
export function fIsSame(start: DateInput, end: DateInput, unit: OpUnitType = 'year'): boolean {
  if (!start || !end) return false;

  const startDate = dayjs(start);
  const endDate = dayjs(end);

  if (!startDate.isValid() || !endDate.isValid()) {
    return false;
  }

  return startDate.isSame(endDate, unit);
}

// ----------------------------------------------------------------------

/**
 * Formats a compact label for a date range based on similarity.
 * @returns Formatted range label or 'Invalid'.
 * @example
 * fDateRangeShortLabel('2024-04-26', '2024-04-26') // '26 Apr 2024'
 * fDateRangeShortLabel('2024-04-25', '2024-04-26') // '25 - 26 Apr 2024'
 * fDateRangeShortLabel('2024-04-25', '2024-05-26') // '25 Apr - 26 May 2024'
 * fDateRangeShortLabel('2023-12-25', '2024-01-01') // '25 Dec 2023 - 01 Jan 2024'
 */
export function fDateRangeShortLabel(start: DateInput, end: DateInput, initial?: boolean): string {
  if (!start || !end) return '';

  const startDate = dayjs(start);
  const endDate = dayjs(end);

  if (!startDate.isValid() || !endDate.isValid() || startDate.isAfter(endDate)) {
    return INVALID_DATE;
  }

  if (initial) {
    return `${fDate(startDate)} - ${fDate(endDate)}`;
  }

  const isSameDay = startDate.isSame(endDate, 'day');
  const isSameMonth = startDate.isSame(endDate, 'month');
  const isSameYear = startDate.isSame(endDate, 'year');

  if (isSameDay) {
    return fDate(endDate);
  }

  if (isSameMonth) {
    return `${fDate(startDate, 'DD')} - ${fDate(endDate)}`;
  }

  if (isSameYear) {
    return `${fDate(startDate, 'DD MMM')} - ${fDate(endDate)}`;
  }

  return `${fDate(startDate)} - ${fDate(endDate)}`;
}

// ----------------------------------------------------------------------

/**
 * Adds duration to the current time.
 * @returns ISO formatted string with the result.
 * @example
 * fAdd({ days: 3 }) // '2025-08-08T12:34:56+00:00'
 */
export type DurationProps = {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
};

export function fAdd({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}: DurationProps): string {
  const result = dayjs()
    .add(
      dayjs.duration({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      })
    )
    .format();

  return result;
}

// ----------------------------------------------------------------------

/**
 * Subtracts duration from the current time.
 * @returns ISO formatted string with the result.
 * @example
 * fSub({ months: 1 }) // '2025-07-05T12:34:56+00:00'
 */
export function fSub({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}: DurationProps): string {
  const result = dayjs()
    .subtract(
      dayjs.duration({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      })
    )
    .format();

  return result;
}

// 格式化倒计时显示
export function formatCountdown(seconds: number, message: string, prefix: string = '') {
  if (seconds <= 0) {
    return message;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${prefix}${hours}小时${minutes.toString().padStart(2, '0')}分${secs.toString().padStart(2, '0')}秒`;
  }
  if (minutes > 0) {
    return `${prefix}${minutes.toString().padStart(2, '0')}分${secs.toString().padStart(2, '0')}秒`;
  }
  return `${prefix}${secs.toString().padStart(2, '0')}秒`;
}

/** 将秒数格式化为「X天」或「X小时」 */
export function fDurationSeconds(seconds: number | undefined): string {
  if (seconds === undefined || seconds === null) return '—';
  const hours = seconds / 60 / 60;
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}天`;
  }
  return `${Math.round(hours)}小时`;
}

/** 将分钟数格式化为「X分钟」/「X小时」/「X天」/「X天X小时X分钟」 */
export function fDurationMinutes(minutes: number | undefined): string {
  if (minutes === undefined || minutes === null || isNaN(minutes)) {
    return '—';
  }
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const days = Math.floor(minutes / 1440); // 1天 = 1440分钟
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = Math.floor(minutes % 60);

  if (days > 0) {
    if (hours > 0 || mins > 0) {
      let result = `${days}天`;
      if (hours > 0) result += `${hours}小时`;
      if (mins > 0) result += `${mins}分钟`;
      return result;
    }
    return `${days}天`;
  }

  if (hours > 0) {
    if (mins > 0) {
      return `${hours}小时${mins}分钟`;
    }
    return `${hours}小时`;
  }

  return `${mins}分钟`;
}
