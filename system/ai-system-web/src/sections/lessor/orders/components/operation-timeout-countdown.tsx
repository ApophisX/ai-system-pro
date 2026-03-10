import type { StackProps, TypographyProps } from "@mui/material";
import type { IconifyProps } from "src/components/iconify";

import { useRef, useEffect } from "react";
import { useCountdownSeconds } from "minimal-shared/hooks";

import { Typography } from "@mui/material";

import { formatCountdown } from "src/utils/format-time";

import { Iconify } from "src/components/iconify";
import { HorizontalStack } from "src/components/custom/layout";


type Props = {
  seconds: number;
  enabled: boolean;
  onCountdownEnd?: () => void;
  showIcon?: boolean;
  slotProps?: {
    typography?: TypographyProps;
    icon?: Partial<IconifyProps>;
    root?: StackProps;
  };
}


// 操作超时剩余倒计时
export function OperationTimeoutCountdown({ seconds, enabled, onCountdownEnd, showIcon = true, slotProps, }: Props) {
  const { typography = {}, root = {} } = slotProps ?? {};
  const { value, reset: resetCountdown, start: startCountdown } = useCountdownSeconds(seconds);
  const first = useRef(true);

  // 当订单状态为待支付且有支付截止时间时，更新初始秒数并启动倒计时
  useEffect(() => {
    if (enabled) {
      if (seconds > 0) {
        resetCountdown();
        startCountdown();
      }
    }
  }, [seconds, resetCountdown, startCountdown, enabled]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (value <= 0 && enabled) {
      onCountdownEnd?.();
    }
  }, [value, onCountdownEnd, enabled]);


  if (!enabled) {
    return null;
  }

  return (
    <Typography
      variant="caption"
      color="error.main"
      {...typography}
      sx={{
      }}
    >
      {showIcon && <Iconify icon="solar:clock-circle-bold"  {...slotProps?.icon} sx={{ color: 'error.main', ...slotProps?.icon?.sx }} />}
      {formatCountdown(value, '已过期', '剩余：')}
    </Typography>
  )
}