import { Stack, Typography } from '@mui/material';

import { fDateTime } from 'src/utils';

import { Iconify } from 'src/components/iconify';
import { HorizontalStack } from 'src/components/custom/layout';

export function TimeInfoItem({ label, value }: { label: string; value?: string }) {
  if (!value) {
    return null;
  }

  return (
    <HorizontalStack justifyContent="space-between">
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Iconify icon="solar:clock-circle-outline" width={18} />
        <Typography variant="body2">{label}</Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {fDateTime(value, 'YYYY-MM-DD HH:mm')}
      </Typography>
    </HorizontalStack>
  );
}
