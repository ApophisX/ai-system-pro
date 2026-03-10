import { Card, Stack, Skeleton, CardContent } from '@mui/material';

export function CommunityAuditCardSkeleton() {
  return (
    <Card>
      <Skeleton variant="rectangular" height={120} />
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="rounded" width={48} height={24} />
          </Stack>
          <Stack spacing={1}>
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="80%" height={20} />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Skeleton variant="text" width={60} height={18} />
            <Skeleton variant="text" width={60} height={18} />
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Skeleton variant="rounded" width={72} height={36} />
            <Skeleton variant="rounded" width={72} height={36} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
