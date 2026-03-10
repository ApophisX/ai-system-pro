import { Card, Stack, Skeleton, CardContent } from '@mui/material';

export function DepositAuditCardSkeleton() {
  return (
    <Card>
      <CardContent sx={{ py: 2, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Skeleton variant="text" width={140} height={24} />
            <Skeleton variant="rounded" width={60} height={24} />
          </Stack>
          <Skeleton variant="text" width="80%" height={20} />
          <Skeleton variant="text" width="60%" height={18} />
          <Stack direction="row" spacing={2}>
            <Skeleton variant="text" width={100} height={16} />
            <Skeleton variant="text" width={140} height={16} />
          </Stack>
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Skeleton variant="rounded" width={56} height={32} />
            <Skeleton variant="rounded" width={56} height={32} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
