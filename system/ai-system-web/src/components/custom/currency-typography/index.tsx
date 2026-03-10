import type { StackProps, TypographyProps } from '@mui/material';

import React, { useMemo } from 'react';

import { Stack, Typography } from '@mui/material';

import { fCurrency } from 'src/utils';

/**
 * 解析货币字符串，将 [¥12,345.78] 切分为 [prefix, integerPart, decimalPart]
 * 例如：'¥12,345.78' -> { prefix: '¥', integer: '12,345', decimal: '78' }
 */
function parseCurrency(currency: string): {
  prefix: string;
  integer: string;
  decimal: string | undefined;
} {
  const match = currency.match(/^([^\d,.]*)([\d,]*)(?:\.(\d+))?$/);
  if (!match) {
    return { prefix: '', integer: currency, decimal: undefined };
  }
  return {
    prefix: match[1] ?? '',
    integer: match[2] ?? '',
    decimal: match[3],
  };
}

export function CurrencyTypography({
  currency,
  color,
  slotProps,
  disableDivide = false,
  isNegative = false,
  showSign = false,
  fontSize = disableDivide ? 14 : 26,
  endAdornment,
}: {
  currency: number;
  fontSize?: number;
  color?: TypographyProps['color'];
  // 是否分割
  disableDivide?: boolean;
  isNegative?: boolean;
  showSign?: boolean;
  endAdornment?: React.ReactNode;
  slotProps?: {
    prefix?: TypographyProps;
    integer?: TypographyProps;
    decimal?: TypographyProps;
    wrapper?: StackProps;
  };
}) {
  const { prefix, integer, decimal } = useMemo(
    () => parseCurrency(fCurrency(currency)),
    [currency]
  );

  const prefixFontSize = fontSize - 12 > 12 ? fontSize - 12 : 12;
  const signFontSize = fontSize - 6 > 12 ? fontSize - 6 : 12;

  if (disableDivide) {
    return (
      <Typography
        component="div"
        variant="body2"
        color={color}
        {...slotProps?.integer}
        sx={{ fontWeight: 600, fontSize, ...slotProps?.integer?.sx }}
      >
        {isNegative && (
          <Typography
            component="span"
            variant="body2"
            color={color}
            sx={{ mr: 0.25, fontWeight: 600, fontSize }}
          >
            -
          </Typography>
        )}
        {showSign && (
          <Typography
            component="span"
            variant="body2"
            color={color}
            sx={{ mr: 0.25, fontWeight: 600, fontSize }}
          >
            {currency > 0 ? '+' : '-'}
          </Typography>
        )}
        {prefix}
        {integer}.{decimal}
      </Typography>
    );
  }

  return (
    <Stack
      direction="row"
      alignItems="baseline"
      flexWrap="nowrap"
      spacing={0.125}
      {...slotProps?.wrapper}
    >
      {isNegative && (
        <Typography variant="h5" color={color} sx={{ mr: 0.25, fontSize: signFontSize }}>
          -
        </Typography>
      )}
      {showSign && (
        <Typography
          variant="h5"
          color={color}
          sx={{ mr: 0.25, alignSelf: 'flex-end', fontSize: signFontSize }}
        >
          {currency > 0 ? '+' : '-'}
        </Typography>
      )}
      {prefix && (
        <Typography
          variant="caption"
          color={color}
          {...slotProps?.prefix}
          sx={{ fontWeight: 700, mr: 0.125, fontSize: prefixFontSize, ...slotProps?.prefix?.sx }}
        >
          {prefix}
        </Typography>
      )}
      <Typography
        variant="h3"
        color={color}
        {...slotProps?.integer}
        sx={{ lineHeight: 1, fontSize, ...slotProps?.integer?.sx }}
      >
        {integer}
      </Typography>
      {decimal !== undefined && (
        <Typography
          variant="caption"
          color={color}
          {...slotProps?.decimal}
          sx={{ fontWeight: 700, fontSize: prefixFontSize, ...slotProps?.decimal?.sx }}
        >
          .{decimal}
        </Typography>
      )}
      {endAdornment}
    </Stack>
  );
}
