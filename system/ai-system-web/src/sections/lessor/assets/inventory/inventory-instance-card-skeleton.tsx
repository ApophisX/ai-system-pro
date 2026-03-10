import React from 'react';

import { Stack, Skeleton, Box } from '@mui/material';

import {
  QuantityGrid,
  QuantityItem,
  BoundUserRow,
  InstanceCardRoot,
  InstanceCardHeader,
  InstanceCardBody,
} from './styled';

// ----------------------------------------------------------------------

export function InventoryInstanceCardSkeleton() {
  return (
    <InstanceCardRoot>
      <Stack spacing={1.5}>
        <InstanceCardHeader sx={{ alignItems: 'flex-start' }} >
          <Stack spacing={0} flex={1}>
            <Skeleton variant="text" width="40%" height={28} />
            <Skeleton variant="text" width="80%" height={28} />
          </Stack>
          <Skeleton variant="rounded" width={64} height={28} sx={{ borderRadius: 2 }} />
        </InstanceCardHeader>
        <InstanceCardBody>
          <BoundUserRow>
            <Skeleton variant="circular" width={40} height={40} sx={{ flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Skeleton variant="text" width="60%" height={22} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="45%" height={18} />
            </Box>
          </BoundUserRow>
          <QuantityGrid>
            {[1, 2, 3, 4].map((i) => (
              <QuantityItem key={i}>
                {/* <Skeleton variant="circular" width={18} height={18} sx={{ mx: 'auto', mb: 0.5 }} /> */}
                <Skeleton variant="text" width={32} height={28} sx={{ mx: 'auto' }} />
                <Skeleton variant="text" width={48} height={16} sx={{ mx: 'auto' }} />
              </QuantityItem>
            ))}
          </QuantityGrid>
        </InstanceCardBody>
      </Stack>
    </InstanceCardRoot>
  );
}
