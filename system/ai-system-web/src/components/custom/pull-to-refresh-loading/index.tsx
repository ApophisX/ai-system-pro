import type { StackProps } from '@mui/material';

import { Typography, CircularProgress } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { HorizontalStack } from '../layout';

export function PullToRefreshLoading() {
  return (
    <HorizontalStack spacing={1} justifyContent="center">
      <CircularProgress size={14} sx={{ color: 'text.disabled' }} />
      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
        加载中...
      </Typography>
    </HorizontalStack>
  );
}

export function PullingContent(props: StackProps) {
  return (
    <HorizontalStack spacing={1} justifyContent="center" {...props} sx={{ py: 2, ...props.sx }}>
      <Iconify
        icon="eva:arrow-downward-fill"
        width={14}
        height={14}
        sx={{ color: 'text.disabled' }}
      />
      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
        下拉刷新
      </Typography>
    </HorizontalStack>
  );
}
