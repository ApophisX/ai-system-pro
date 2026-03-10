import { Box, Card, Stack, Skeleton } from '@mui/material';

export function IncomeSkeleton() {
  return (
    <Card>
      <Stack spacing={2} sx={{ p: 2 }}>
        {[...Array(5)].map((_, index) => (
          <Stack key={index} direction="row" justifyContent="space-between">
            <Stack direction="row" spacing={2}>
              <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 1 }} />
              <Box>
                <Skeleton variant="text" width={120} height={20} />
                <Skeleton variant="text" width={80} height={16} />
              </Box>
            </Stack>
            <Box>
              <Skeleton variant="text" width={60} height={20} />
              <Skeleton variant="text" width={40} height={16} />
            </Box>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}
