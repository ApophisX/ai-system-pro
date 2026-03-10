import { Card, Stack, Skeleton, CardContent } from '@mui/material';

export function EnterpriseApplicationCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: 1 }} />
            <Stack spacing={0.5} sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={18} />
            </Stack>
          </Stack>
          <Stack spacing={1}>
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="90%" height={20} />
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
