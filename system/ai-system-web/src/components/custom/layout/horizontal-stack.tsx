import type { StackProps } from '@mui/material';

import { Stack } from '@mui/material';

export function HorizontalStack({ children, ...props }: StackProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={2} {...props}>
      {children}
    </Stack>
  );
}
