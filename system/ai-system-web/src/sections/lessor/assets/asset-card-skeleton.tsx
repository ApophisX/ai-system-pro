import React from 'react';

import { Card, Stack, Skeleton } from '@mui/material';

// ----------------------------------------------------------------------

export function AssetCardSkeleton() {
  return (
    <Card sx={{ p: 1.5, display: 'flex', gap: 1.5 }}>
      <Skeleton
        variant="rectangular"
        sx={{ width: 100, height: 100, borderRadius: 1.5, flexShrink: 0 }}
      />

      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Skeleton variant="text" sx={{ width: '60%', height: 24 }} />
          <Skeleton variant="rounded" sx={{ width: 50, height: 20 }} />
        </Stack>

        <Skeleton variant="text" sx={{ width: '40%', height: 18, mb: 1 }} />

        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
          <Skeleton variant="text" sx={{ width: 40, height: 16 }} />
          <Skeleton variant="text" sx={{ width: 40, height: 16 }} />
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 'auto' }}
        >
          <Skeleton variant="text" sx={{ width: 80, height: 28 }} />
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" sx={{ width: 50, height: 30 }} />
            <Skeleton variant="rounded" sx={{ width: 50, height: 30 }} />
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
