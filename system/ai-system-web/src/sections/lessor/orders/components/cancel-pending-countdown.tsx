import type { StackProps, TypographyProps } from "@mui/material";
import type { OrderStatus } from "src/sections/order/utils/order-status";

import { useRef, useEffect } from "react";
import { useCountdownSeconds } from "minimal-shared/hooks";

import { Typography } from "@mui/material";

import { formatCountdown } from "src/utils/format-time";

import { Iconify } from "src/components/iconify";
import { HorizontalStack } from "src/components/custom/layout";


type Props = {
  seconds: number;
  status: OrderStatus
  onCountdownEnd?: () => void;
  showIcon?: boolean;
  slotProps?: {
    typography?: TypographyProps;
    root?: StackProps;
  };
}

export function CancelPendingCountdown({ seconds, status, onCountdownEnd, showIcon = true, slotProps, }: Props) {
  const { typography = {}, root = {} } = slotProps ?? {};
  const { value, reset: resetCountdown, start: startCountdown } = useCountdownSeconds(seconds);
  const first = useRef(true);

  // 当订单状态为待支付且有支付截止时间时，更新初始秒数并启动倒计时
  useEffect(() => {
    if (status === 'cancel_pending') {
      if (seconds > 0) {
        resetCountdown();
        startCountdown();
      }
    }
  }, [seconds, resetCountdown, startCountdown, status]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (value <= 0 && status === 'cancel_pending') {
      onCountdownEnd?.();
    }
  }, [value, onCountdownEnd, status]);


  if (status !== 'cancel_pending') {
    return null;
  }

  return (
    <HorizontalStack spacing={0.5} {...root}>
      {showIcon && <Iconify icon="solar:clock-circle-bold" width={14} sx={{ color: 'error.main' }} />}
      <Typography
        variant="caption"
        color="error.main"
        {...typography}
      >
        {formatCountdown(value, '已过期', '剩余：')}
      </Typography>
    </HorizontalStack>
  )
}