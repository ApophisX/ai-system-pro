import type { TypographyProps } from '@mui/material';

import { useState, useEffect } from 'react';
import { useCountdownSeconds } from 'minimal-shared/hooks';

import { Typography } from '@mui/material';

import { formatCountdown } from 'src/utils';

type Props = {
  expiredAt?: string;
} & TypographyProps;
export function CountdownTypography({ expiredAt, ...props }: Props) {
  // 倒计时 hook
  const [initialSeconds, setInitialSeconds] = useState(0);

  const {
    start: startCountdown,
    reset: resetCountdown,
    value: countdownValue,
  } = useCountdownSeconds(initialSeconds);

  useEffect(() => {
    if (expiredAt) {
      const expiredTime = new Date(expiredAt).getTime();
      const now = Date.now();
      const seconds = Math.max(0, Math.floor((expiredTime - now) / 1000) + 1);
      setInitialSeconds(seconds);
      if (seconds > 0) {
        resetCountdown();
        startCountdown();
      }
    }
  }, [expiredAt, resetCountdown, startCountdown]);

  return (
    <Typography
      variant="body2"
      {...props}
      sx={{
        color:
          countdownValue <= 0
            ? 'text.disabled'
            : countdownValue <= 60 * 5
              ? 'error.main'
              : 'warning.main',
        fontWeight: 'bold',
        ...props,
      }}
    >
      {formatCountdown(countdownValue, '已超时')}
    </Typography>
  );
}
