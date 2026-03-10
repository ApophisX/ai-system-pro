import { Box, Card, Skeleton, Stack } from '@mui/material';

export function MessageCardSkeleton() {
  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" spacing={2}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="90%" height={20} />
          <Skeleton variant="text" width="30%" height={16} />
        </Box>
      </Stack>
    </Card>
  );
}
