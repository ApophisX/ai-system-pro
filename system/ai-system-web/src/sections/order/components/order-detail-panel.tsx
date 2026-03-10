import type { PaperProps } from '@mui/material';

import { FadeInPaper } from 'src/components/custom/fade-in-paper';

export function OrderDetailPanel({ children, ...props }: PaperProps) {
  return <FadeInPaper {...props}>{children}</FadeInPaper>;
}
