import { Card, Stack, Skeleton, CardContent } from '@mui/material';

export function AdminAssetCardSkeleton() {
  return (
    <Card>
      <CardContent sx={{ py: 2, px: { xs: 2, sm: 3 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Skeleton variant="rounded" width={120} height={120} sx={{ flexShrink: 0 }} />
          <Stack sx={{ flex: 1, minWidth: 0 }} spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Skeleton variant="text" width="60%" height={28} />
              <Skeleton variant="rounded" width={64} height={24} />
            </Stack>
            <Skeleton variant="text" width="80%" height={20} />
            <Stack direction="row" spacing={1}>
              <Skeleton variant="rounded" width={56} height={22} />
              <Skeleton variant="rounded" width={56} height={22} />
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Skeleton variant="text" width={120} height={16} />
              <Skeleton variant="text" width={80} height={20} />
            </Stack>
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Skeleton variant="rounded" width={56} height={32} />
              <Skeleton variant="rounded" width={56} height={32} />
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
