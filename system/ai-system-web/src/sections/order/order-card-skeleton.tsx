import { Box, Paper, Stack, Divider, Skeleton } from '@mui/material';

// ----------------------------------------------------------------------

export function OrderCardSkeleton() {
  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Skeleton variant="text" width={120} height={20} />
        <Skeleton variant="text" width={60} height={20} />
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: 1.5 }} />
        <Stack spacing={1} sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width="80%" height={20} />
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="50%" height={16} />
        </Stack>
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Skeleton variant="text" width={100} height={24} />
      </Box>

      <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />

      <Stack direction="row" justifyContent="flex-end" spacing={1}>
        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 10 }} />
        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 10 }} />
      </Stack>
    </Paper>
  );
}
