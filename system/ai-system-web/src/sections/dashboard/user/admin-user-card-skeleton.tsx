import { Card, Stack, Skeleton, CardContent } from '@mui/material';

export function AdminUserCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="circular" width={48} height={48} />
            <Stack spacing={0.5} sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={24} />
              <Stack direction="row" spacing={1}>
                <Skeleton variant="rounded" width={48} height={22} />
                <Skeleton variant="rounded" width={40} height={22} />
              </Stack>
            </Stack>
          </Stack>
          <Stack spacing={1}>
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="60%" height={20} />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Skeleton variant="text" width={80} height={20} />
            <Skeleton variant="text" width={60} height={20} />
          </Stack>
          <Stack spacing={0.5}>
            <Skeleton variant="text" width={120} height={16} />
            <Skeleton variant="text" width={140} height={16} />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Skeleton variant="rounded" width={14} height={14} />
            <Skeleton variant="text" width={80} height={16} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
