import type { StackProps, TypographyProps } from '@mui/material';

import { useMemo } from 'react';

import { Stack, Typography } from '@mui/material';

import { fNumber } from 'src/utils/format-number';

export function AmountTypography(props: {
  amount: number;
  prefix?: string;
  unit?: string;
  color?: TypographyProps['color'];
  slotProps?: {
    prefix?: TypographyProps;
    amount?: TypographyProps;
    unit?: TypographyProps;
    wrapper?: StackProps;
  };
}) {
  const { amount, prefix = '￥', unit = '', color, slotProps } = props;

  const [amountTextInteger, amountTextDecimal] = useMemo(() => {
    const amountText = fNumber(amount).toString();
    const amountTextArray = amountText.split('.');
    return [amountTextArray[0], amountTextArray[1]];
  }, [amount]);

  return (
    <Stack
      direction="row"
      alignItems="baseline"
      flexWrap="nowrap"
      spacing={0.125}
      {...slotProps?.wrapper}
    >
      <Typography
        variant="caption"
        color={color}
        {...slotProps?.prefix}
        sx={{ color, fontWeight: 700, ...slotProps?.prefix?.sx }}
      >
        {prefix}
      </Typography>
      <Typography
        variant="h2"
        color={color}
        {...slotProps?.amount}
        sx={{ lineHeight: 1, ...slotProps?.amount?.sx }}
      >
        {amountTextInteger}
      </Typography>
      {amountTextDecimal && (
        <Typography
          variant="caption"
          color={color}
          {...slotProps?.prefix}
          sx={{ color, fontWeight: 700, ...slotProps?.prefix?.sx }}
        >
          .{amountTextDecimal}
        </Typography>
      )}
      {unit && (
        <Typography
          variant="caption"
          {...slotProps?.unit}
          sx={{ color: 'text.secondary', ml: 0.5, fontWeight: 600, ...slotProps?.unit?.sx }}
        >
          {unit}
        </Typography>
      )}
    </Stack>
  );
}
