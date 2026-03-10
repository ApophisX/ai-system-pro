import { Card, Stack, Skeleton, CardContent } from '@mui/material';

export function AdminReportCardSkeleton() {
  return (
    <Card>
      <CardContent sx={{ py: 2, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="circular" width={40} height={40} />
            <Stack spacing={0.5} sx={{ flex: 1 }}>
              <Skeleton variant="text" width={120} height={24} />
              <Skeleton variant="text" width={180} height={20} />
            </Stack>
            <Skeleton variant="rounded" width={64} height={24} />
          </Stack>
          <Skeleton variant="text" width={80} height={20} />
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="80%" height={20} />
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" width={52} height={52} />
            <Skeleton variant="text" width={120} height={24} sx={{ alignSelf: 'center' }} />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" width={64} height={64} />
            <Skeleton variant="rounded" width={64} height={64} />
          </Stack>
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Skeleton variant="rounded" width={56} height={32} />
            <Skeleton variant="rounded" width={56} height={32} />
            <Skeleton variant="rounded" width={80} height={32} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
