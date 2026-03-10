import type { BoxProps } from '@mui/material';

import { m } from 'framer-motion';

import { Box, Typography } from '@mui/material';

import { Image } from 'src/components/image';

// ----------------------------------------------------------------------

export function OrderEmptyState(props: BoxProps) {
  return (
    <Box
      component={m.div}
      {...props}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{
        py: 10,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...props.sx,
      }}
    >
      <Image
        src="/assets/icons/empty/ic-folder-empty.svg"
        sx={{ mb: 3, mx: 'auto', width: 160, height: 160 }}
      />
      <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
        暂无订单
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.disabled' }}>
        您还没有相关的租赁订单记录
      </Typography>
    </Box>
  );
}
